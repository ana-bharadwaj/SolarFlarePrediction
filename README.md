#  Solar Flare Prediction 

Predicts solar flares 12h, 24h, and 72h ahead using a Transformer model trained on NASA magnetogram data. Built as an improvement on a baseline LSTM notebook.

## What I improved

The original notebook (`AutoFlare.ipynb`) used a single GOES X-ray flux reading and a basic LSTM to predict flares as binary (yes/no). 

Here's what changed:

**1. Way more input data**
Went from 1 feature (X-ray flux) to 17 — adding NASA SHARP magnetogram parameters like magnetic flux, shear angle, and polarity inversion line strength. These are the signals space weather forecasters actually look at.

**2. Transformer instead of LSTM**
Self-attention handles long-range patterns better than LSTM — like connecting a flux emergence event hours earlier to current shear buildup. The model looks back over 40 timesteps (8 hours) at once.

**3. Actually handles rare flares**
X-class flares are ~1000× rarer than quiet periods. The original model just ignored them. Fixed with SMOTE oversampling + Focal Loss + class weights so M/X flares get real gradient signal.

**4. Three forecasts at once**
Instead of one fixed prediction window, the model now outputs 12h, 24h, and 72h forecasts simultaneously from three output heads — trained with weighted loss since longer horizons are harder.

---

## Stack

- **Model** — PyTorch Temporal Transformer (~1.4M params)
- **Backend** — Flask API serving predictions from saved `.pt` weights
- **Frontend** — React + TypeScript + Vite + Recharts

---

## Running it

```bash
# 1. Train the model (run AutoFlare_Improved.ipynb first)
#    → outputs/solar_transformer.pt + scaler.pkl

# 2. Start Flask
pip install flask flask-cors torch scikit-learn pandas
python api/server.py

# 3. Start the frontend (new terminal)
npm install && npm run dev
# → http://localhost:5173
```

If Flask isn't running the app automatically switches to demo mode.

```
