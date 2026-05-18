'use client'
import { motion } from 'framer-motion'
import { Play, Clock } from 'lucide-react'
import Link from 'next/link'

interface SimCardProps {
  slug: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration: number
}

const difficultyClass: Record<string, string> = {
  easy: 'badge-easy',
  medium: 'badge-medium',
  hard: 'badge-hard',
}

export default function SimCard({ slug, name, description, difficulty, duration }: SimCardProps) {
  return (
    <Link href={`/simulations/${slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="glass-card relative overflow-hidden cursor-pointer group"
        style={{ width: 320, height: 200, padding: 24 }}
      >
        <div className="flex items-start justify-between mb-3">
          <span className={`badge ${difficultyClass[difficulty]}`}>{difficulty}</span>
          <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Clock size={14} />
            <span className="font-mono-data text-xs">{duration} min</span>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {name}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(0, 229, 160, 0.08)' }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            <Play size={24} fill="currentColor" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  )
}
