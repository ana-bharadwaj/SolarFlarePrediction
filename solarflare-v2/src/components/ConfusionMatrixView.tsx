import type { ConfusionMatrix } from '../types'
import { CLASS_NAMES } from '../types'

interface Props {
  matrix:  ConfusionMatrix
  horizon: string
  tss?:    number
  hss?:    number
}

export function ConfusionMatrixView({ matrix, horizon, tss, hss }: Props) {
  const maxVal = Math.max(...matrix.flat())

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:12, color:'#FF9500', letterSpacing:2 }}>
          {horizon} CONFUSION MATRIX
        </div>
        {(tss !== undefined || hss !== undefined) && (
          <div style={{ display:'flex', gap:16 }}>
            {tss !== undefined && (
              <div style={{ fontSize:12, fontFamily:"'Rajdhani',sans-serif" }}>
                <span style={{ color:'#4B5563', letterSpacing:1 }}>TSS </span>
                <span style={{ color: tss>0.6?'#6ECB63':tss>0.3?'#FFD700':'#FF9500',
                  fontFamily:"'Orbitron',monospace", fontSize:13 }}>
                  {tss.toFixed(3)}
                </span>
              </div>
            )}
            {hss !== undefined && (
              <div style={{ fontSize:12, fontFamily:"'Rajdhani',sans-serif" }}>
                <span style={{ color:'#4B5563', letterSpacing:1 }}>HSS </span>
                <span style={{ color: hss>0.6?'#6ECB63':hss>0.3?'#FFD700':'#FF9500',
                  fontFamily:"'Orbitron',monospace", fontSize:13 }}>
                  {hss.toFixed(3)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Predicted label row */}
      <div style={{ display:'grid', gridTemplateColumns:`60px repeat(5, 1fr)`, gap:3, marginBottom:3 }}>
        <div />
        {CLASS_NAMES.map(cls => (
          <div key={cls} style={{ textAlign:'center', fontSize:10,
            fontFamily:"'Orbitron',monospace", color:'#4B5563', letterSpacing:1 }}>
            {cls === 'No-flare' ? 'NF' : cls}
          </div>
        ))}
      </div>

      {/* Matrix rows */}
      {matrix.map((row, ri) => (
        <div key={ri} style={{ display:'grid', gridTemplateColumns:`60px repeat(5, 1fr)`, gap:3, marginBottom:3 }}>
          {/* True label */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end',
            paddingRight:8, fontSize:10, fontFamily:"'Orbitron',monospace", color:'#4B5563' }}>
            {CLASS_NAMES[ri] === 'No-flare' ? 'NF' : CLASS_NAMES[ri]}
          </div>
          {row.map((val, ci) => {
            const intensity = maxVal > 0 ? val / maxVal : 0
            const isDiag    = ri === ci
            const bg = isDiag
              ? `rgba(255,107,0,${0.08 + intensity * 0.55})`
              : `rgba(255,255,255,${intensity * 0.12})`
            const textColor = isDiag
              ? intensity > 0.5 ? '#FFB800' : '#FF9500'
              : intensity > 0.3 ? '#9CA3AF' : '#374151'
            return (
              <div key={ci} style={{
                background: bg,
                border: isDiag ? '1px solid rgba(255,107,0,0.30)' : '1px solid rgba(255,255,255,0.04)',
                borderRadius: 6,
                padding: '8px 4px',
                textAlign: 'center',
                fontFamily: "'Orbitron',monospace",
                fontSize: 12,
                fontWeight: isDiag ? 700 : 400,
                color: textColor,
                transition: 'background 0.3s ease',
              }}>
                {val}
              </div>
            )
          })}
        </div>
      ))}

      <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
        <div style={{ fontSize:10, color:'#374151', letterSpacing:1 }}>↑ TRUE LABEL</div>
        <div style={{ fontSize:10, color:'#374151', letterSpacing:1 }}>PREDICTED LABEL →</div>
      </div>
    </div>
  )
}
