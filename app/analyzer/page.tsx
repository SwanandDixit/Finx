'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import HealthRing from '@/components/ui/HealthRing'
import WealthChart from '@/components/ui/WealthChart'
import AIStream from '@/components/ui/AIStream'
import MetricCard from '@/components/ui/MetricCard'
import { calculateHealthScore, calculateSurplus, calculateSavingsRate, calculateDebtBurdenRatio, generateAllocations, generateProjections, formatINR } from '@/lib/financial-engine'
import type { FinancialProfile, AllocationPlan } from '@/lib/financial-engine'

type Tab = 'conservative' | 'balanced' | 'aggressive'

function generateLocalFinancialNarrative(profile: any, health: any, surplus: number, savingsRate: number, debtRatio: number) {
  const surplusPct = profile.monthly_income > 0 ? ((surplus / profile.monthly_income) * 100).toFixed(0) : '0';
  const emergencyGap = health?.emergency_fund_gap || 0;
  
  return `### 📊 Strategic Financial Diagnosis & Wealth Roadmap

#### 1. Core Health Diagnosis
* **Financial Health Score**: **${health?.score || 50}/100** (Dynamic Portfolio Rating)
* **Savings Rate**: **${savingsRate.toFixed(1)}%** of gross monthly inflows
* **Investable Surplus**: **₹${surplus.toLocaleString('en-IN')}** per month (${surplusPct}% surplus ratio)
* **Debt Burden (EMI-to-Income)**: **${debtRatio.toFixed(1)}%** 
  * *Status*: ${debtRatio > 30 ? '⚠️ **Moderately High Debt load**. We highly recommend accelerating high-interest liability repayments to free up productive capital.' : '✅ **Healthy Debt metrics**. You have optimal financial leverage, allowing you to prioritize active compounding over debt servicing.'}

---

#### 2. Emergency Liquidity Reserve
${emergencyGap > 0 ? `⚠️ **Emergency Gap Detected**: Your current emergency reserve has a deficit of **₹${emergencyGap.toLocaleString('en-IN')}**. 
* **Target Buffer**: An ideal emergency fund for your essential profile (₹${profile.essential_expenses.toLocaleString('en-IN')}/mo) requires a 6-month liquid cushion of **₹${(profile.essential_expenses * 6).toLocaleString('en-IN')}**.
* **Action**: We advise allocating at least **40%** of your monthly surplus (₹${Math.round(surplus * 0.4).toLocaleString('en-IN')}) into a liquid savings or arbitrage fund before scaling riskier assets.` : '✅ **Fully Resilient**: Your emergency fund is completely capitalized. This structural shield protects your active assets from premature liquidation during market drawdowns.'}

---

#### 3. Strategic Asset Allocation & Goals
Based on your **${profile.risk_tolerance}** risk tolerance, we have structured a custom asset matrix aligned with your specified goals: ${profile.goals.length > 0 ? profile.goals.map((g: string) => `**${g}**`).join(', ') : '**Wealth Maximization**'}.
* **Equity Allocation (High Growth)**: Channel systematic investments (SIPs) to capture passive indexing and blue-chip momentum.
* **Fixed Income & Gold (Hedging)**: Build dynamic capital shields to reduce portfolio drawdowns during macroeconomic shifts.

---

#### 4. High-Impact Action Items
1. **Automate Pay-Yourself-First**: Configure automated standing instructions on salary day to remove human friction.
2. **Optimize Lifestyle Outflows**: Your lifestyle allocation stands at **₹${profile.lifestyle_expenses.toLocaleString('en-IN')}**. Trimming non-essential subscriptions or lifestyle leakage by a mere 10% redirects **₹${Math.round(profile.lifestyle_expenses * 0.1).toLocaleString('en-IN')}** monthly into high-yielding compound assets.
3. **Compound Discipline**: The single greatest factor in net-worth scaling is consistency. Avoid emotional portfolio rotation during market news cycles. Stay systemic.`;
}

export default function AnalyzerPage() {
  const [profile, setProfile] = useState<FinancialProfile | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('balanced')
  const [aiContent, setAiContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('finx_profile')
    if (stored) {
      const d = JSON.parse(stored)
      setProfile({
        monthly_income: d.monthly_income || 0, essential_expenses: d.essential_expenses || 0,
        lifestyle_expenses: d.lifestyle_expenses || 0, existing_savings: d.existing_savings || 0,
        existing_investments: d.existing_investments || [], goals: d.goals || [],
        risk_tolerance: d.risk_tolerance || 'balanced', liabilities: d.liabilities || 0,
        age: d.age || 25, emis: d.emis || 0,
      })
    }
  }, [])

  const health = profile ? calculateHealthScore(profile) : null
  const surplus = profile ? calculateSurplus(profile) : 0
  const savingsRate = profile ? calculateSavingsRate(profile) : 0
  const debtRatio = profile ? calculateDebtBurdenRatio(profile) : 0
  const allocs = profile ? generateAllocations(surplus, profile.risk_tolerance) : null
  const projections = allocs ? generateProjections(allocs) : []

  const chartData = projections.map(p => ({
    label: `${p.year}yr`, conservative: p.conservative, balanced: p.balanced, aggressive: p.aggressive,
  }))

  const runAnalysis = useCallback(async () => {
    if (!profile) return
    setAiContent('')
    setIsStreaming(true)
    setHasAnalyzed(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile }),
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
      const localReport = generateLocalFinancialNarrative(profile, health, surplus, savingsRate, debtRatio)
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
      // Stream handles dynamic closing if in catch, only close directly if not streaming
    }
  }, [profile, health, surplus, savingsRate, debtRatio])

  const currentPlan = allocs ? allocs[activeTab] : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <nav className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <Link href="/dashboard"><ArrowLeft size={20} style={{ color: 'var(--text-secondary)' }} /></Link>
        <span className="text-xl font-bold text-gradient">Financial Analyzer</span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!profile ? (
          <div className="glass-card p-12 text-center">
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>No financial profile found.</p>
            <Link href="/onboarding"><button className="btn-primary">Complete Onboarding</button></Link>
          </div>
        ) : (
          <>
            {/* Top Metrics */}
            <div className="grid md:grid-cols-5 gap-6 mb-10">
              <div className="glass-card p-6 flex items-center justify-center">
                <HealthRing score={health?.score || 0} size={140} />
              </div>
              <MetricCard label="Investable Surplus" value={formatINR(surplus)} positive={surplus > 0} />
              <MetricCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} positive={savingsRate > 20} />
              <MetricCard label="Debt Burden" value={`${debtRatio.toFixed(1)}%`} positive={debtRatio < 30} />
              <MetricCard label="Emergency Gap" value={formatINR(health?.emergency_fund_gap || 0)} positive={(health?.emergency_fund_gap || 1) === 0} />
            </div>

            {/* Plan Tabs */}
            <div className="flex gap-3 mb-6">
              {(['conservative', 'balanced', 'aggressive'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize"
                  style={{
                    background: activeTab === tab ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                    color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
                    border: `1px solid ${activeTab === tab ? 'var(--accent)' : 'var(--border-color)'}`,
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Allocation Table */}
            {currentPlan && (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 mb-8">
                <h3 className="text-lg font-bold mb-4">{currentPlan.name} Plan</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th className="text-left py-3 px-2" style={{ color: 'var(--text-muted)' }}>Category</th>
                        <th className="text-right py-3 px-2" style={{ color: 'var(--text-muted)' }}>Allocation</th>
                        <th className="text-right py-3 px-2" style={{ color: 'var(--text-muted)' }}>Monthly ₹</th>
                        <th className="text-right py-3 px-2" style={{ color: 'var(--text-muted)' }}>Expected Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPlan.allocations.map((a: AllocationPlan['allocations'][0], i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td className="py-3 px-2">{a.category}</td>
                          <td className="py-3 px-2 text-right font-mono-data" style={{ color: 'var(--accent)' }}>{a.percentage}%</td>
                          <td className="py-3 px-2 text-right font-mono-data">{formatINR(a.amount)}</td>
                          <td className="py-3 px-2 text-right font-mono-data" style={{ color: 'var(--positive)' }}>{(a.expected_return * 100).toFixed(0)}% p.a.</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Wealth Projections Chart */}
            <WealthChart data={chartData} />

            {/* AI Analysis */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">AI Financial Narrative</h3>
                <button onClick={runAnalysis} disabled={isStreaming}
                  className="btn-secondary flex items-center gap-2 text-sm" style={{ padding: '8px 16px' }}>
                  <RefreshCw size={14} className={isStreaming ? 'animate-spin' : ''} />
                  {hasAnalyzed ? 'Regenerate' : 'Generate Analysis'}
                </button>
              </div>
              <AIStream content={aiContent} isStreaming={isStreaming} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
