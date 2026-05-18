'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BarChart3, TrendingUp, Play, LogOut, User, ArrowRight, ShieldAlert } from 'lucide-react'
import HealthRing from '@/components/ui/HealthRing'
import MetricCard from '@/components/ui/MetricCard'
import SimCard from '@/components/ui/SimCard'
import LiveMarketTicker from '@/components/ui/LiveMarketTicker'
import FireCalculator from '@/components/ui/FireCalculator'
import { calculateHealthScore, calculateSurplus, calculateSavingsRate, calculateDebtBurdenRatio, formatINR } from '@/lib/financial-engine'
import type { FinancialProfile } from '@/lib/financial-engine'
import { SIMULATIONS } from '@/lib/simulation-engine'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function getFinancialPersonality(profile: any, savingsRate: number) {
  if (!profile) return null
  const risk = profile.risk_tolerance
  if (risk === 'aggressive') {
    if (savingsRate > 25) return { title: '🚀 Growth Accelerator', desc: 'High-velocity investor aiming for rapid net-worth scaling with high risk tolerance.' }
    return { title: '🎯 Momentum Strategist', desc: 'Active market opportunist seeking alpha through focused asset positions.' }
  } else if (risk === 'conservative') {
    if (savingsRate > 25) return { title: '🛡️ Capital Guardian', desc: 'Highly disciplined defender of capital focusing on robust risk mitigation.' }
    return { title: '⚖️ Wealth Shield', desc: 'Defensive compounder prioritizing capital preservation over volatility.' }
  } else {
    if (savingsRate > 20) return { title: '📈 Balanced Visionary', desc: 'Strategic planner blending steady savings with dynamic equities.' }
    return { title: '🧭 Asset Navigator', desc: 'Tactical optimizer maintaining a dynamic balance in changing market climates.' }
  }
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<FinancialProfile | null>(null)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('finx_profile')
    if (stored) {
      const data = JSON.parse(stored)
      setUserName(data.name || 'User')
      setProfile({
        monthly_income: data.monthly_income || 0,
        essential_expenses: data.essential_expenses || 0,
        lifestyle_expenses: data.lifestyle_expenses || 0,
        existing_savings: data.existing_savings || 0,
        existing_investments: data.existing_investments || [],
        goals: data.goals || [],
        risk_tolerance: data.risk_tolerance || 'balanced',
        liabilities: data.liabilities || 0,
        age: data.age || 25,
        emis: data.emis || 0,
      })
    }
  }, [])

  const health = profile ? calculateHealthScore(profile) : null
  const surplus = profile ? calculateSurplus(profile) : 0
  const savingsRate = profile ? calculateSavingsRate(profile) : 0
  const debtRatio = profile ? calculateDebtBurdenRatio(profile) : 0

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('finx_profile')
    router.push('/')
  }

  const archetype = getFinancialPersonality(profile, savingsRate)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <Link href="/" className="text-xl font-bold text-gradient">FINX</Link>
        <div className="flex items-center gap-4">
          <Link href="/profile" className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <User size={16} /> Profile
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Live Market Fluctuator Ticker tape */}
      <LiveMarketTicker />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{userName || 'there'}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your financial command center</p>
        </motion.div>

        {/* Health + Metrics */}
        {profile ? (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {/* Sidebar with Health ring and Gamified Avatar Archetype */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 flex flex-col items-center justify-center md:row-span-2">
                <span className="text-4xs block uppercase tracking-widest font-black text-center mb-3" style={{ color: 'var(--text-muted)' }}>Financial Health Index</span>
                <HealthRing score={health?.score || 0} size={150} />
                
                {/* Dynamic Archetype badge */}
                {archetype && (
                  <div className="mt-5 w-full p-3.5 rounded-xl border text-center" 
                    style={{ 
                      background: 'rgba(0, 229, 160, 0.03)', 
                      borderColor: 'rgba(0, 229, 160, 0.15)',
                    }}>
                    <span className="text-5xs block uppercase tracking-widest font-black" style={{ color: 'var(--text-muted)' }}>Archetype</span>
                    <span className="text-xs font-extrabold block mt-0.5" style={{ color: 'var(--accent)' }}>
                      {archetype.title}
                    </span>
                    <span className="text-3xs block mt-1 leading-normal" style={{ color: 'var(--text-secondary)' }}>
                      {archetype.desc}
                    </span>
                  </div>
                )}

                {/* Score breakdown metrics list */}
                <div className="mt-5 text-center w-full pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-5xs block uppercase tracking-widest font-black text-left mb-2" style={{ color: 'var(--text-muted)' }}>Breakdown Metrics</span>
                  {health?.factors.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center justify-between mt-1 text-3xs py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                      <span className="font-mono-data font-bold" style={{ color: f.impact >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                        {f.impact >= 0 ? '+' : ''}{f.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <MetricCard label="Monthly Surplus" value={formatINR(surplus)} positive={surplus > 0} />
              <MetricCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} positive={savingsRate > 20} />
              <MetricCard label="Debt Burden" value={`${debtRatio.toFixed(1)}%`} positive={debtRatio < 30} />
              <MetricCard label="Emergency Gap" value={formatINR(health?.emergency_fund_gap || 0)} positive={health?.emergency_fund_gap === 0} />
              <MetricCard label="Monthly Income" value={formatINR(profile.monthly_income)} />
              <MetricCard label="Total Expenses" value={formatINR(profile.essential_expenses + profile.lifestyle_expenses)} />
            </div>

            {/* FIRE retirement simulator widget */}
            <div className="mb-10">
              <FireCalculator currentAge={profile.age || 25} monthlySurplus={surplus} />
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card p-12 text-center mb-10">
            <h3 className="text-xl font-bold mb-3">Set up your financial profile</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Complete the onboarding to see your health score and get personalized investment plans.</p>
            <Link href="/onboarding">
              <button className="btn-primary">Start Onboarding <ArrowRight size={16} className="inline ml-2" /></button>
            </Link>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Link href="/analyzer">
            <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-6 cursor-pointer flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Financial Analyzer</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI-powered analysis, investment plans, projections</p>
              </div>
              <ArrowRight size={20} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
            </motion.div>
          </Link>
          <Link href="/simulations">
            <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-6 cursor-pointer flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255, 184, 0, 0.12)', color: 'var(--warning)' }}>
                <Play size={24} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Simulations</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Real market scenarios, zero risk, real learning</p>
              </div>
              <ArrowRight size={20} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
            </motion.div>
          </Link>
        </div>

        {/* Available Simulations */}
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp size={20} style={{ color: 'var(--accent)' }} /> Available Simulations
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SIMULATIONS.map(sim => (
            <SimCard key={sim.slug} slug={sim.slug} name={sim.name} description={sim.description} difficulty={sim.difficulty} duration={sim.duration_mins} />
          ))}
        </div>
      </div>
    </div>
  )
}
