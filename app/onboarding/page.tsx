'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowRight, ArrowLeft, User, Wallet, ShoppingBag, PiggyBank, Target, CheckCircle } from 'lucide-react'

const GOALS = ['Emergency Fund', 'Travel', 'New Phone', 'Bike', 'House', 'Retirement', 'Education', 'Wedding']
const INVESTMENT_TYPES = ['FD', 'Stocks', 'Crypto', 'Mutual Fund', 'Gold', 'PPF', 'Other']

interface FormData {
  name: string; age: number; city: string
  salary: number; freelance: number; pocket_money: number
  rent: number; food: number; transport: number; bills: number; emis: number
  subscriptions: number; dining: number; entertainment: number; shopping: number
  existing_savings: number; investments: { type: string; amount: number }[]
  goals: string[]; risk_tolerance: number
}

const initial: FormData = {
  name: '', age: 22, city: '', salary: 0, freelance: 0, pocket_money: 0,
  rent: 0, food: 0, transport: 0, bills: 0, emis: 0,
  subscriptions: 0, dining: 0, entertainment: 0, shopping: 0,
  existing_savings: 0, investments: [],
  goals: [], risk_tolerance: 50,
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initial)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const totalSteps = 6

  const update = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }))

  const next = () => { if (step < totalSteps - 1) setStep(s => s + 1) }
  const prev = () => { if (step > 0) setStep(s => s - 1) }

  const toggleGoal = (g: string) => {
    setForm(prev => ({
      ...prev,
      goals: prev.goals.includes(g) ? prev.goals.filter(x => x !== g) : [...prev.goals, g],
    }))
  }

  const addInvestment = () => {
    setForm(prev => ({ ...prev, investments: [...prev.investments, { type: 'FD', amount: 0 }] }))
  }

  const updateInvestment = (i: number, field: string, value: string | number) => {
    setForm(prev => {
      const inv = [...prev.investments]
      inv[i] = { ...inv[i], [field]: value }
      return { ...prev, investments: inv }
    })
  }

  const removeInvestment = (i: number) => {
    setForm(prev => ({ ...prev, investments: prev.investments.filter((_, idx) => idx !== i) }))
  }

  const riskLabel = form.risk_tolerance < 33 ? 'Conservative' : form.risk_tolerance < 66 ? 'Balanced' : 'Aggressive'
  const riskMap: Record<string, string> = { Conservative: 'conservative', Balanced: 'balanced', Aggressive: 'aggressive' }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id

      const profile = {
        user_id: userId,
        monthly_income: form.salary + form.freelance + form.pocket_money,
        essential_expenses: form.rent + form.food + form.transport + form.bills + form.emis,
        lifestyle_expenses: form.subscriptions + form.dining + form.entertainment + form.shopping,
        existing_savings: form.existing_savings,
        existing_investments: form.investments,
        goals: form.goals,
        risk_tolerance: riskMap[riskLabel],
        liabilities: form.emis * 12,
      }

      if (userId) {
        await supabase.from('users').upsert({ id: userId, name: form.name, age: form.age })
        await supabase.from('financial_profiles').insert(profile)
      }

      // Store in localStorage as fallback
      localStorage.setItem('finx_profile', JSON.stringify({ ...profile, name: form.name, age: form.age, city: form.city, emis: form.emis }))

      router.push('/dashboard')
    } catch (err) {
      console.error('Save error:', err)
      localStorage.setItem('finx_profile', JSON.stringify(form))
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  const inputField = (label: string, field: string, type = 'number', prefix = '₹') => (
    <div>
      <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-data text-sm" style={{ color: 'var(--text-muted)' }}>{prefix}</span>}
        <input type={type} 
          value={type === 'number' && (form as any)[field] === 0 ? '' : (form as any)[field] as string}
          placeholder="0"
          onChange={e => update(field, type === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value) || 0) : e.target.value)}
          className="input-dark" style={prefix ? { paddingLeft: 36 } : {}}
        />
      </div>
    </div>
  )

  const steps = [
    // Step 1: Basic Info
    <div key="step1" className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-2"><User size={24} style={{ color: 'var(--accent)' }} /><h2 className="text-xl font-bold">About You</h2></div>
      {inputField('Name', 'name', 'text', '')}
      <div className="grid grid-cols-2 gap-4">
        {inputField('Age', 'age', 'number', '')}
        {inputField('City', 'city', 'text', '')}
      </div>
    </div>,
    // Step 2: Income
    <div key="step2" className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-2"><Wallet size={24} style={{ color: 'var(--accent)' }} /><h2 className="text-xl font-bold">Monthly Income</h2></div>
      {inputField('Salary / Stipend', 'salary')}
      {inputField('Freelance / Side Income', 'freelance')}
      {inputField('Pocket Money / Other', 'pocket_money')}
      <div className="p-3 rounded-xl" style={{ background: 'var(--accent-dim)' }}>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Monthly Income: </span>
        <span className="font-mono-data font-bold" style={{ color: 'var(--accent)' }}>₹{(form.salary + form.freelance + form.pocket_money).toLocaleString('en-IN')}</span>
      </div>
    </div>,
    // Step 3: Essential Expenses
    <div key="step3" className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-2"><ShoppingBag size={24} style={{ color: 'var(--accent)' }} /><h2 className="text-xl font-bold">Essential Expenses</h2></div>
      <div className="grid grid-cols-2 gap-4">
        {inputField('Rent', 'rent')}
        {inputField('Food & Groceries', 'food')}
        {inputField('Transport', 'transport')}
        {inputField('Bills & Utilities', 'bills')}
      </div>
      {inputField('EMIs (Loans)', 'emis')}
    </div>,
    // Step 4: Lifestyle
    <div key="step4" className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-2"><ShoppingBag size={24} style={{ color: 'var(--warning)' }} /><h2 className="text-xl font-bold">Lifestyle Expenses</h2></div>
      <div className="grid grid-cols-2 gap-4">
        {inputField('Subscriptions', 'subscriptions')}
        {inputField('Dining Out', 'dining')}
        {inputField('Entertainment', 'entertainment')}
        {inputField('Shopping', 'shopping')}
      </div>
    </div>,
    // Step 5: Savings & Investments
    <div key="step5" className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-2"><PiggyBank size={24} style={{ color: 'var(--accent)' }} /><h2 className="text-xl font-bold">Savings & Investments</h2></div>
      {inputField('Total Existing Savings', 'existing_savings')}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current Investments</span>
          <button onClick={addInvestment} className="text-xs font-medium px-3 py-1 rounded-lg" style={{ color: 'var(--accent)', background: 'var(--accent-dim)' }}>+ Add</button>
        </div>
        {form.investments.map((inv, i) => (
          <div key={i} className="flex gap-3 mb-3 items-center">
            <select value={inv.type} onChange={e => updateInvestment(i, 'type', e.target.value)} className="input-dark" style={{ width: 140 }}>
              {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-data text-sm" style={{ color: 'var(--text-muted)' }}>₹</span>
              <input type="number" 
                value={inv.amount === 0 ? '' : inv.amount} 
                placeholder="0"
                onChange={e => updateInvestment(i, 'amount', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)} 
                className="input-dark pl-8" 
              />
            </div>
            <button onClick={() => removeInvestment(i)} className="text-sm px-2" style={{ color: 'var(--negative)' }}>✕</button>
          </div>
        ))}
      </div>
    </div>,
    // Step 6: Goals & Risk
    <div key="step6" className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-2"><Target size={24} style={{ color: 'var(--accent)' }} /><h2 className="text-xl font-bold">Goals & Risk Appetite</h2></div>
      <div>
        <label className="text-sm mb-3 block" style={{ color: 'var(--text-secondary)' }}>Financial Goals (select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(g => (
            <button key={g} onClick={() => toggleGoal(g)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: form.goals.includes(g) ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                color: form.goals.includes(g) ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${form.goals.includes(g) ? 'var(--accent)' : 'var(--border-color)'}`,
              }}
            >
              {form.goals.includes(g) && <CheckCircle size={14} className="inline mr-1" />}
              {g}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>
          Risk Tolerance: <span className="font-bold" style={{ color: form.risk_tolerance < 33 ? '#3B82F6' : form.risk_tolerance < 66 ? 'var(--warning)' : 'var(--negative)' }}>{riskLabel}</span>
        </label>
        <input type="range" min="0" max="100" value={form.risk_tolerance} onChange={e => update('risk_tolerance', parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #3B82F6, var(--warning), var(--negative))` }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Safe</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>YOLO</span>
        </div>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="bg-grid absolute inset-0 opacity-20" />
      <div className="w-full max-w-lg relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Step {step + 1} of {totalSteps}</span>
            <span className="text-sm font-mono-data" style={{ color: 'var(--accent)' }}>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} /></div>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            className="glass-card p-8">
            {steps[step]}

            <div className="flex justify-between mt-8">
              <button onClick={prev} disabled={step === 0} className="btn-secondary flex items-center gap-2 disabled:opacity-30"
                style={{ padding: '10px 20px' }}>
                <ArrowLeft size={16} /> Back
              </button>
              {step < totalSteps - 1 ? (
                <button onClick={next} className="btn-primary flex items-center gap-2" style={{ padding: '10px 20px' }}>
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={saving} className="btn-primary flex items-center gap-2" style={{ padding: '10px 24px' }}>
                  {saving ? 'Saving...' : <>Complete <CheckCircle size={16} /></>}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
