'use client'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceDot } from 'recharts'

interface TimelinePoint {
  date: string
  price: number
}

interface DecisionMarker {
  date: string
  price: number
  type: 'buy' | 'sell' | 'hold'
  label: string
}

interface TimelineReplayProps {
  data: TimelinePoint[]
  decisions: DecisionMarker[]
  yLabel?: string
}

const formatINR = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`
  return `₹${v}`
}

const decisionColors = { buy: '#00E5A0', sell: '#FF4D6D', hold: '#8888A0' }

export default function TimelineReplay({ data, decisions, yLabel = 'Price' }: TimelineReplayProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
        Decision Timeline
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--border-color)' }} />
          <YAxis tickFormatter={formatINR} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)' }} axisLine={{ stroke: 'var(--border-color)' }} label={{ value: yLabel, angle: -90, fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-muted)' }}
            formatter={(value: any) => [formatINR(Number(value || 0)), yLabel]}
          />
          <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} dot={false} animationDuration={1500} />
          {decisions.map((d, i) => (
            <ReferenceDot
              key={i}
              x={d.date}
              y={d.price}
              r={6}
              fill={decisionColors[d.type]}
              stroke="var(--bg-primary)"
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-6 mt-4 justify-center">
        {(['buy', 'sell', 'hold'] as const).map(type => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: decisionColors[type] }} />
            <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
