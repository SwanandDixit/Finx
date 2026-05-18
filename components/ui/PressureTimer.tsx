'use client'
import { useEffect, useState, useCallback } from 'react'

interface PressureTimerProps {
  duration?: number
  onTimeout: () => void
  isActive: boolean
  size?: number
}

export default function PressureTimer({ duration = 15, onTimeout, isActive, size = 48 }: PressureTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const radius = (size - 4) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (timeLeft / duration) * circumference
  const isUrgent = timeLeft <= 5

  const handleTimeout = useCallback(() => {
    onTimeout()
  }, [onTimeout])

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration, isActive])

  useEffect(() => {
    if (!isActive) return
    if (timeLeft <= 0) {
      handleTimeout()
      return
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive, timeLeft, handleTimeout])

  const color = isUrgent ? 'var(--negative)' : 'var(--accent)'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-color)" strokeWidth={3} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={3}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
            filter: isUrgent ? `drop-shadow(0 0 6px var(--negative))` : 'none',
            animation: isUrgent ? 'pulseRed 1s ease-in-out infinite' : 'none',
          }}
        />
      </svg>
      <span className="absolute font-mono-data text-sm font-bold" style={{ color }}>
        {timeLeft}
      </span>
    </div>
  )
}
