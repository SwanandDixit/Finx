'use client'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface BehaviorRadarProps {
  data: { trait: string; score: number }[]
}

export default function BehaviorRadar({ data }: BehaviorRadarProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
        Behavioral Fingerprint
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="var(--border-color)" />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="var(--accent)"
            fill="var(--accent)"
            fillOpacity={0.25}
            strokeWidth={2}
            animationDuration={1000}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
