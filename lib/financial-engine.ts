export interface FinancialProfile {
  monthly_income: number
  essential_expenses: number
  lifestyle_expenses: number
  existing_savings: number
  existing_investments: { type: string; amount: number; name?: string }[]
  goals: string[]
  risk_tolerance: 'conservative' | 'balanced' | 'aggressive'
  liabilities: number
  age: number
  emis: number
}

export interface HealthScoreBreakdown {
  score: number
  savings_rate: number
  investable_surplus: number
  emergency_fund_gap: number
  debt_burden_ratio: number
  factors: { label: string; impact: number; description: string }[]
}

export interface AllocationPlan {
  name: string
  allocations: { category: string; percentage: number; amount: number; expected_return: number }[]
  total_monthly: number
}

export interface Projection {
  year: number
  conservative: number
  balanced: number
  aggressive: number
}

const RETURNS: Record<string, number> = {
  'Debt MF': 0.07,
  'Index Fund (Nifty 50)': 0.12,
  'Large Cap MF': 0.12,
  'Mid Cap MF': 0.15,
  'Small Cap MF': 0.18,
  'Direct Stocks': 0.14,
  'FD': 0.07,
  'Gold ETF': 0.08,
  'Crypto (BTC/ETH)': 0.20,
  'International ETF': 0.11,
}

export function calculateSurplus(p: FinancialProfile): number {
  return Math.max(0, p.monthly_income - p.essential_expenses - p.lifestyle_expenses - p.emis)
}

export function calculateEmergencyFundGap(p: FinancialProfile): number {
  return Math.max(0, p.essential_expenses * 6 - p.existing_savings)
}

export function calculateDebtBurdenRatio(p: FinancialProfile): number {
  return p.monthly_income === 0 ? 0 : (p.emis / p.monthly_income) * 100
}

export function calculateSavingsRate(p: FinancialProfile): number {
  return p.monthly_income === 0 ? 0 : (calculateSurplus(p) / p.monthly_income) * 100
}

export function calculateHealthScore(p: FinancialProfile): HealthScoreBreakdown {
  const sr = calculateSavingsRate(p)
  const efg = calculateEmergencyFundGap(p)
  const dbr = calculateDebtBurdenRatio(p)
  const surplus = calculateSurplus(p)
  const hasInv = p.existing_investments.some(i => i.amount > 0)
  let score = 50
  const factors: HealthScoreBreakdown['factors'] = []

  if (sr > 20) { score += 15; factors.push({ label: 'Good Savings Rate', impact: 15, description: `Saving ${sr.toFixed(1)}% of income` }) }
  if (sr > 30) { score += 10; factors.push({ label: 'Excellent Savings Rate', impact: 10, description: 'Over 30% — strong discipline' }) }
  if (efg === 0) { score += 10; factors.push({ label: 'Emergency Fund OK', impact: 10, description: '6-month buffer covered' }) }
  if (dbr > 60) { score -= 30; factors.push({ label: 'Critical Debt', impact: -30, description: `EMIs at ${dbr.toFixed(1)}% of income` }) }
  else if (dbr > 40) { score -= 20; factors.push({ label: 'High Debt', impact: -20, description: `EMIs at ${dbr.toFixed(1)}% of income` }) }
  if (hasInv) { score += 10; factors.push({ label: 'Active Investor', impact: 10, description: 'Has existing investments' }) }
  if (p.risk_tolerance === 'aggressive' && p.age < 30) { score += 5; factors.push({ label: 'Age Advantage', impact: 5, description: 'Young + aggressive = time advantage' }) }

  return { score: Math.max(0, Math.min(100, score)), savings_rate: sr, investable_surplus: surplus, emergency_fund_gap: efg, debt_burden_ratio: dbr, factors }
}

export function generateAllocations(surplus: number, riskTolerance: string) {
  const c: AllocationPlan = { name: 'Conservative', total_monthly: surplus, allocations: [
    { category: 'Debt MF', percentage: 40, amount: surplus * 0.4, expected_return: RETURNS['Debt MF'] },
    { category: 'Index Fund (Nifty 50)', percentage: 30, amount: surplus * 0.3, expected_return: RETURNS['Index Fund (Nifty 50)'] },
    { category: 'FD', percentage: 20, amount: surplus * 0.2, expected_return: RETURNS['FD'] },
    { category: 'Gold ETF', percentage: 10, amount: surplus * 0.1, expected_return: RETURNS['Gold ETF'] },
  ]}
  const b: AllocationPlan = { name: 'Balanced', total_monthly: surplus, allocations: [
    { category: 'Index Fund (Nifty 50)', percentage: 30, amount: surplus * 0.3, expected_return: RETURNS['Index Fund (Nifty 50)'] },
    { category: 'Large Cap MF', percentage: 20, amount: surplus * 0.2, expected_return: RETURNS['Large Cap MF'] },
    { category: 'Mid Cap MF', percentage: 20, amount: surplus * 0.2, expected_return: RETURNS['Mid Cap MF'] },
    { category: 'Debt MF', percentage: 15, amount: surplus * 0.15, expected_return: RETURNS['Debt MF'] },
    { category: 'Gold ETF', percentage: 10, amount: surplus * 0.1, expected_return: RETURNS['Gold ETF'] },
    { category: 'Crypto (BTC/ETH)', percentage: 5, amount: surplus * 0.05, expected_return: RETURNS['Crypto (BTC/ETH)'] },
  ]}
  const a: AllocationPlan = { name: 'Aggressive', total_monthly: surplus, allocations: [
    { category: 'Mid Cap MF', percentage: 25, amount: surplus * 0.25, expected_return: RETURNS['Mid Cap MF'] },
    { category: 'Small Cap MF', percentage: 15, amount: surplus * 0.15, expected_return: RETURNS['Small Cap MF'] },
    { category: 'Direct Stocks', percentage: 25, amount: surplus * 0.25, expected_return: RETURNS['Direct Stocks'] },
    { category: 'Index Fund (Nifty 50)', percentage: 20, amount: surplus * 0.2, expected_return: RETURNS['Index Fund (Nifty 50)'] },
    { category: 'Crypto (BTC/ETH)', percentage: 10, amount: surplus * 0.1, expected_return: RETURNS['Crypto (BTC/ETH)'] },
    { category: 'International ETF', percentage: 5, amount: surplus * 0.05, expected_return: RETURNS['International ETF'] },
  ]}
  if (riskTolerance === 'conservative') c.name += ' ★'
  else if (riskTolerance === 'balanced') b.name += ' ★'
  else a.name += ' ★'
  return { conservative: c, balanced: b, aggressive: a }
}

export function projectSIP(monthly: number, annualRate: number, years: number): number {
  const r = annualRate / 12; const n = years * 12
  if (r === 0) return monthly * n
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
}

export function generateProjections(plans: { conservative: AllocationPlan; balanced: AllocationPlan; aggressive: AllocationPlan }): Projection[] {
  return [1, 3, 5, 10].map(year => ({
    year,
    conservative: Math.round(plans.conservative.allocations.reduce((t, a) => t + projectSIP(a.amount, a.expected_return, year), 0)),
    balanced: Math.round(plans.balanced.allocations.reduce((t, a) => t + projectSIP(a.amount, a.expected_return, year), 0)),
    aggressive: Math.round(plans.aggressive.allocations.reduce((t, a) => t + projectSIP(a.amount, a.expected_return, year), 0)),
  }))
}

export function formatINR(v: number): string {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`
  return `₹${v.toLocaleString('en-IN')}`
}
