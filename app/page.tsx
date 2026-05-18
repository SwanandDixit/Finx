'use client'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Brain, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'
import SimCard from '@/components/ui/SimCard'
import { SIMULATIONS } from '@/lib/simulation-engine'

function FloatingLines() {
  const lines = [
    { w: 280, left: 12 }, { w: 350, left: 45 }, { w: 200, left: 68 },
    { w: 420, left: 5 }, { w: 310, left: 55 }, { w: 180, left: 30 },
  ]
  const dots = [
    { t: 8, l: 22, o: 0.18, d: 4.2, dl: 1.1 }, { t: 35, l: 78, o: 0.25, d: 5.5, dl: 2.3 },
    { t: 62, l: 15, o: 0.12, d: 3.8, dl: 0.5 }, { t: 18, l: 91, o: 0.22, d: 6.1, dl: 3.8 },
    { t: 75, l: 44, o: 0.15, d: 4.9, dl: 1.7 }, { t: 42, l: 67, o: 0.28, d: 3.2, dl: 4.2 },
    { t: 88, l: 33, o: 0.14, d: 5.8, dl: 0.9 }, { t: 5, l: 55, o: 0.20, d: 4.5, dl: 2.8 },
    { t: 51, l: 82, o: 0.17, d: 6.5, dl: 3.1 }, { t: 29, l: 8, o: 0.23, d: 3.5, dl: 4.5 },
    { t: 67, l: 38, o: 0.11, d: 5.2, dl: 1.4 }, { t: 14, l: 72, o: 0.26, d: 4.1, dl: 2.0 },
    { t: 93, l: 25, o: 0.19, d: 6.8, dl: 3.5 }, { t: 38, l: 60, o: 0.13, d: 3.9, dl: 0.3 },
    { t: 80, l: 50, o: 0.21, d: 5.6, dl: 4.8 }, { t: 22, l: 85, o: 0.16, d: 4.7, dl: 1.9 },
    { t: 56, l: 18, o: 0.24, d: 6.3, dl: 2.6 }, { t: 3, l: 42, o: 0.10, d: 3.4, dl: 3.3 },
    { t: 71, l: 95, o: 0.27, d: 5.1, dl: 0.7 }, { t: 45, l: 5, o: 0.15, d: 4.4, dl: 4.0 },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map((line, i) => (
        <div key={i} className="absolute h-px opacity-20" style={{
          width: `${line.w}px`, top: `${15 + i * 14}%`, left: `${line.left}%`,
          background: `linear-gradient(90deg, transparent, var(--accent), transparent)`,
          animation: `floatLine ${5 + i * 1.5}s ease-in-out infinite`, animationDelay: `${i * 0.8}s`,
        }} />
      ))}
      {dots.map((dot, i) => (
        <div key={`dot-${i}`} className="absolute w-1 h-1 rounded-full" style={{
          top: `${dot.t}%`, left: `${dot.l}%`, background: 'var(--accent)',
          opacity: dot.o, animation: `fadeIn ${dot.d}s ease-in-out infinite alternate`,
          animationDelay: `${dot.dl}s`,
        }} />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <FloatingLines />
        <div className="bg-grid absolute inset-0 opacity-30" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0, 229, 160, 0.2)' }}>
              <Zap size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                Powered by real market data & AI
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Learn money the hard way.{' '}
              <span className="text-gradient">Without losing it.</span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}>
              Real market simulations. Real historical data. Zero real risk.
              Build financial intelligence through experience, not lectures.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary flex items-center gap-2 text-base"
                >
                  Analyze My Finances <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link href="/simulations">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary flex items-center gap-2 text-base"
                >
                  Try a Simulation <TrendingUp size={18} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: `linear-gradient(to top, var(--bg-primary), transparent)` }} />
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-4"
          >
            Two systems. One financial edge.
          </motion.h2>
          <p className="text-center mb-16" style={{ color: 'var(--text-secondary)' }}>
            Understand your money. Then stress-test your instincts.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 size={28} />,
                title: 'Financial Analyzer',
                desc: 'AI-powered analysis of your real finances. Health score, investment plans, and projections built from your actual numbers.',
              },
              {
                icon: <TrendingUp size={28} />,
                title: 'Simulation Engine',
                desc: 'Drop into real historical crises. Make decisions under pressure with real market data. No hints. No safety net.',
              },
              {
                icon: <Brain size={28} />,
                title: 'AI Analysis',
                desc: 'Post-simulation behavioral breakdown. Discover your biases, see alternate timelines, get mentor-level insight.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-8 text-center"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulations Preview */}
      <section className="py-24 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4"
          >
            Live simulations
          </motion.h2>
          <p className="mb-12" style={{ color: 'var(--text-secondary)' }}>
            Each one built on real market data. Real consequences. Real learning.
          </p>

          <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            {SIMULATIONS.map((sim, i) => (
              <motion.div
                key={sim.slug}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0"
              >
                <SimCard
                  slug={sim.slug}
                  name={sim.name}
                  description={sim.description}
                  difficulty={sim.difficulty}
                  duration={sim.duration_mins}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-4xl font-bold mb-3 text-gradient">10,000+</p>
          <p style={{ color: 'var(--text-secondary)' }}>
            young Indians learning to invest by doing
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-gradient">FINX</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} FINX. Built for the financially curious.
          </span>
        </div>
      </footer>
    </div>
  )
}
