import type { ConnectionState } from '../hooks/usePrediction'

interface Props {
  state:       ConnectionState
  modelLoaded: boolean
  lastFetch:   Date | null
  isRefreshing: boolean
  onRefresh:   () => void
  isLive:      boolean
  onToggleLive: () => void
}

const STATE_CONFIG = {
  connecting: { color:'#64B4FF', dot:'#64B4FF', label:'CONNECTING',   blink:true  },
  live:       { color:'#6ECB63', dot:'#00DD44', label:'LIVE',          blink:true  },
  demo:       { color:'#FFD700', dot:'#FFD700', label:'DEMO MODE',     blink:false },
  error:      { color:'#FF5555', dot:'#FF5555', label:'DISCONNECTED',  blink:false },
}

export function ConnectionBadge({ state, modelLoaded, lastFetch, isRefreshing, onRefresh, isLive, onToggleLive }: Props) {
  const cfg = STATE_CONFIG[state]
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      {/* Model loaded indicator */}
      <div style={{ textAlign:'right' }}>
        <div style={{ fontSize:9, letterSpacing:2.5, color:'#374151', fontFamily:"'Orbitron',monospace" }}>
          MODEL
        </div>
        <div style={{ fontSize:11, fontFamily:"'Orbitron',monospace",
          color: modelLoaded ? '#6ECB63' : '#FF9500' }}>
          {modelLoaded ? 'LOADED' : 'DEMO'}
        </div>
      </div>

      {/* Last update */}
      {lastFetch && (
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:9, letterSpacing:2.5, color:'#374151', fontFamily:"'Orbitron',monospace" }}>
            UPDATED
          </div>
          <div style={{ fontSize:11, color:'#4B5563', fontFamily:"'Rajdhani',sans-serif" }}>
            {lastFetch.toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        style={{
          background:'transparent',
          border:'1px solid rgba(255,107,0,0.25)',
          borderRadius:8,
          color: isRefreshing ? '#374151' : '#FF9500',
          cursor: isRefreshing ? 'not-allowed' : 'pointer',
          padding:'5px 10px',
          fontFamily:"'Orbitron',monospace",
          fontSize:10,
          letterSpacing:1,
          transition:'all 0.15s ease',
        }}
      >
        {isRefreshing ? '...' : '↻'}
      </button>

      {/* Live/Pause */}
      <button
        onClick={onToggleLive}
        style={{
          display:'flex', alignItems:'center', gap:7,
          padding:'6px 14px',
          border:`1px solid ${isLive ? 'rgba(255,107,0,0.4)' : 'rgba(100,100,100,0.3)'}`,
          borderRadius:20,
          background: isLive ? 'rgba(255,107,0,0.08)' : 'transparent',
          color: isLive ? '#FF9500' : '#4B5563',
          fontFamily:"'Orbitron',monospace",
          fontSize:11,
          letterSpacing:2,
          cursor:'pointer',
        }}
      >
        <span style={{
          width:7, height:7, borderRadius:'50%',
          background: cfg.dot,
          boxShadow: isLive ? `0 0 8px ${cfg.dot}` : 'none',
          display:'inline-block',
          animation: cfg.blink && isLive ? 'blink 1.4s ease-in-out infinite' : 'none',
        }} />
        {cfg.label}
      </button>
    </div>
  )
}
