'use client'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wallet, TrendingUp, Clock, AlertTriangle, Trophy, ArrowRight } from 'lucide-react'
import DecisionCard from '@/components/ui/DecisionCard'
import NewsTickerBar from '@/components/ui/NewsTickerBar'
import { getSimulationConfig, initSimulationState, calculatePortfolioValue, calculateOptimalOutcome } from '@/lib/simulation-engine'
import type { SimulationConfig, SimulationState, Decision } from '@/lib/simulation-engine'

function formatINR(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`
  return `₹${v.toLocaleString('en-IN')}`
}

function applyDecisionEffect(state: SimulationState, action: string, config: SimulationConfig): SimulationState {
  const s = { ...state, portfolio: { ...state.portfolio } }
  const capital = calculatePortfolioValue(s)

  switch (action) {
    case 'buy_btc_50k': s.cashBalance -= 50000; s.portfolio['BTC'] = (s.portfolio['BTC'] || 0) + 50000; break
    case 'split_25k': s.cashBalance -= 50000; s.portfolio['BTC'] = (s.portfolio['BTC'] || 0) + 25000; s.portfolio['ETH'] = (s.portfolio['ETH'] || 0) + 25000; break
    case 'sell_half':
      const halfValue = Object.values(s.portfolio).reduce((a, b) => a + b, 0) / 2
      Object.keys(s.portfolio).forEach(k => { s.portfolio[k] *= 0.5 })
      s.cashBalance += halfValue; break
    case 'buy_more_30k': s.cashBalance -= 30000; s.portfolio['BTC'] = (s.portfolio['BTC'] || 0) + 30000; break
    case 'sell_all':
      const total = Object.values(s.portfolio).reduce((a, b) => a + b, 0)
      s.cashBalance += total; Object.keys(s.portfolio).forEach(k => { s.portfolio[k] = 0 }); break
    case 'rotate_eth':
      const btcVal = s.portfolio['BTC'] || 0
      s.portfolio['BTC'] = 0; s.portfolio['ETH'] = (s.portfolio['ETH'] || 0) + btcVal; break
    case 'buy_dip_20k': s.cashBalance -= Math.min(20000, s.cashBalance); s.portfolio['BTC'] = (s.portfolio['BTC'] || 0) + Math.min(20000, s.cashBalance + 20000); break
    case 'avg_down_15k': s.cashBalance -= Math.min(15000, s.cashBalance); s.portfolio['BTC'] = (s.portfolio['BTC'] || 0) + Math.min(15000, s.cashBalance + 15000); break
    case 'save_8k_invest_5k': s.cashBalance -= 5000; s.portfolio['savings'] = (s.portfolio['savings'] || 0) + 8000; s.portfolio['investments'] = (s.portfolio['investments'] || 0) + 5000; break
    case 'save_3k_invest_10k': s.cashBalance -= 10000; s.portfolio['savings'] = (s.portfolio['savings'] || 0) + 3000; s.portfolio['investments'] = (s.portfolio['investments'] || 0) + 10000; break
    case 'save_5k_fun_8k': s.cashBalance -= 8000; s.portfolio['savings'] = (s.portfolio['savings'] || 0) + 5000; break
    case 'expense_3500': s.cashBalance -= 3500; break
    case 'expense_15000_emi': s.cashBalance -= 3000; break
    case 'expense_6500': s.cashBalance -= 6500; break
    case 'expense_5000': s.cashBalance -= 5000; break
    case 'expense_2000': s.cashBalance -= 2000; break
    case 'expense_8000': s.cashBalance -= 8000; break
    case 'expense_3000': s.cashBalance -= 3000; break
    case 'keep_sip': s.portfolio['investments'] = (s.portfolio['investments'] || 0) + 5000; s.cashBalance -= 5000; break
    case 'reduce_sip': s.portfolio['investments'] = (s.portfolio['investments'] || 0) + 2000; s.cashBalance -= 2000; break
    case 'increase_sip': s.portfolio['investments'] = (s.portfolio['investments'] || 0) + 8000; s.cashBalance -= 8000; break
    case 'build_emergency': s.portfolio['savings'] = (s.portfolio['savings'] || 0) + 10000; s.cashBalance -= 10000; break
    case 'lifestyle_upgrade': s.cashBalance -= 5000; break
    case 'rebalance_30_fd':
      const fdAmount = capital * 0.3
      Object.keys(s.portfolio).forEach(k => { s.portfolio[k] *= 0.7 })
      s.cashBalance += fdAmount; break
    case 'add_50k': s.cashBalance -= 50000; const perStock = 50000 / (config.assets?.length || 5); config.assets?.forEach(a => { s.portfolio[a] = (s.portfolio[a] || 0) + perStock }); break
    case 'buy_more_50k': s.cashBalance -= Math.min(50000, s.cashBalance); const ps2 = Math.min(50000, s.cashBalance + 50000) / (config.assets?.length || 5); config.assets?.forEach(a => { s.portfolio[a] = (s.portfolio[a] || 0) + ps2 }); break
    case 'avg_down_30k': s.cashBalance -= Math.min(30000, s.cashBalance); config.assets?.forEach(a => { s.portfolio[a] = (s.portfolio[a] || 0) + Math.min(30000, s.cashBalance + 30000) / (config.assets?.length || 5) }); break
    case 'book_profits': const profitAmt = Object.values(s.portfolio).reduce((a, b) => a + b, 0) * 0.3; Object.keys(s.portfolio).forEach(k => { s.portfolio[k] *= 0.7 }); s.cashBalance += profitAmt; break
    case 'rotate_recovery': break
    case 'rebalance': break
    case 'pay_all_27k': s.cashBalance -= 27000; break
    case 'negotiate_save': s.cashBalance -= 18000; break
    case 'extreme_save': s.cashBalance -= 7000; break
    case 'freelance_8k': s.cashBalance += 8000; break
    case 'job_search': break
    case 'liquidate_inv': s.cashBalance += (s.portfolio['investments'] || 0) * 0.8; s.portfolio['investments'] = 0; break
    case 'medical_15k': s.cashBalance -= 15000; break
    case 'borrow_family': break
    case 'delay_treatment': break
    case 'accept_25k': s.cashBalance += 25000; break
    case 'wait_35k': break
    case 'counter_30k': s.cashBalance += 30000; break
    case 'aggressive_save': s.portfolio['savings'] = (s.portfolio['savings'] || 0) + 15000; s.cashBalance -= 15000; break
    case 'balanced_rebuild': s.portfolio['savings'] = (s.portfolio['savings'] || 0) + 8000; s.cashBalance -= 8000; break
    case 'invest_crash': s.portfolio['investments'] = (s.portfolio['investments'] || 0) + 10000; s.cashBalance -= 10000; break
    case 'repay_debt': s.cashBalance -= 20000; break
    case 'rebuild_emergency': s.portfolio['savings'] = (s.portfolio['savings'] || 0) + 15000; s.cashBalance -= 15000; break
    case 'resume_lifestyle': s.cashBalance -= 10000; break
    default: break
  }
  s.cashBalance = Math.max(0, s.cashBalance)
  return s
}

// Market multipliers for crypto simulation turns
const CRYPTO_MULTIPLIERS = [1, 4.9, 5.6, 2.7, 1.5]
const STOCK_MULTIPLIERS = [1, 0.65, 0.75, 0.9, 1.15]

function applyMarketMovement(state: SimulationState, turn: number, slug: string): SimulationState {
  const s = { ...state, portfolio: { ...state.portfolio } }
  if (slug === 'crypto-bull-bear-2020-2022') {
    const mult = CRYPTO_MULTIPLIERS[turn - 1] || 1
    const prevMult = CRYPTO_MULTIPLIERS[Math.max(0, turn - 2)] || 1
    const change = mult / prevMult
    Object.keys(s.portfolio).forEach(k => {
      if (k !== 'cash') s.portfolio[k] = Math.round(s.portfolio[k] * change)
    })
  } else if (slug === 'market-crash-2020') {
    const mult = STOCK_MULTIPLIERS[turn - 1] || 1
    const prevMult = STOCK_MULTIPLIERS[Math.max(0, turn - 2)] || 1
    const change = mult / prevMult
    Object.keys(s.portfolio).forEach(k => {
      s.portfolio[k] = Math.round(s.portfolio[k] * change)
    })
  }
  return s
}

export default function SimulationPlayPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const config = getSimulationConfig(slug)

  const [state, setState] = useState<SimulationState | null>(null)
  const [completed, setCompleted] = useState(false)
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [portfolioHistory, setPortfolioHistory] = useState<number[]>([])

  useEffect(() => {
    if (config) {
      const s = initSimulationState(config, `local-${Date.now()}`)
      setState(s)
      setPortfolioHistory([config.startingCapital])
    }
  }, [slug])

  const handleDecision = useCallback((optionId: string, action: string) => {
    if (!state || !config) return
    const currentEvent = config.events[state.currentTurn - 1]
    if (!currentEvent) return

    const valueBefore = calculatePortfolioValue(state)
    let newState = applyDecisionEffect(state, action, config)
    const nextTurn = state.currentTurn + 1

    if (nextTurn <= config.events.length) {
      newState = applyMarketMovement(newState, nextTurn, slug)
    }

    const valueAfter = calculatePortfolioValue(newState)

    const decision: Decision = {
      turn: state.currentTurn,
      timestamp: new Date().toISOString(),
      eventId: currentEvent.id,
      choice: optionId,
      portfolioValueBefore: valueBefore,
      portfolioValueAfter: valueAfter,
      marketPriceAtDecision: valueBefore,
    }

    setDecisions(prev => [...prev, decision])
    setPortfolioHistory(prev => [...prev, valueAfter])

    if (nextTurn > config.events.length) {
      setCompleted(true)
      newState = { ...newState, status: 'completed', currentTurn: state.currentTurn }
      localStorage.setItem(`finx_sim_${slug}`, JSON.stringify({ decisions: [...decisions, decision], finalValue: valueAfter, startingValue: config.startingCapital, slug }))
    } else {
      newState = { ...newState, currentTurn: nextTurn, currentEvent: config.events[nextTurn - 1] }
    }

    setState(newState)
  }, [state, config, slug, decisions])

  const handleTimeout = useCallback(() => {
    if (!config || !state) return
    const currentEvent = config.events[state.currentTurn - 1]
    if (currentEvent) handleDecision(currentEvent.options[currentEvent.options.length - 1].id, currentEvent.options[currentEvent.options.length - 1].action)
  }, [config, state, handleDecision])

  if (!config) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="glass-card p-12 text-center">
        <h2 className="text-xl font-bold mb-3">Simulation not found</h2>
        <Link href="/simulations"><button className="btn-primary">Browse Simulations</button></Link>
      </div>
    </div>
  )

  if (!state) return null

  const currentEvent = config.events[state.currentTurn - 1]
  const portfolioValue = calculatePortfolioValue(state)
  const pnl = portfolioValue - config.startingCapital
  const pnlPercent = ((pnl / config.startingCapital) * 100).toFixed(1)
  const relevantHeadlines = config.headlines.filter((_, i) => i < state.currentTurn)
  const progressPercent = completed ? 100 : ((state.currentTurn) / config.events.length) * 100

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-4">
          <Link href="/simulations"><ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} /></Link>
          <span className="font-bold text-gradient">{config.name}</span>
          <span className={`badge badge-${config.difficulty}`}>{config.difficulty}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="font-mono-data text-xs" style={{ color: 'var(--text-secondary)' }}>
              Turn {Math.min(state.currentTurn, config.events.length)}/{config.events.length}
            </span>
          </div>
        </div>
      </nav>

      {/* News Ticker */}
      <NewsTickerBar headlines={relevantHeadlines} />

      {/* Progress */}
      <div className="px-6 pt-4">
        <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} /></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6">
        {/* Portfolio Bar */}
        <motion.div layout className="sim-portfolio-bar mb-6">
          <div className="flex items-center gap-3">
            <Wallet size={18} style={{ color: 'var(--accent)' }} />
            <div>
              <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Portfolio Value</span>
              <span className="font-mono-data text-lg font-bold">{formatINR(portfolioValue)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp size={16} style={{ color: pnl >= 0 ? 'var(--positive)' : 'var(--negative)' }} />
            <span className="font-mono-data text-sm font-bold" style={{ color: pnl >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
              {pnl >= 0 ? '+' : ''}{formatINR(pnl)} ({pnlPercent}%)
            </span>
          </div>
          <div>
            <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Cash</span>
            <span className="font-mono-data text-sm">{formatINR(state.cashBalance)}</span>
          </div>
        </motion.div>

        {/* Event or Completion */}
        <AnimatePresence mode="wait">
          {!completed && currentEvent ? (
            <motion.div key={currentEvent.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Date badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-lg font-mono-data text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--accent)', border: '1px solid var(--border-color)' }}>
                  {currentEvent.date}
                </div>
                {currentEvent.headline && (
                  <span className="text-xs" style={{ color: 'var(--warning)' }}>
                    <AlertTriangle size={12} className="inline mr-1" />{currentEvent.headline}
                  </span>
                )}
              </div>

              <DecisionCard
                title={currentEvent.title}
                description={currentEvent.description}
                options={currentEvent.options}
                onDecide={handleDecision}
                timerActive={true}
                onTimeout={handleTimeout}
              />
            </motion.div>
          ) : completed ? (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="glass-card p-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  <Trophy size={56} style={{ color: 'var(--accent)', margin: '0 auto 16px' }} />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">Simulation Complete</h2>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Here&apos;s how you performed in <strong>{config.name}</strong>
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Starting</span>
                    <span className="font-mono-data font-bold text-lg">{formatINR(config.startingCapital)}</span>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Final</span>
                    <span className="font-mono-data font-bold text-lg" style={{ color: pnl >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{formatINR(portfolioValue)}</span>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Optimal</span>
                    <span className="font-mono-data font-bold text-lg" style={{ color: 'var(--warning)' }}>{formatINR(calculateOptimalOutcome(config))}</span>
                  </div>
                </div>

                {/* Portfolio Journey */}
                <div className="flex items-end justify-center gap-1 mb-8 h-20">
                  {portfolioHistory.map((v, i) => {
                    const max = Math.max(...portfolioHistory)
                    const height = max > 0 ? (v / max) * 80 : 10
                    return (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-t"
                        style={{ width: `${100 / portfolioHistory.length - 2}%`, minWidth: 16, background: v >= config.startingCapital ? 'var(--positive)' : 'var(--negative)', opacity: 0.7 + (i / portfolioHistory.length) * 0.3 }}
                      />
                    )
                  })}
                </div>

                <div className="flex gap-4 justify-center">
                  <Link href={`/simulations/${slug}/results`}>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="btn-primary flex items-center gap-2">
                      View AI Analysis <ArrowRight size={16} />
                    </motion.button>
                  </Link>
                  <Link href="/simulations">
                    <button className="btn-secondary">Try Another</button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Decision History */}
        {decisions.length > 0 && !completed && (
          <div className="mt-8">
            <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Decision Log</h4>
            <div className="flex flex-col gap-2">
              {decisions.slice().reverse().map((d, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2 rounded-xl text-xs"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Turn {d.turn}: {d.choice}</span>
                  <span className="font-mono-data" style={{ color: d.portfolioValueAfter >= d.portfolioValueBefore ? 'var(--positive)' : 'var(--negative)' }}>
                    {formatINR(d.portfolioValueBefore)} → {formatINR(d.portfolioValueAfter)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
