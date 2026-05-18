'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Brain, AlertTriangle, Target, BookOpen, BarChart3 } from 'lucide-react'
import BehaviorRadar from '@/components/ui/BehaviorRadar'
import AIStream from '@/components/ui/AIStream'
import { getSimulationConfig, calculateOptimalOutcome } from '@/lib/simulation-engine'

function formatINR(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`
  return `₹${v.toLocaleString('en-IN')}`
}

interface SimData {
  decisions: { turn: number; choice: string; portfolioValueBefore: number; portfolioValueAfter: number }[]
  finalValue: number
  startingValue: number
  slug: string
}

const DEFAULT_FINGERPRINT = [
  { trait: 'Patience', score: 5 },
  { trait: 'Risk Calibration', score: 5 },
  { trait: 'Emotional Control', score: 5 },
  { trait: 'Opportunity Recognition', score: 5 },
  { trait: 'Conviction', score: 5 },
  { trait: 'Diversification', score: 5 },
]

const COMMON_BIASES = [
  'Loss Aversion', 'FOMO', 'Panic Selling', 'Herd Mentality',
  'Anchoring', 'Recency Bias', 'Overconfidence', 'Analysis Paralysis'
]

function analyzeLocally(data: SimData) {
  const { decisions, finalValue, startingValue } = data
  const pnl = finalValue - startingValue
  const pnlPct = (pnl / startingValue * 100).toFixed(1)

  // Heuristic behavioral scoring
  const holdCount = decisions.filter(d => d.choice === 'hold' || d.choice === 'wait').length
  const sellCount = decisions.filter(d => d.choice.includes('sell') || d.choice.includes('exit') || d.choice.includes('panic')).length
  const buyCount = decisions.filter(d => d.choice.includes('buy') || d.choice.includes('dip') || d.choice.includes('more') || d.choice.includes('avg')).length

  const patience = Math.min(10, 3 + holdCount * 2)
  const riskCal = pnl > 0 ? Math.min(10, 5 + Math.floor(pnl / startingValue * 10)) : Math.max(2, 5 - sellCount * 2)
  const emotional = Math.min(10, 6 - sellCount + holdCount)
  const opportunity = Math.min(10, 3 + buyCount * 2.5)
  const conviction = Math.min(10, 3 + holdCount * 1.5 + (pnl > 0 ? 2 : 0))
  const diversification = Math.min(10, decisions.some(d => d.choice.includes('split') || d.choice.includes('rotate') || d.choice.includes('rebal')) ? 8 : 4)

  const fingerprint = [
    { trait: 'Patience', score: Math.round(patience) },
    { trait: 'Risk Calibration', score: Math.round(riskCal) },
    { trait: 'Emotional Control', score: Math.round(emotional) },
    { trait: 'Opportunity Recognition', score: Math.round(opportunity) },
    { trait: 'Conviction', score: Math.round(conviction) },
    { trait: 'Diversification', score: Math.round(diversification) },
  ]

  const biases = COMMON_BIASES.map(bias => {
    let detected = false
    let explanation = 'Not detected in your decision pattern.'
    if (bias === 'Panic Selling' && sellCount >= 2) { detected = true; explanation = `You sold assets ${sellCount} times, suggesting reactive behavior during downturns.` }
    if (bias === 'FOMO' && buyCount >= 3) { detected = true; explanation = `You bought aggressively ${buyCount} times, possibly chasing momentum.` }
    if (bias === 'Loss Aversion' && sellCount > 0 && decisions.some(d => d.portfolioValueAfter < d.portfolioValueBefore)) { detected = true; explanation = 'You showed tendency to exit losing positions rather than holding through volatility.' }
    if (bias === 'Overconfidence' && buyCount > holdCount + sellCount) { detected = true; explanation = 'Heavy buying pattern suggests overconfidence in market timing ability.' }
    if (bias === 'Herd Mentality' && decisions.filter(d => d.choice === decisions[0]?.choice).length >= 3) { detected = true; explanation = 'Repeated same type of decision suggesting pattern-following behavior.' }
    return { bias, detected, explanation }
  })

  const summary = `## Performance Summary\n\nYou ${pnl >= 0 ? 'grew' : 'lost'} ${Math.abs(Number(pnlPct))}% of your portfolio (${formatINR(startingValue)} → ${formatINR(finalValue)}).\n\nAcross ${decisions.length} decision points, you showed a preference for ${holdCount > buyCount ? 'patience and holding' : buyCount > sellCount ? 'aggressive buying' : 'defensive selling'}. Your strongest trait was **${fingerprint.sort((a, b) => b.score - a.score)[0].trait}** and your area for improvement is **${fingerprint.sort((a, b) => a.score - b.score)[0].trait}**.\n\n${biases.filter(b => b.detected).length > 0 ? `**Biases detected:** ${biases.filter(b => b.detected).map(b => b.bias).join(', ')}` : 'No strong cognitive biases detected — you showed balanced decision-making.'}\n\nThe optimal outcome for this simulation was ${formatINR(calculateOptimalOutcome(getSimulationConfig(data.slug)!))}. ${pnl >= 0 ? 'You performed well relative to the baseline.' : 'Review your decision timing for future improvement.'}`

  return { fingerprint, biases, summary }
}

export default function SimulationResultsPage() {
  const params = useParams()
  const slug = params.slug as string
  const config = getSimulationConfig(slug)
  const [simData, setSimData] = useState<SimData | null>(null)
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeLocally> | null>(null)
  const [aiContent, setAiContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(`finx_sim_${slug}`)
    if (stored) {
      const data = JSON.parse(stored) as SimData
      setSimData(data)
      setAnalysis(analyzeLocally(data))
    }
  }, [slug])

  const runAIAnalysis = useCallback(async () => {
    if (!simData) return
    setAiContent('')
    setIsStreaming(true)
    try {
      const res = await fetch('/api/simulations/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'local', decisions: simData.decisions, startingValue: simData.startingValue, finalValue: simData.finalValue, slug }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (reader) {
        let done = false
        while (!done) {
          const { value, done: d } = await reader.read()
          done = d
          if (value) setAiContent(prev => prev + decoder.decode(value, { stream: true }))
        }
      }
    } catch (err) {
      console.error('API call failed, streaming offline dynamic report', err)
      const localReport = analysis?.summary || 'No local analysis summary was generated.'
      let currentLength = 0
      const interval = setInterval(() => {
        currentLength += 8
        setAiContent(localReport.slice(0, currentLength))
        if (currentLength >= localReport.length) {
          clearInterval(interval)
          setIsStreaming(false)
        }
      }, 15)
    } finally {
      // Streaming will handle lifecycle completion if offline, close directly only in successful API stream
    }
  }, [simData, slug, analysis])

  // Auto-generate local analysis on mount
  useEffect(() => {
    if (analysis && !aiContent) {
      setAiContent(analysis.summary)
    }
  }, [analysis])

  if (!config) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="glass-card p-12 text-center">
        <h2 className="text-xl font-bold mb-3">Simulation not found</h2>
        <Link href="/simulations"><button className="btn-primary">Browse Simulations</button></Link>
      </div>
    </div>
  )

  if (!simData || !analysis) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="glass-card p-12 text-center">
        <h2 className="text-xl font-bold mb-3">No simulation data found</h2>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Complete a simulation first to see your results.</p>
        <Link href={`/simulations/${slug}`}><button className="btn-primary">Play Simulation</button></Link>
      </div>
    </div>
  )

  const pnl = simData.finalValue - simData.startingValue
  const pnlPct = ((pnl / simData.startingValue) * 100).toFixed(1)
  const optimal = calculateOptimalOutcome(config)
  const efficiency = ((simData.finalValue / optimal) * 100).toFixed(0)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-4">
          <Link href={`/simulations/${slug}`}><ArrowLeft size={20} style={{ color: 'var(--text-secondary)' }} /></Link>
          <span className="text-xl font-bold text-gradient">Results: {config.name}</span>
        </div>
        <button onClick={runAIAnalysis} disabled={isStreaming} className="btn-secondary flex items-center gap-2 text-sm" style={{ padding: '8px 16px' }}>
          <RefreshCw size={14} className={isStreaming ? 'animate-spin' : ''} />
          {isStreaming ? 'Analyzing...' : 'AI Deep Analysis'}
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Score Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="glass-card p-5 text-center">
            <BarChart3 size={20} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
            <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Final Value</span>
            <span className="font-mono-data text-xl font-bold" style={{ color: pnl >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
              {formatINR(simData.finalValue)}
            </span>
          </div>
          <div className="glass-card p-5 text-center">
            <Target size={20} style={{ color: 'var(--warning)', margin: '0 auto 8px' }} />
            <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>P&L</span>
            <span className="font-mono-data text-xl font-bold" style={{ color: pnl >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
              {pnl >= 0 ? '+' : ''}{pnlPct}%
            </span>
          </div>
          <div className="glass-card p-5 text-center">
            <Brain size={20} style={{ color: '#3B82F6', margin: '0 auto 8px' }} />
            <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Decisions</span>
            <span className="font-mono-data text-xl font-bold">{simData.decisions.length}</span>
          </div>
          <div className="glass-card p-5 text-center">
            <BookOpen size={20} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
            <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Efficiency</span>
            <span className="font-mono-data text-xl font-bold" style={{ color: Number(efficiency) > 70 ? 'var(--positive)' : Number(efficiency) > 40 ? 'var(--warning)' : 'var(--negative)' }}>
              {efficiency}%
            </span>
          </div>
        </motion.div>

        {/* Behavioral Fingerprint + Biases */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <BehaviorRadar data={analysis.fingerprint} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="result-section">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Bias Report</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.biases.map((b, i) => (
                <span key={i} className={`bias-tag ${b.detected ? 'bias-tag-detected' : 'bias-tag-clear'}`}>
                  {b.detected ? '⚠' : '✓'} {b.bias}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3 mt-4">
              {analysis.biases.filter(b => b.detected).map((b, i) => (
                <div key={i} className="p-3 rounded-xl text-xs leading-relaxed" style={{ background: 'rgba(255, 77, 109, 0.06)', border: '1px solid rgba(255, 77, 109, 0.1)' }}>
                  <strong style={{ color: 'var(--negative)' }}>{b.bias}:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{b.explanation}</span>
                </div>
              ))}
              {analysis.biases.filter(b => b.detected).length === 0 && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No strong cognitive biases detected. Well done!</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Decision Log */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="result-section mb-10">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>Decision Timeline</h3>
          <div className="flex flex-col gap-2">
            {simData.decisions.map((d, i) => {
              const change = d.portfolioValueAfter - d.portfolioValueBefore
              return (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-data text-xs px-2 py-1 rounded" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>T{d.turn}</span>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{d.choice}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>{formatINR(d.portfolioValueBefore)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span className="font-mono-data text-xs font-bold" style={{ color: change >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                      {formatINR(d.portfolioValueAfter)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* AI Mentor Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} style={{ color: 'var(--accent)' }} />
            <h3 className="text-lg font-bold">Mentor Analysis</h3>
          </div>
          <AIStream content={aiContent} isStreaming={isStreaming} />
        </motion.div>

        {/* Bottom CTAs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex gap-4 justify-center mt-10 mb-8">
          <Link href={`/simulations/${slug}`}><button className="btn-secondary">Replay Simulation</button></Link>
          <Link href="/simulations"><button className="btn-primary">Try Another</button></Link>
          <Link href="/dashboard"><button className="btn-secondary">Dashboard</button></Link>
        </motion.div>
      </div>
    </div>
  )
}
