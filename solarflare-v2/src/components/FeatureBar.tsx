import { useEffect, useRef } from 'react'

// Feature display metadata (descriptions match the notebook comments exactly)
const FEATURE_META: Record<string, { label: string; desc: string; importance: number }> = {
  R_VALUE:          { label:'R_VALUE',          desc:'Flux near polarity inversion line — most predictive',  importance: 0.94 },
  pil_strength:     { label:'pil_strength',      desc:'R_VALUE × SHRGT45 — derived PIL proxy',               importance: 0.88 },
  USFLUX:           { label:'USFLUX',            desc:'Total unsigned magnetic flux',                         importance: 0.82 },
  free_energy:      { label:'free_energy',       desc:'MEANPOT × USFLUX — free energy proxy',                importance: 0.79 },
  SHRGT45:          { label:'SHRGT45',           desc:'Fraction with shear angle > 45°',                     importance: 0.75 },
  gradient_index:   { label:'gradient_index',    desc:'Mean(MEANGBT, MEANGBZ, MEANGBH)',                     importance: 0.71 },
  MEANGBT:          { label:'MEANGBT',           desc:'Mean gradient of total field',                        importance: 0.68 },
  current_helicity: { label:'current_helicity',  desc:'MEANALP × TOTUSJZ — twist × current',                importance: 0.63 },
  TOTUSJZ:          { label:'TOTUSJZ',           desc:'Total unsigned vertical current',                     importance: 0.60 },
  MEANPOT:          { label:'MEANPOT',           desc:'Mean magnetic energy',                                importance: 0.57 },
  MEANGBZ:          { label:'MEANGBZ',           desc:'Mean gradient of vertical field',                     importance: 0.54 },
  MEANJZD:          { label:'MEANJZD',           desc:'Mean vertical current density',                       importance: 0.50 },
  MEANGBH:          { label:'MEANGBH',           desc:'Mean gradient of horizontal field',                   importance: 0.47 },
  MEANALP:          { label:'MEANALP',           desc:'Mean twist parameter alpha',                          importance: 0.44 },
  AREA_ACR:         { label:'AREA_ACR',          desc:'Sunspot area in active region (μHem)',                importance: 0.41 },
  xray_flux:        { label:'xray_flux',         desc:'GOES X-ray flux — original single feature',          importance: 0.38 },
  mag_class:        { label:'mag_class',         desc:'Magnetic class: 1=α 2=β 3=βγ 4=βγδ',                importance: 0.35 },
}

const ALL_FEATURES = [
  'R_VALUE','pil_strength','USFLUX','free_energy','SHRGT45',
  'gradient_index','MEANGBT','current_helicity','TOTUSJZ','MEANPOT',
  'MEANGBZ','MEANJZD','MEANGBH','MEANALP','AREA_ACR','xray_flux','mag_class',
]

const ORIG_FEATURES = new Set(['xray_flux'])
const DERIVED       = new Set(['pil_strength','free_energy','current_helicity','gradient_index','mag_class'])

export function FeatureBar() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const id = setTimeout(() => {
      barRefs.current.forEach((el, i) => {
        const feat = ALL_FEATURES[i]
        const imp  = FEATURE_META[feat]?.importance ?? 0
        if (el) el.style.width = `${imp * 100}%`
      })
    }, 200)
    return () => clearTimeout(id)
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {ALL_FEATURES.map((feat, i) => {
        const meta    = FEATURE_META[feat]
        const isOrig  = ORIG_FEATURES.has(feat)
        const isDeriv = DERIVED.has(feat)
        const color   = isOrig ? '#64B4FF' : isDeriv ? '#A78BFA' : '#FF9500'

        return (
          <div key={feat} style={{ display:'grid', gridTemplateColumns:'160px 1fr 40px', gap:10, alignItems:'center' }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:10, color, letterSpacing:0.5 }}>
                {meta.label}
              </div>
              <div style={{ fontSize:9, color:'#374151', letterSpacing:0.3, marginTop:1, lineHeight:1.2 }}>
                {meta.desc.slice(0,34)}{meta.desc.length>34?'…':''}
              </div>
            </div>
            <div style={{ height:8, background:'rgba(255,255,255,0.04)', borderRadius:4, overflow:'hidden' }}>
              <div
                ref={el => { barRefs.current[i] = el }}
                style={{
                  height:'100%', width:0, borderRadius:4,
                  background: color,
                  boxShadow: `0 0 6px ${color}66`,
                  transition: `width 1.4s cubic-bezier(0.23,1,0.32,1) ${i*30}ms`,
                }}
              />
            </div>
            <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, color:'#4B5563' }}>
              {(meta.importance * 100).toFixed(0)}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginTop:8, paddingTop:8, borderTop:'1px solid rgba(255,107,0,0.08)' }}>
        {[
          { color:'#64B4FF', label:'Original (notebook)' },
          { color:'#FF9500', label:'SHARP parameter' },
          { color:'#A78BFA', label:'Derived feature' },
        ].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:l.color }} />
            <span style={{ fontSize:11, color:'#4B5563', fontFamily:"'Rajdhani',sans-serif" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
