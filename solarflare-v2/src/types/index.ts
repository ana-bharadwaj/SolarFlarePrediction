// ─────────────────────────────────────────────────────────────────────────────
// These types map 1-to-1 onto the notebook's data structures.
// Field names match the Python variable names exactly so the Flask
// API can pass data through with zero transformation.
// ─────────────────────────────────────────────────────────────────────────────

// Notebook: ALL_FEATURES list (16 features, same order)
export interface SharpFeatures {
  xray_flux:        number   // GOES X-ray flux (W/m²)
  USFLUX:           number   // Total unsigned magnetic flux
  MEANGBT:          number   // Mean gradient of total field
  MEANGBZ:          number   // Mean gradient of vertical field
  MEANGBH:          number   // Mean gradient of horizontal field
  MEANJZD:          number   // Mean vertical current density
  TOTUSJZ:          number   // Total unsigned vertical current
  MEANALP:          number   // Mean twist parameter alpha
  MEANPOT:          number   // Mean magnetic energy
  SHRGT45:          number   // Fraction with shear > 45°
  R_VALUE:          number   // Flux near polarity inversion line
  AREA_ACR:         number   // Sunspot area in active region
  pil_strength:     number   // Derived: R_VALUE * SHRGT45
  free_energy:      number   // Derived: MEANPOT * USFLUX
  current_helicity: number   // Derived: MEANALP * TOTUSJZ
  gradient_index:   number   // Derived: mean(MEANGBT, MEANGBZ, MEANGBH)
  mag_class:        number   // 1=α, 2=β, 3=βγ, 4=βγδ
}

// Notebook: label_flare_class() mapping
// 0=No-flare, 1=B, 2=C, 3=M, 4=X
export type FlareClassIndex = 0 | 1 | 2 | 3 | 4
export type FlareClass      = 'No-flare' | 'B' | 'C' | 'M' | 'X'
export const CLASS_NAMES: FlareClass[] = ['No-flare', 'B', 'C', 'M', 'X']
export const CLASS_LETTERS = ['A', 'B', 'C', 'M', 'X'] as const  // display labels

// Notebook: model output shape
// model(x) → [logits_12h, logits_24h, logits_72h]
// Each logits tensor → softmax → 5 probabilities
export interface HorizonProbs {
  'No-flare': number
  B:          number
  C:          number
  M:          number
  X:          number
}

// Full prediction response from Flask /api/predict
export interface PredictionResponse {
  // One probability array per horizon (softmax output of each head)
  probs_12h:   HorizonProbs
  probs_24h:   HorizonProbs
  probs_72h:   HorizonProbs
  // Predicted class index (argmax) per horizon
  pred_12h:    FlareClassIndex
  pred_24h:    FlareClassIndex
  pred_72h:    FlareClassIndex
  // TSS / HSS from eval_epoch (if running against test set)
  tss_12h?:    number
  hss_12h?:    number
  tss_24h?:    number
  hss_24h?:    number
  tss_72h?:    number
  hss_72h?:    number
  // Confusion matrix counts per horizon
  confusion_12h?: ConfusionMatrix
  confusion_24h?: ConfusionMatrix
  confusion_72h?: ConfusionMatrix
  // Training history (from notebook history dict)
  train_loss?: number[]
  val_loss?:   number[]
  // Timestamp
  timestamp:   string
}

// Notebook: confusion_matrix 5×5 array
export type ConfusionMatrix = number[][]

// Notebook: compute_tss_hss output
export interface SkillScores {
  TSS: number
  HSS: number
  TP:  number
  TN:  number
  FP:  number
  FN:  number
}

// Notebook: synthetic DataFrame row (one timestep of features)
export interface DataRow extends SharpFeatures {
  T_REC: string   // ISO timestamp
}

// Notebook: class_probs / class distribution
export interface ClassDistribution {
  'No-flare': number
  B:          number
  C:          number
  M:          number
  X:          number
}

// UI-only types
export type View = 'dashboard' | 'features' | 'horizons' | 'evaluation'

export interface FluxPoint {
  time:     string
  flux:     number
  logFlux:  number    // log10(flux) for chart Y axis
  forecast: boolean
  cls?:     string
}
