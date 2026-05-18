'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Zap, Shield, Flame, DollarSign } from 'lucide-react'
import SimCard from '@/components/ui/SimCard'
import { SIMULATIONS } from '@/lib/simulation-engine'

const difficultyColors = {
  easy: { bg: 'rgba(0, 229, 160, 0.1)', color: 'var(--positive)', icon: <Shield size={16} /> },
  medium: { bg: 'rgba(255, 184, 0, 0.1)', color: 'var(--warning)', icon: <Flame size={16} /> },
  hard: { bg: 'rgba(255, 77, 109, 0.1)', color: 'var(--negative)', icon: <Zap size={16} /> },
}

export default function SimulationsPage() {
  const easyCount = SIMULATIONS.filter(s => s.difficulty === 'easy').length
  const mediumCount = SIMULATIONS.filter(s => s.difficulty === 'medium').length
  const hardCount = SIMULATIONS.filter(s => s.difficulty === 'hard').length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <Link href="/dashboard"><ArrowLeft size={20} style={{ color: 'var(--text-secondary)' }} /></Link>
        <span className="text-xl font-bold text-gradient">Simulations</span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold mb-3">
            Test your instincts with <span className="text-gradient">real history</span>
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Each simulation drops you into a real financial crisis or milestone. 
            Make decisions under pressure with real market data. No hints. No undo.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-4 mb-10"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium">{SIMULATIONS.length} Scenarios</span>
          </div>
          {[
            { label: 'Easy', count: easyCount, ...difficultyColors.easy },
            { label: 'Medium', count: mediumCount, ...difficultyColors.medium },
            { label: 'Hard', count: hardCount, ...difficultyColors.hard },
          ].map(d => (
            <div key={d.label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: d.bg, border: `1px solid transparent` }}>
              {d.icon}
              <span className="text-sm font-medium" style={{ color: d.color }}>{d.count} {d.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Simulations Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {SIMULATIONS.map((sim, i) => (
            <motion.div
              key={sim.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
            >
              <Link href={`/simulations/${sim.slug}`}>
                <div className="glass-card p-6 cursor-pointer group relative overflow-hidden h-full">
                  {/* Difficulty badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`badge badge-${sim.difficulty}`}>{sim.difficulty}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>
                        {sim.duration_mins} min
                      </span>
                      <span className="font-mono-data text-xs" style={{ color: 'var(--accent)' }}>
                        ₹{(sim.startingCapital / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-gradient transition-all">
                    {sim.name}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {sim.description}
                  </p>

                  {/* Assets */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sim.assets.slice(0, 5).map(asset => (
                      <span key={asset} className="px-2 py-1 rounded-lg font-mono-data text-xs"
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                        {asset}
                      </span>
                    ))}
                  </div>

                  {/* Period */}
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {sim.datePeriodStart} → {sim.datePeriodEnd}
                    </span>
                  </div>

                  {/* Hover CTA */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(90deg, var(--accent), #00B4D8)' }} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            More simulations coming soon
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            IPO Mania • Demonetization • Dot-com Bubble • Real Estate Crash
          </p>
        </motion.div>
      </div>
    </div>
  )
}
