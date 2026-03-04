"""
api/server.py — Flask server that loads your trained AutoFlare model
and serves predictions to the TypeScript frontend.

Run with:
    pip install flask flask-cors torch numpy scikit-learn
    python api/server.py

The frontend (vite dev server) proxies /api/* → http://localhost:5000
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import torch
import torch.nn as nn
import pickle
import json
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)

# ─── Copy SolarFlareTransformer from your notebook ───────────────────────────
# These must match the architecture you trained with exactly.

class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=200, dropout=0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)
        pe = torch.zeros(max_len, d_model)
        pos = torch.arange(0, max_len).unsqueeze(1).float()
        div = torch.exp(torch.arange(0, d_model, 2).float() * (-np.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(pos * div)
        pe[:, 1::2] = torch.cos(pos * div)
        self.register_buffer('pe', pe.unsqueeze(0))

    def forward(self, x):
        return self.dropout(x + self.pe[:, :x.size(1)])


class SolarFlareTransformer(nn.Module):
    def __init__(self, n_features=16, d_model=128, n_heads=8,
                 n_layers=4, n_classes=5, n_horizons=3, dropout=0.1):
        super().__init__()
        self.input_proj = nn.Sequential(
            nn.Linear(n_features, d_model),
            nn.LayerNorm(d_model),
        )
        self.pos_enc = PositionalEncoding(d_model, dropout=dropout)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=n_heads,
            dim_feedforward=d_model * 4, dropout=dropout,
            batch_first=True, norm_first=True,
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)
        self.heads = nn.ModuleList([
            nn.Sequential(
                nn.Linear(d_model, d_model // 2),
                nn.GELU(),
                nn.Dropout(dropout),
                nn.Linear(d_model // 2, n_classes),
            )
            for _ in range(n_horizons)
        ])

    def forward(self, x):
        x = self.input_proj(x)
        x = self.pos_enc(x)
        x = self.transformer(x)
        x = x.mean(dim=1)
        return [head(x) for head in self.heads]


# ─── Feature order must match ALL_FEATURES in the notebook exactly ────────────
ALL_FEATURES = [
    'xray_flux',
    'USFLUX', 'MEANGBT', 'MEANGBZ', 'MEANGBH',
    'MEANJZD', 'TOTUSJZ', 'MEANALP', 'MEANPOT',
    'SHRGT45', 'R_VALUE', 'AREA_ACR',
    'pil_strength', 'free_energy', 'current_helicity',
    'gradient_index', 'mag_class',
]
CLASS_NAMES = ['No-flare', 'B', 'C', 'M', 'X']

# ─── Load model + scaler ──────────────────────────────────────────────────────
# These files are created by the last cell of your notebook.
DEVICE = 'cpu'

try:
    model = SolarFlareTransformer(n_features=16)
    model.load_state_dict(torch.load('outputs/solar_transformer.pt', map_location=DEVICE))
    model.eval()
    with open('outputs/scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    MODEL_LOADED = True
    print("✓ Model and scaler loaded from outputs/")
except FileNotFoundError:
    MODEL_LOADED = False
    print("⚠  outputs/solar_transformer.pt not found — running in demo mode")


def make_demo_prediction():
    """Returns realistic-looking demo data when no model is loaded."""
    return {
        "probs_12h": {"No-flare": 0.01, "B": 0.10, "C": 0.27, "M": 0.38, "X": 0.24},
        "probs_24h": {"No-flare": 0.03, "B": 0.15, "C": 0.32, "M": 0.31, "X": 0.19},
        "probs_72h": {"No-flare": 0.08, "B": 0.22, "C": 0.35, "M": 0.24, "X": 0.11},
        "pred_12h": 3,
        "pred_24h": 2,
        "pred_72h": 2,
        "tss_12h": 0.74, "hss_12h": 0.68,
        "tss_24h": 0.66, "hss_24h": 0.59,
        "tss_72h": 0.51, "hss_72h": 0.44,
        "train_loss": [1.42, 1.18, 0.97, 0.83, 0.72],
        "val_loss":   [1.51, 1.24, 1.04, 0.91, 0.80],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "demo_mode": True,
    }


# ─── /api/predict ─────────────────────────────────────────────────────────────
# Accepts a JSON body:
#   { "features": [[f1, f2, ..., f16], ...] }   ← 40 rows × 16 features
# Returns probabilities from all 3 model heads.

@app.route('/api/predict', methods=['POST'])
def predict():
    if not MODEL_LOADED:
        return jsonify(make_demo_prediction())

    data = request.get_json()
    if not data or 'features' not in data:
        return jsonify({'error': 'Provide {"features": [[...40 rows of 16 features...]]}'}), 400

    raw = np.array(data['features'], dtype=np.float32)  # (40, 16)
    if raw.shape != (40, 16):
        return jsonify({'error': f'Expected shape (40, 16), got {raw.shape}'}), 400

    scaled = scaler.transform(raw)                       # (40, 16)
    seq    = torch.tensor(scaled).unsqueeze(0)           # (1, 40, 16)

    with torch.no_grad():
        logits_list = model(seq)                         # 3 × (1, 5)
        probs_list  = [torch.softmax(l, dim=-1)[0].tolist() for l in logits_list]
        preds       = [int(torch.argmax(l, dim=-1)[0]) for l in logits_list]

    def to_dict(probs):
        return dict(zip(CLASS_NAMES, [round(p, 4) for p in probs]))

    return jsonify({
        "probs_12h": to_dict(probs_list[0]),
        "probs_24h": to_dict(probs_list[1]),
        "probs_72h": to_dict(probs_list[2]),
        "pred_12h":  preds[0],
        "pred_24h":  preds[1],
        "pred_72h":  preds[2],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "demo_mode": False,
    })


# ─── /api/status ─────────────────────────────────────────────────────────────
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        "model_loaded": MODEL_LOADED,
        "features":     ALL_FEATURES,
        "n_features":   len(ALL_FEATURES),
        "seq_len":      40,
        "horizons":     ["12h", "24h", "72h"],
        "classes":      CLASS_NAMES,
    })


# ─── /api/demo ────────────────────────────────────────────────────────────────
# Always returns demo data — useful for UI dev without the model
@app.route('/api/demo', methods=['GET'])
def demo():
    return jsonify(make_demo_prediction())


if __name__ == '__main__':
    app.run(debug=True, port=5000)
