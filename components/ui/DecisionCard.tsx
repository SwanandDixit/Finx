'use client'
import { motion } from 'framer-motion'
import PressureTimer from './PressureTimer'

interface DecisionOption {
  id: string
  label: string
  action: string
}

interface DecisionCardProps {
  title: string
  description: string
  options: DecisionOption[]
  onDecide: (optionId: string, action: string) => void
  timerActive: boolean
  onTimeout: () => void
}

export default function DecisionCard({ title, description, options, onDecide, timerActive, onTimeout }: DecisionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 relative"
    >
      {/* Timer in top right */}
      <div className="absolute top-4 right-4">
        <PressureTimer duration={15} onTimeout={onTimeout} isActive={timerActive} size={48} />
      </div>

      <h3 className="text-lg font-bold mb-3 pr-14" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>

      <div className="flex flex-col gap-3">
        {options.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
            onClick={() => onDecide(opt.id, opt.action)}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
            whileHover={{
              borderColor: 'var(--accent)',
              backgroundColor: 'rgba(0, 229, 160, 0.05)',
            }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
