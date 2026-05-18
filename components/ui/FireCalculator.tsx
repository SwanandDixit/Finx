'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Info, CheckCircle2, AlertCircle } from 'lucide-react'

interface FireCalculatorProps {
  currentAge: number
  monthlySurplus: number
}

export default function FireCalculator({ currentAge = 25, monthlySurplus = 0 }: FireCalculatorProps) {
  const [retireAge, setRetireAge] = useState(50)
  const [monthlyExpense, setMonthlyExpense] = useState(50000)
  const [expectedReturn, setExpectedReturn] = useState(12) // 12% p.a.

  const yearsToRetire = Math.max(1, retireAge - currentAge)
  const monthsToRetire = yearsToRetire * 12

  // 25x Rule of thumb: FIRE Number = annual expense * 25
  const fireNumber = monthlyExpense * 12 * 25

  // PMT = FV * (r / ((1+r)^n - 1))
  const monthlyRate = (expectedReturn / 100) / 12
  const compoundFactor = Math.pow(1 + monthlyRate, monthsToRetire) - 1
  const neededContribution = compoundFactor > 0 ? fireNumber * (monthlyRate / compoundFactor) : 0

  const gap = neededContribution - monthlySurplus
  const isOnTrack = gap <= 0
  const progressPercent = Math.min(100, Math.round((monthlySurplus / Math.max(1, neededContribution)) * 100))

  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <Flame size={20} style={{ color: '#FF7A00' }} />
          <h3 className="font-bold text-lg">Interactive FIRE retirement planner</h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-mono-data" 
          style={{ background: 'rgba(255, 122, 0, 0.1)', color: '#FF7A00', border: '1px solid rgba(255, 122, 0, 0.15)' }}>
          Retire Early Rule
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sliders Block */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Target Retirement Age</label>
              <span className="font-mono-data text-sm font-bold" style={{ color: 'var(--accent)' }}>{retireAge} Years</span>
            </div>
            <input 
              type="range" 
              min={currentAge + 1} 
              max={75} 
              value={retireAge}
              onChange={e => setRetireAge(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-2xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>Min ({currentAge + 1})</span>
              <span>75</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Post-Retirement Expense (Monthly)</label>
              <span className="font-mono-data text-sm font-bold">₹{monthlyExpense.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min={10000} 
              max={500000} 
              step={1000}
              value={monthlyExpense}
              onChange={e => setMonthlyExpense(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-2xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>₹10,000</span>
              <span>₹5,00,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Expected Annual Yield</label>
              <span className="font-mono-data text-sm font-bold" style={{ color: 'var(--positive)' }}>{expectedReturn}% p.a.</span>
            </div>
            <input 
              type="range" 
              min={6} 
              max={18} 
              step={0.5}
              value={expectedReturn}
              onChange={e => setExpectedReturn(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-2xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>6% (Conservative)</span>
              <span>18% (Aggressive)</span>
            </div>
          </div>
        </div>

        {/* Calculations Block */}
        <div className="flex flex-col justify-between p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Target FIRE Corpus (25x Rule)</span>
              <span className="font-mono-data text-2xl font-black text-gradient">
                ₹{(fireNumber / 10000000).toFixed(2)} Cr
              </span>
              <span className="text-3xs block font-mono-data" style={{ color: 'var(--text-secondary)' }}>
                (₹{fireNumber.toLocaleString('en-IN')} total corpus)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-3xs block" style={{ color: 'var(--text-muted)' }}>Time Remaining</span>
                <span className="font-mono-data text-sm font-bold">{yearsToRetire} Years</span>
              </div>
              <div>
                <span className="text-3xs block" style={{ color: 'var(--text-muted)' }}>Yield Assumption</span>
                <span className="font-mono-data text-sm font-bold" style={{ color: 'var(--positive)' }}>{expectedReturn}%</span>
              </div>
            </div>

            <div>
              <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Needed Systematic Contribution</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-data text-lg font-bold">
                  ₹{Math.round(neededContribution).toLocaleString('en-IN')}/mo
                </span>
                <span className="text-2xs" style={{ color: 'var(--text-secondary)' }}>vs ₹{Math.round(monthlySurplus).toLocaleString('en-IN')} surplus</span>
              </div>
            </div>
          </div>

          {/* Goal Tracker status */}
          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between text-2xs mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Goal Contribution Progress</span>
              <span className="font-mono-data font-bold">{progressPercent}%</span>
            </div>
            <div className="progress-bar mb-3">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: isOnTrack ? 'var(--positive)' : 'var(--warning)' }} />
            </div>

            {isOnTrack ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg text-2xs" style={{ background: 'rgba(0, 229, 160, 0.06)', border: '1px solid rgba(0, 229, 160, 0.1)' }}>
                <CheckCircle2 size={12} style={{ color: 'var(--positive)' }} />
                <span style={{ color: 'var(--text-primary)' }}>
                  <strong>Fully On Track!</strong> Your current surplus of ₹{monthlySurplus.toLocaleString('en-IN')} handles this plan easily.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-lg text-2xs" style={{ background: 'rgba(255, 184, 0, 0.06)', border: '1px solid rgba(255, 184, 0, 0.1)' }}>
                <AlertCircle size={12} style={{ color: 'var(--warning)' }} />
                <span style={{ color: 'var(--text-primary)' }}>
                  <strong>Gap of ₹{Math.round(gap).toLocaleString('en-IN')}/mo</strong>. Trim lifestyle leakage or increase retirement age to balance.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
