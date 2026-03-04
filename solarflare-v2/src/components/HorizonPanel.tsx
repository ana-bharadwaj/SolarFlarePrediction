import { useEffect, useRef } from 'react'
import type { HorizonProbs, FlareClassIndex } from '../types'
import { CLASS_NAMES } from '../types'

interface Props {
  label:    '12h' | '24h' | '72h'
  probs:    HorizonProbs | null
  pred:     FlareClassIndex | null
  tss?:     number
  hss?:     number
  color:    string
  animDelay?: number
}

const CLASS_COLORS = ['#9CA3AF','#64B4FF','#FFD700','#FF9500','#FF3D3D']

export function HorizonPanel({ label, probs, pred, tss, hss, color, animDelay = 0 }: Props) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!probs) return
    const vals = [probs['No-flare'], probs.B, probs.C, probs.M, probs.X]
    const id = setTimeout(() => {
      barRefs.current.forEach((el, i) => {
        if (el) el.style.width = `${vals[i] * 100}%`
      })
    }, 150 + animDelay)
    return () => clearTimeout(id)
  }, [probs, animDelay])

  const vals = probs ? [probs['No-flare'], probs.B, probs.C, probs.M, probs.X] : [0,0,0,0,0]
  const predName = pred !== null ? CLASS_NAMES[pred] : '—'

  return (
    <div style={{
      background: '#0D1428',
      border: `1px solid ${color}33`,
      borderRadius: 14,
      padding: '20px 18px',
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
        background:`linear-gradient(90deg,transparent,${color},transparent)`, opacity:0.5 }} />

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color }}>
          {label}
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:11, color:'#374151', letterSpacing:2 }}>
            PREDICTED
          </div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:16, fontWeight:700,
            color: pred !== null ? CLASS_COLORS[pred] : '#4B5563' }}>
            {predName}
          </div>
        </div>
      </div>

      {/* Probability bars - directly from model softmax output */}
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {CLASS_NAMES.map((cls, i) => (
          <div key={cls}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
              <span style={{ fontFamily:"'Orbitron',monospace", fontSize:11,
                color: pred === i ? CLASS_COLORS[i] : '#4B5563',
                fontWeight: pred === i ? 700 : 400 }}>
                {cls === 'No-flare' ? 'No-flare' : cls}
              </span>
              <span style={{ fontSize:11, color:'#4B5563', fontFamily:"'Rajdhani',sans-serif" }}>
                {(vals[i] * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ height:5, background:'rgba(255,255,255,0.05)', borderRadius:3, overflow:'hidden' }}>
              <div
                ref={el => { barRefs.current[i] = el }}
                style={{
                  height:'100%', width:0, borderRadius:3,
                  background: CLASS_COLORS[i],
                  boxShadow: pred === i ? `0 0 8px ${CLASS_COLORS[i]}88` : 'none',
                  transition: `width 1.6s cubic-bezier(0.23,1,0.32,1) ${i*60}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* TSS / HSS skill scores from notebook compute_tss_hss() */}
      {(tss !== undefined || hss !== undefined) && (
        <div style={{ display:'flex', gap:10, marginTop:14 }}>
          {tss !== undefined && (
            <div style={{ flex:1, background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
              <div style={{ fontSize:10, letterSpacing:2, color:'#374151', marginBottom:3 }}>TSS</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:700,
                color: tss > 0.6 ? '#6ECB63' : tss > 0.3 ? '#FFD700' : '#FF9500' }}>
                {tss.toFixed(3)}
              </div>
            </div>
          )}
          {hss !== undefined && (
            <div style={{ flex:1, background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
              <div style={{ fontSize:10, letterSpacing:2, color:'#374151', marginBottom:3 }}>HSS</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:700,
                color: hss > 0.6 ? '#6ECB63' : hss > 0.3 ? '#FFD700' : '#FF9500' }}>
                {hss.toFixed(3)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
