# AutoFlare — TypeScript Web App

Visualises the output of `AutoFlare_Improved.ipynb` in real-time.

## Setup

### 1. Train the model (run the notebook)
The last cell saves two files you need:
```
outputs/solar_transformer.pt   ← model weights
outputs/scaler.pkl             ← StandardScaler fitted on your data
```

### 2. Start the Flask API
```bash
pip install flask flask-cors torch numpy scikit-learn
python api/server.py
# → running on http://localhost:5000
```

### 3. Start the frontend
```bash
npm install
npm run dev
# → running on http://localhost:5173
```
Vite proxies `/api/*` → `http://localhost:5000` automatically.

---

## How the data flows

```
Notebook outputs/solar_transformer.pt
        ↓
api/server.py (Flask)          loads model + scaler
        ↓  POST /api/predict
src/api/client.ts              sends 40×16 feature window
        ↓
src/hooks/usePrediction.ts     polls every 10s, manages state
        ↓
src/App.tsx                    renders Dashboard / Features / Horizons / Evaluation
```

## API endpoints

| Endpoint        | Description |
|-----------------|-------------|
| `GET  /api/status`  | Whether model is loaded, feature list, seq_len |
| `POST /api/predict` | Send `{"features": [[40 rows × 16 cols]]}`, get probs for 12h/24h/72h |
| `GET  /api/demo`    | Returns realistic demo data — works without the model |

## Feature order (must match ALL_FEATURES in notebook)
```
xray_flux, USFLUX, MEANGBT, MEANGBZ, MEANGBH,
MEANJZD, TOTUSJZ, MEANALP, MEANPOT, SHRGT45, R_VALUE, AREA_ACR,
pil_strength, free_energy, current_helicity, gradient_index, mag_class
```

## Views
- **Dashboard** — animated solar disk + all 3 model head outputs + training curve
- **Features** — SHARP feature importance + architecture params
- **Horizons** — 12h / 24h / 72h probability bars + comparison table
- **Evaluation** — confusion matrices + TSS/HSS scores + imbalance strategies
