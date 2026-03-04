import { useState } from 'react'
import { SunCanvas }           from './components/SunCanvas'
import { HorizonPanel }        from './components/HorizonPanel'
import { TrainingCurve }       from './components/TrainingCurve'
import { ConfusionMatrixView } from './components/ConfusionMatrixView'
import { FeatureBar }          from './components/FeatureBar'
import { ConnectionBadge }     from './components/ConnectionBadge'
import { usePrediction }       from './hooks/usePrediction'
import type { View } from './types'
import { CLASS_NAMES } from './types'

const HORIZON_COLORS = { '12h':'#FF9500', '24h':'#64B4FF', '72h':'#A78BFA' }
const CLASS_COLORS   = ['#9CA3AF','#64B4FF','#FFD700','#FF9500','#FF3D3D']

const NAV: { id: View; label: string }[] = [
  { id:'dashboard',  label:'Dashboard'   },
  { id:'features',   label:'Features'    },
  { id:'horizons',   label:'Horizons'    },
  { id:'evaluation', label:'Evaluation'  },
]

function Panel({ children, title, style }: { children: React.ReactNode; title?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ background:'#0D1428', border:'1px solid rgba(255,107,0,0.20)',
      borderRadius:16, padding:'22px 22px 20px', position:'relative', overflow:'hidden', ...style }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
        background:'linear-gradient(90deg,transparent,rgba(255,107,0,0.5),transparent)' }} />
      {title && <div style={{ fontFamily:"'Orbitron',monospace", fontSize:10, letterSpacing:3,
        color:'#374151', textTransform:'uppercase', marginBottom:16 }}>{title}</div>}
      {children}
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
      <span style={{ fontFamily:"'Orbitron',monospace", fontSize:10, letterSpacing:3,
        color:'#374151', textTransform:'uppercase', whiteSpace:'nowrap' }}>{title}</span>
      <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(255,107,0,0.3),transparent)' }} />
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const {
    prediction, connectionState, modelLoaded,
    lastFetch, isRefreshing, isLive,
    refresh, setLive,
  } = usePrediction(10_000)

  const p = prediction

  const probs12h = p?.probs_12h ?? null
  const probs24h = p?.probs_24h ?? null
  const probs72h = p?.probs_72h ?? null
  const pred12h  = p?.pred_12h  ?? null
  const pred24h  = p?.pred_24h  ?? null
  const pred72h  = p?.pred_72h  ?? null

  const domClass = pred12h !== null ? CLASS_NAMES[pred12h] : '—'
  const domColor = pred12h !== null ? CLASS_COLORS[pred12h] : '#4B5563'
  const domProb  = pred12h !== null && probs12h
    ? Object.values(probs12h)[pred12h] : 0

  return (
    <div style={{ minHeight:'100vh', background:'#04070f', color:'#E8EAF0',
      fontFamily:"'Rajdhani',sans-serif", overflowX:'hidden' }}>

      {/* Stars */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
        background:`
          radial-gradient(1px 1px at 8%  12%, rgba(255,255,255,.55) 0%, transparent 100%),
          radial-gradient(1px 1px at 22% 38%, rgba(255,255,255,.35) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 48% 8%, rgba(255,255,255,.45) 0%, transparent 100%),
          radial-gradient(1px 1px at 68% 28%, rgba(255,255,255,.30) 0%, transparent 100%),
          radial-gradient(1px 1px at 83% 58%, rgba(255,255,255,.45) 0%, transparent 100%),
          radial-gradient(1px 1px at 38% 68%, rgba(255,255,255,.35) 0%, transparent 100%),
          radial-gradient(1px 1px at 88% 82%, rgba(255,255,255,.30) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 13% 88%, rgba(255,200,120,.35) 0%, transparent 100%),
          radial-gradient(1px 1px at 58% 4%,  rgba(255,255,255,.40) 0%, transparent 100%)
        `}} />

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <header style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'14px 36px',
        borderBottom:'1px solid rgba(255,107,0,0.18)',
        background:'linear-gradient(180deg,rgba(255,107,0,0.04) 0%,transparent 100%)' }}>

        

        <nav style={{ display:'flex', gap:4 }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setView(item.id)} style={{
              fontFamily:"'Rajdhani',sans-serif", fontSize:13, letterSpacing:1.5,
              padding:'6px 16px', borderRadius:8, cursor:'pointer', transition:'all 0.15s ease',
              border: view===item.id ? '1px solid rgba(255,107,0,0.5)' : '1px solid transparent',
              background: view===item.id ? 'rgba(255,107,0,0.10)' : 'transparent',
              color: view===item.id ? '#FF9500' : '#374151',
            }}>
              {item.label.toUpperCase()}
            </button>
          ))}
        </nav>

        <ConnectionBadge
          state={connectionState} modelLoaded={modelLoaded}
          lastFetch={lastFetch} isRefreshing={isRefreshing}
          onRefresh={refresh} isLive={isLive} onToggleLive={() => setLive(!isLive)}
        />
      </header>

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <main style={{ position:'relative', zIndex:5, padding:'26px 36px 40px',
        maxWidth:1600, margin:'0 auto' }}>

        {connectionState === 'demo' && (
          <div style={{ background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.28)',
            borderRadius:12, padding:'14px 20px', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <span style={{ fontSize:16 }}>⚠</span>
              <span style={{ fontFamily:"'Orbitron',monospace", fontSize:11,
                letterSpacing:2, color:'#FFD700' }}>DEMO MODE — FLASK NOT CONNECTED</span>
            </div>
            <div style={{ fontSize:13, color:'#6B7280', fontFamily:"'Rajdhani',sans-serif", lineHeight:1.8 }}>
              The app calls Flask directly on{' '}
              <code style={{ background:'rgba(255,255,255,0.07)', padding:'1px 8px', borderRadius:4,
                fontFamily:'monospace', color:'#FF9500' }}>http://localhost:5000</code>.
              {' '}Make sure the server is running:<br />
              <code style={{ background:'rgba(255,255,255,0.06)', padding:'3px 10px', borderRadius:5,
                fontFamily:'monospace', color:'#6ECB63', fontSize:12, display:'inline-block', marginTop:4 }}>
                pip install flask flask-cors torch scikit-learn &amp;&amp; python api/server.py
              </code><br />
              Then check your terminal says{' '}
              <code style={{ background:'rgba(255,255,255,0.07)', padding:'1px 8px', borderRadius:4,
                fontFamily:'monospace', color:'#64B4FF' }}>Listening on http://localhost:5000</code>
              {' '}and click{' '}
              <b style={{ color:'#FF9500' }}>↻</b> to reconnect.
            </div>
          </div>
        )}

        {/* ── ERROR BANNER ── */}
        {connectionState === 'error' && (
          <div style={{ background:'rgba(255,61,61,0.05)', border:'1px solid rgba(255,61,61,0.28)',
            borderRadius:12, padding:'12px 18px', marginBottom:20,
            display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:16 }}>✕</span>
            <span style={{ fontSize:13, color:'#FF5555', fontFamily:"'Rajdhani',sans-serif" }}>
              Connection error — Flask is running but returned an unexpected response.
              Click ↻ to retry.
            </span>
          </div>
        )}

        {/* ══ DASHBOARD ════════════════════════════════════════════ */}
        {view === 'dashboard' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:20, marginBottom:20 }}>

              {/* Animated Sun */}
              <Panel style={{ display:'flex', flexDirection:'column', alignItems:'center',
                gap:14, padding:'28px 32px',
                background:'radial-gradient(ellipse at center,rgba(255,107,0,0.04) 0%,transparent 70%)' }}>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:3, color:'#374151' }}>
                  SOLAR DISK
                </div>
                <SunCanvas probs12h={probs12h} size={260} />
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:"'Orbitron',monospace", fontSize:28, fontWeight:900,
                    color:domColor, textShadow:`0 0 20px ${domColor}88`, lineHeight:1 }}>
                    {domClass}
                  </div>
                  <div style={{ fontSize:11, color:'#374151', letterSpacing:2, marginTop:2 }}>
                    12H PREDICTION · {(domProb*100).toFixed(0)}% CONFIDENCE
                  </div>
                </div>
              </Panel>

              {/* 3 horizon head outputs */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:10, letterSpacing:3, color:'#374151' }}>
                  MULTI-HORIZON FORECAST — TRANSFORMER HEAD OUTPUTS
                </div>
                <div style={{ display:'flex', gap:14, flex:1 }}>
                  <HorizonPanel label="12h" probs={probs12h} pred={pred12h}
                    tss={p?.tss_12h} hss={p?.hss_12h} color={HORIZON_COLORS['12h']} animDelay={0} />
                  <HorizonPanel label="24h" probs={probs24h} pred={pred24h}
                    tss={p?.tss_24h} hss={p?.hss_24h} color={HORIZON_COLORS['24h']} animDelay={100} />
                  <HorizonPanel label="72h" probs={probs72h} pred={pred72h}
                    tss={p?.tss_72h} hss={p?.hss_72h} color={HORIZON_COLORS['72h']} animDelay={200} />
                </div>
              </div>
            </div>

            <Panel title="Training Curve — Focal Loss (from notebook history)" style={{ marginBottom:20 }}>
              <TrainingCurve trainLoss={p?.train_loss} valLoss={p?.val_loss} />
            </Panel>

            <SectionHeader title="GOES Flare Class Scale" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
              {[
                { cls:'A/No-flare', flux:'< 10⁻⁷',   desc:'Background noise',         color:'#9CA3AF' },
                { cls:'B',          flux:'10⁻⁷–10⁻⁶', desc:'Very minor',               color:'#64B4FF' },
                { cls:'C',          flux:'10⁻⁶–10⁻⁵', desc:'Minor, small effects',     color:'#FFD700' },
                { cls:'M',          flux:'10⁻⁵–10⁻⁴', desc:'Moderate, radio blackout', color:'#FF9500' },
                { cls:'X',          flux:'> 10⁻⁴',    desc:'Extreme, major impact',    color:'#FF3D3D' },
              ].map((item, i) => {
                const isActive = pred12h === i
                return (
                  <div key={item.cls} style={{
                    background: isActive
                      ? `rgba(${item.color.slice(1).match(/.{2}/g)!.map(h=>parseInt(h,16)).join(',')},0.12)`
                      : '#0D1428',
                    border:`1px solid ${isActive ? item.color+'66' : 'rgba(255,107,0,0.15)'}`,
                    borderRadius:12, padding:'14px', transition:'all 0.3s ease',
                    boxShadow: isActive ? `0 0 20px ${item.color}22` : 'none',
                  }}>
                    <div style={{ fontFamily:"'Orbitron',monospace", fontSize:22, fontWeight:900,
                      color:item.color, marginBottom:4,
                      textShadow: isActive ? `0 0 16px ${item.color}` : 'none' }}>
                      {item.cls}
                    </div>
                    <div style={{ fontFamily:"'Orbitron',monospace", fontSize:10,
                      color:'#374151', marginBottom:6 }}>{item.flux} W/m²</div>
                    <div style={{ fontSize:12, color:'#4B5563', fontFamily:"'Rajdhani',sans-serif" }}>
                      {item.desc}
                    </div>
                    {isActive && (
                      <div style={{ marginTop:8, fontSize:10, color:item.color,
                        fontFamily:"'Orbitron',monospace", letterSpacing:1.5 }}>← PREDICTED</div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ══ FEATURES ═════════════════════════════════════════════ */}
        {view === 'features' && (
          <>
            <SectionHeader title="SHARP Magnetogram Features — From Notebook ALL_FEATURES" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <Panel title="Feature Importance (estimated)">
                <FeatureBar />
              </Panel>
              <Panel title="Feature Groups">
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[
                    { group:'Original (1 feature)', color:'#64B4FF',
                      features:['xray_flux'],
                      note:'The only feature in the original notebook before improvements' },
                    { group:'SHARP Parameters (11)', color:'#FF9500',
                      features:['USFLUX','MEANGBT','MEANGBZ','MEANGBH','MEANJZD','TOTUSJZ','MEANALP','MEANPOT','SHRGT45','R_VALUE','AREA_ACR'],
                      note:'Fetched from NASA JSOC via drms at 12-min cadence' },
                    { group:'Derived Features (5)', color:'#A78BFA',
                      features:['pil_strength','free_energy','current_helicity','gradient_index','mag_class'],
                      note:'Computed by add_polarity_features() in the notebook' },
                  ].map(g => (
                    <div key={g.group} style={{ background:'rgba(255,255,255,0.02)',
                      border:`1px solid ${g.color}22`, borderRadius:10, padding:'14px 16px' }}>
                      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:12,
                        fontWeight:700, color:g.color, marginBottom:6 }}>{g.group}</div>
                      <div style={{ fontSize:12, color:'#4B5563', marginBottom:10,
                        fontFamily:"'Rajdhani',sans-serif" }}>{g.note}</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {g.features.map(f => (
                          <span key={f} style={{
                            background:`${g.color}18`, border:`1px solid ${g.color}33`,
                            borderRadius:5, padding:'2px 8px', fontSize:11,
                            fontFamily:"'Orbitron',monospace", color:g.color }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div style={{ marginTop:20 }}>
              <SectionHeader title="Model Architecture — From Notebook Cell 8" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
                {[
                  { label:'SEQ_LEN',    value:'40',    desc:'40 steps × 12min = 8h look-back' },
                  { label:'N_FEATURES', value:'16',    desc:'ALL_FEATURES list length' },
                  { label:'D_MODEL',    value:'128',   desc:'Transformer hidden dimension' },
                  { label:'N_HEADS',    value:'8',     desc:'Attention heads' },
                  { label:'N_LAYERS',   value:'4',     desc:'TransformerEncoder layers' },
                  { label:'N_CLASSES',  value:'5',     desc:'No-flare, B, C, M, X' },
                  { label:'N_HORIZONS', value:'3',     desc:'12h, 24h, 72h heads' },
                  { label:'PARAMS',     value:'~1.4M', desc:'Trainable parameters' },
                ].map(item => (
                  <Panel key={item.label} style={{ padding:'14px 16px' }}>
                    <div style={{ fontFamily:"'Orbitron',monospace", fontSize:10,
                      color:'#374151', letterSpacing:2, marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontFamily:"'Orbitron',monospace", fontSize:22,
                      fontWeight:700, color:'#FF9500', marginBottom:4 }}>{item.value}</div>
                    <div style={{ fontSize:11, color:'#4B5563', fontFamily:"'Rajdhani',sans-serif" }}>
                      {item.desc}
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ HORIZONS ═════════════════════════════════════════════ */}
        {view === 'horizons' && (
          <>
            <SectionHeader title="Multi-Horizon Predictions — All 3 Model Head Outputs" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom:24 }}>
              <HorizonPanel label="12h" probs={probs12h} pred={pred12h}
                tss={p?.tss_12h} hss={p?.hss_12h} color={HORIZON_COLORS['12h']} />
              <HorizonPanel label="24h" probs={probs24h} pred={pred24h}
                tss={p?.tss_24h} hss={p?.hss_24h} color={HORIZON_COLORS['24h']} />
              <HorizonPanel label="72h" probs={probs72h} pred={pred72h}
                tss={p?.tss_72h} hss={p?.hss_72h} color={HORIZON_COLORS['72h']} />
            </div>

            <Panel title="Probability Comparison — All Horizons × All Classes">
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse',
                  fontFamily:"'Rajdhani',sans-serif", fontSize:13 }}>
                  <thead>
                    <tr>
                      <th style={{ padding:'8px 12px', textAlign:'left', color:'#374151',
                        fontFamily:"'Orbitron',monospace", fontSize:10, letterSpacing:2,
                        borderBottom:'1px solid rgba(255,107,0,0.15)' }}>CLASS</th>
                      {(['12h','24h','72h'] as const).map(h => (
                        <th key={h} style={{ padding:'8px 12px', textAlign:'center',
                          color:HORIZON_COLORS[h], fontFamily:"'Orbitron',monospace",
                          fontSize:12, letterSpacing:2,
                          borderBottom:'1px solid rgba(255,107,0,0.15)' }}>{h}</th>
                      ))}
                      <th style={{ padding:'8px 12px', textAlign:'center', color:'#374151',
                        fontFamily:"'Orbitron',monospace", fontSize:10, letterSpacing:1,
                        borderBottom:'1px solid rgba(255,107,0,0.15)' }}>TREND</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLASS_NAMES.map((cls, i) => {
                      const v12 = probs12h ? Object.values(probs12h)[i] : 0
                      const v24 = probs24h ? Object.values(probs24h)[i] : 0
                      const v72 = probs72h ? Object.values(probs72h)[i] : 0
                      const trend = v72 > v12 ? '↑ Rising' : v72 < v12 ? '↓ Falling' : '→ Stable'
                      const trendColor = v72 > v12 ? '#FF5555' : v72 < v12 ? '#6ECB63' : '#4B5563'
                      return (
                        <tr key={cls} style={{ borderBottom:'1px solid rgba(255,107,0,0.06)' }}>
                          <td style={{ padding:'10px 12px' }}>
                            <span style={{ fontFamily:"'Orbitron',monospace", fontSize:12,
                              color:CLASS_COLORS[i] }}>{cls}</span>
                          </td>
                          {[v12,v24,v72].map((v,j) => (
                            <td key={j} style={{ padding:'10px 12px', textAlign:'center' }}>
                              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                                <div style={{ width:50, height:4, background:'rgba(255,255,255,0.05)',
                                  borderRadius:2, overflow:'hidden' }}>
                                  <div style={{ height:'100%', width:`${v*100}%`,
                                    background:CLASS_COLORS[i], borderRadius:2 }} />
                                </div>
                                <span style={{ color:'#9CA3AF', fontSize:12, minWidth:40 }}>
                                  {(v*100).toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          ))}
                          <td style={{ padding:'10px 12px', textAlign:'center',
                            fontSize:12, color:trendColor }}>{trend}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}

        {/* ══ EVALUATION ═══════════════════════════════════════════ */}
        {view === 'evaluation' && (
          <>
            <SectionHeader title="Model Evaluation — Notebook compute_tss_hss() Output" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom:20 }}>
              {(['12h','24h','72h'] as const).map(h => {
                const key    = `confusion_${h}` as 'confusion_12h'|'confusion_24h'|'confusion_72h'
                const tssKey = `tss_${h}` as 'tss_12h'|'tss_24h'|'tss_72h'
                const hssKey = `hss_${h}` as 'hss_12h'|'hss_24h'|'hss_72h'
                const matrix = p?.[key] ?? Array(5).fill(null).map((_,r) =>
                  Array(5).fill(0).map((_,c) => r===c ? 10+r*5 : r))
                return (
                  <Panel key={h}>
                    <ConfusionMatrixView
                      matrix={matrix} horizon={h}
                      tss={p?.[tssKey]} hss={p?.[hssKey]}
                    />
                  </Panel>
                )
              })}
            </div>

            <Panel title="Training History — history['train_loss'] + history['val_loss']">
              <TrainingCurve trainLoss={p?.train_loss} valLoss={p?.val_loss} />
            </Panel>

            <div style={{ marginTop:20 }}>
              <SectionHeader title="Class Imbalance Strategy — From Notebook Cell 6" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                {[
                  { title:'SMOTE', color:'#6ECB63',
                    desc:'Applied to training set only (after train/test split). k_neighbors = max(1, min(5, min_class_size−1)). Balances all 5 classes.' },
                  { title:'Focal Loss', color:'#FF9500',
                    desc:'FocalLoss(gamma=2.0, alpha=class_weights). Down-weights easy no-flare examples so the model focuses on rare M/X flares.' },
                  { title:'Class Weights', color:'#A78BFA',
                    desc:"compute_class_weight('balanced') → inverse frequency weights passed as alpha to FocalLoss. X flares get ~10× gradient signal." },
                ].map(item => (
                  <Panel key={item.title} style={{ padding:'16px 18px' }}>
                    <div style={{ fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700,
                      color:item.color, marginBottom:8 }}>{item.title}</div>
                    <div style={{ fontSize:13, color:'#4B5563', lineHeight:1.6,
                      fontFamily:"'Rajdhani',sans-serif" }}>{item.desc}</div>
                  </Panel>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes pulseCore {
          0%,100% { box-shadow: 0 0 18px rgba(255,180,0,.75), 0 0 36px rgba(255,100,0,.35); }
          50%      { box-shadow: 0 0 28px rgba(255,200,0,1),   0 0 55px rgba(255,130,0,.5); }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%      { opacity:0.25; }
        }
      `}</style>
    </div>
  )
}