'use client'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

interface WealthChartProps {
  data: { label: string; conservative: number; balanced: number; aggressive: number }[]
}

const formatINR = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`
  return `₹${v}`
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="glass-card p-3" style={{ minWidth: 180 }}>
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between items-center gap-4 mb-1">
          <span className="text-xs" style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono-data text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatINR(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function WealthChart({ data }: WealthChartProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
        Wealth Projections
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border-color)' }} />
          <YAxis tickFormatter={formatINR} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }} axisLine={{ stroke: 'var(--border-color)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
          <Line type="monotone" dataKey="conservative" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6' }} animationDuration={1000} />
          <Line type="monotone" dataKey="balanced" stroke="var(--warning)" strokeWidth={2} dot={{ r: 4, fill: 'var(--warning)' }} animationDuration={1200} />
          <Line type="monotone" dataKey="aggressive" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4, fill: 'var(--accent)' }} animationDuration={1400} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
