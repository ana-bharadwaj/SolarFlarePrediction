import type { PredictionResponse, SharpFeatures } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Typed wrappers around the Flask API defined in api/server.py
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiStatus {
  model_loaded: boolean
  features:     string[]
  n_features:   number
  seq_len:      number
  horizons:     string[]
  classes:      string[]
}

/** Check if the Flask server is running and whether the model is loaded */
export async function fetchStatus(): Promise<ApiStatus> {
  const res = await fetch('/api/status')
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`)
  return res.json()
}

/**
 * Send 40 timesteps of feature data to the model.
 *
 * featureWindow: array of 40 SharpFeatures objects (one per 12-min step),
 * in chronological order (oldest first).
 *
 * Maps to notebook:
 *   new_seq = scaler.transform(raw_features).reshape(1, 40, 16)
 *   logits_12h, logits_24h, logits_72h = model(new_seq)
 */
export async function fetchPrediction(
  featureWindow: SharpFeatures[]
): Promise<PredictionResponse> {
  if (featureWindow.length !== 40) {
    throw new Error(`Expected 40 timesteps, got ${featureWindow.length}`)
  }

  // Convert to 2D array in ALL_FEATURES order (must match notebook)
  const ALL_FEATURES = [
    'xray_flux', 'USFLUX', 'MEANGBT', 'MEANGBZ', 'MEANGBH',
    'MEANJZD', 'TOTUSJZ', 'MEANALP', 'MEANPOT',
    'SHRGT45', 'R_VALUE', 'AREA_ACR',
    'pil_strength', 'free_energy', 'current_helicity',
    'gradient_index', 'mag_class',
  ] as const

  const features = featureWindow.map(row =>
    ALL_FEATURES.map(k => row[k as keyof SharpFeatures] ?? 0)
  )

  const res = await fetch('/api/predict', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ features }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? `Prediction failed: ${res.status}`)
  }
  return res.json()
}

/**
 * Fetch demo predictions (works without the model loaded).
 * Used as fallback when Flask isn't running.
 */
export async function fetchDemo(): Promise<PredictionResponse> {
  const res = await fetch('/api/demo')
  if (!res.ok) throw new Error('Demo endpoint unavailable')
  return res.json()
}

// ─── NOAA real-time data (no auth required) ───────────────────────────────────
// These fetch live solar data to build the 40-step feature window
// when real JSOC SHARP data isn't available.

export interface GoesXrayPoint {
  time_tag:      string
  satellite:     number
  flux:          number   // W/m²  ← this is xray_flux in the notebook
  observed_flux: number
  is_flare:      boolean
}

export async function fetchGoesXray(): Promise<GoesXrayPoint[]> {
  // Free NOAA endpoint — 1-day of 1-minute X-ray flux data
  const res = await fetch(
    'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json'
  )
  if (!res.ok) throw new Error('NOAA GOES fetch failed')
  return res.json()
}

export interface SolarWindPoint {
  time_tag:    string
  speed:       number   // km/s
  density:     number   // p/cm³
  temperature: number   // K
}

export async function fetchSolarWind(): Promise<SolarWindPoint[]> {
  const res = await fetch(
    'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json'
  )
  if (!res.ok) throw new Error('NOAA solar wind fetch failed')
  const raw: string[][] = await res.json()
  return raw.slice(1).map(row => ({
    time_tag:    row[0],
    speed:       parseFloat(row[2]),
    density:     parseFloat(row[1]),
    temperature: parseFloat(row[3]),
  }))
}
