'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface HealthRingProps {
  score: number
  size?: number
  strokeWidth?: number
}

export default function HealthRing({ score, size = 180, strokeWidth = 10 }: HealthRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (animatedScore / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 70) return 'var(--positive)'
    if (s >= 40) return 'var(--warning)'
    return 'var(--negative)'
  }

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 200)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={getColor(animatedScore)} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${getColor(animatedScore)}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-mono-data font-bold"
          style={{ fontSize: size * 0.22, color: getColor(animatedScore) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {animatedScore}
        </motion.span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Health Score
        </span>
      </div>
    </motion.div>
  )
}
