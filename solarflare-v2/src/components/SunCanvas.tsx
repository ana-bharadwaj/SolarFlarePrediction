import { useRef, useEffect } from 'react'
import type { HorizonProbs } from '../types'

interface Props {
  probs12h: HorizonProbs | null
  size?: number
}

interface Particle { x: number; y: number; vx: number; vy: number; life: number; size: number }

// Active regions derived from SHARP features — positions driven by probability
const REGIONS = [
  { lat: 12, lon: -45, baseRisk: 0.88, id: 'AR 3654' },
  { lat: -8, lon:  15, baseRisk: 0.61, id: 'AR 3648' },
  { lat: 20, lon:  65, baseRisk: 0.42, id: 'AR 3661' },
  { lat: -15,lon: -70, baseRisk: 0.18, id: 'AR 3640' },
  { lat:  5, lon:  30, baseRisk: 0.55, id: 'AR 3671' },
]

export function SunCanvas({ probs12h, size = 300 }: Props) {
  const ref   = useRef<HTMLCanvasElement>(null)
  const frame = useRef(0)
  const t     = useRef(0)
  const parts = useRef<Particle[]>([])
  const p12h  = useRef(probs12h)
  useEffect(() => { p12h.current = probs12h }, [probs12h])

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = size, H = size, cx = W / 2, cy = H / 2, R = W / 2 - 10

    function spawn(x: number, y: number) {
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2, s = 0.6 + Math.random() * 2
        parts.current.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 1, size: 1 + Math.random() * 2.5 })
      }
    }

    function draw() {
      t.current += 0.009; const tv = t.current
      ctx.clearRect(0, 0, W, H)

      // corona
      const cg = ctx.createRadialGradient(cx,cy,R*0.75,cx,cy,R*1.4)
      cg.addColorStop(0,'rgba(255,130,0,0.09)'); cg.addColorStop(1,'transparent')
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,R*1.4,0,Math.PI*2); ctx.fill()

      // disk
      const dg = ctx.createRadialGradient(cx-R*.22,cy-R*.18,R*.08,cx,cy,R)
      dg.addColorStop(0,'#FFFDE0'); dg.addColorStop(.25,'#FFD060')
      dg.addColorStop(.55,'#FFA020'); dg.addColorStop(.82,'#FF6200'); dg.addColorStop(1,'#CC2800')
      ctx.fillStyle=dg; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill()

      // granulation
      ctx.save(); ctx.globalAlpha=0.033
      for (let i=0;i<90;i++){
        const a=(i/90)*Math.PI*2, r2=(0.25+(i%6)*.11)*R
        ctx.fillStyle=i%2?'#FF4800':'#FFE880'
        ctx.beginPath(); ctx.arc(cx+Math.cos(a+tv*.22)*r2, cy+Math.sin(a+tv*.17)*r2, 7+(i%5)*5, 0, Math.PI*2); ctx.fill()
      }
      ctx.restore()

      // M+X probability drives overall glow intensity
      const mxProb = p12h.current ? (p12h.current.M + p12h.current.X) : 0.3
      if (mxProb > 0.4) {
        const alertGlow = ctx.createRadialGradient(cx,cy,R*.6,cx,cy,R*1.2)
        alertGlow.addColorStop(0,`rgba(255,50,0,${(mxProb-0.4)*0.18})`)
        alertGlow.addColorStop(1,'transparent')
        ctx.fillStyle=alertGlow; ctx.beginPath(); ctx.arc(cx,cy,R*1.2,0,Math.PI*2); ctx.fill()
      }

      // Active region spots
      REGIONS.forEach((reg, idx) => {
        const lonR = (reg.lon * Math.PI/180) + tv*0.04
        const latR = reg.lat * Math.PI/180
        const cosL = Math.cos(lonR)
        if (cosL < -0.1) return
        const sc  = 0.45 + cosL*0.55
        const px  = cx + Math.sin(lonR)*Math.cos(latR)*R*.82
        const py  = cy - Math.sin(latR)*R*.82
        const sR  = (4 + reg.baseRisk * 20) * sc

        ctx.fillStyle='rgba(60,15,0,0.55)'; ctx.beginPath(); ctx.arc(px,py,sR*1.7,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='rgba(10,2,0,0.90)';  ctx.beginPath(); ctx.arc(px,py,sR,0,Math.PI*2);     ctx.fill()

        const rA = reg.baseRisk
        ctx.strokeStyle = rA>0.7?`rgba(255,50,0,${rA*.7})`:rA>0.4?`rgba(255,160,0,${rA*.6})`:`rgba(180,180,180,${rA*.4})`
        ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(px,py,sR*2.2,0,Math.PI*2); ctx.stroke()

        if (rA > 0.7) {
          const pulse = sR*2.8 + Math.sin(tv*2.2+idx)*4
          ctx.strokeStyle=`rgba(255,60,0,${0.25+0.18*Math.sin(tv*2.2+idx)})`
          ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(px,py,pulse,0,Math.PI*2); ctx.stroke()
          if (Math.random()<0.04) spawn(px,py)
        }
      })

      // particles
      parts.current = parts.current.filter(p=>p.life>0)
      parts.current.forEach(p=>{
        ctx.globalAlpha=p.life*.75
        ctx.fillStyle=`rgba(255,${Math.floor(120+p.life*80)},0,${p.life})`
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill()
        p.x+=p.vx; p.y+=p.vy; p.life-=0.038; p.vx*=0.96; p.vy*=0.96
      })
      ctx.globalAlpha=1

      // limb darkening
      const lg = ctx.createRadialGradient(cx,cy,R*.55,cx,cy,R)
      lg.addColorStop(0,'transparent'); lg.addColorStop(1,'rgba(40,0,0,0.52)')
      ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill()

      frame.current = requestAnimationFrame(draw)
    }
    frame.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame.current)
  }, [size])

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ borderRadius:'50%', boxShadow:'0 0 60px rgba(255,120,0,0.28), 0 0 120px rgba(255,60,0,0.10)', display:'block' }}
    />
  )
}
