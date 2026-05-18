'use client'
import { motion } from 'framer-motion'

interface MetricCardProps {
  label: string
  value: string
  change?: string
  positive?: boolean
  icon?: React.ReactNode
}

export default function MetricCard({ label, value, change, positive, icon }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        {icon && <span style={{ color: 'var(--text-muted)' }}>{icon}</span>}
      </div>
      <span className="font-mono-data text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
      {change && (
        <span className="font-mono-data text-sm font-medium" style={{ color: positive ? 'var(--positive)' : 'var(--negative)' }}>
          {change}
        </span>
      )}
    </motion.div>
  )
}
