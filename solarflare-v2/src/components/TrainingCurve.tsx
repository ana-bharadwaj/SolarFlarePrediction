import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface Props {
  trainLoss?: number[]
  valLoss?:   number[]
}

export function TrainingCurve({ trainLoss, valLoss }: Props) {
  if (!trainLoss?.length) {
    return (
      <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center',
        color:'#374151', fontFamily:"'Rajdhani',sans-serif", letterSpacing:2, fontSize:12 }}>
        NO TRAINING HISTORY — run the notebook first
      </div>
    )
  }

  const data = trainLoss.map((loss, i) => ({
    epoch:     i + 1,
    'Train Loss': parseFloat(loss.toFixed(4)),
    'Val Loss':   valLoss?.[i] !== undefined ? parseFloat(valLoss[i].toFixed(4)) : undefined,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top:8, right:16, left:0, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 8" stroke="rgba(255,107,0,0.07)" vertical={false} />
        <XAxis
          dataKey="epoch"
          tick={{ fill:'#374151', fontSize:10, fontFamily:'Rajdhani' }}
          tickLine={false}
          axisLine={{ stroke:'rgba(255,107,0,0.10)' }}
          label={{ value:'Epoch', position:'insideBottomRight', fill:'#374151', fontSize:10 }}
        />
        <YAxis
          tick={{ fill:'#374151', fontSize:10, fontFamily:'Rajdhani' }}
          tickLine={false}
          axisLine={false}
          width={42}
          label={{ value:'Focal Loss', angle:-90, position:'insideLeft', fill:'#374151', fontSize:10 }}
        />
        <Tooltip
          contentStyle={{
            background:'rgba(8,12,28,0.95)',
            border:'1px solid rgba(255,107,0,0.3)',
            borderRadius:10,
            fontFamily:'Rajdhani',
            fontSize:13,
            color:'#E8EAF0',
          }}
          formatter={(v: number) => [v.toFixed(4)]}
        />
        <Line type="monotone" dataKey="Train Loss" stroke="#FF6B00" strokeWidth={2}
          dot={false} activeDot={{ r:4, fill:'#FF9500', strokeWidth:0 }} />
        <Line type="monotone" dataKey="Val Loss"   stroke="#1E90FF" strokeWidth={2}
          strokeDasharray="5 5" dot={false} activeDot={{ r:4, fill:'#64B4FF', strokeWidth:0 }} />
        <Legend wrapperStyle={{ fontFamily:'Rajdhani', fontSize:12, color:'#6B7280' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
