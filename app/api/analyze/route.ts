import { NextRequest, NextResponse } from 'next/server'
import { streamClaude } from '@/lib/claude'
import { calculateHealthScore, calculateSurplus, calculateDebtBurdenRatio, calculateSavingsRate, generateAllocations, generateProjections } from '@/lib/financial-engine'
import type { FinancialProfile } from '@/lib/financial-engine'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const profile: FinancialProfile = {
      monthly_income: body.monthly_income || 0,
      essential_expenses: body.essential_expenses || 0,
      lifestyle_expenses: body.lifestyle_expenses || 0,
      existing_savings: body.existing_savings || 0,
      existing_investments: body.existing_investments || [],
      goals: body.goals || [],
      risk_tolerance: body.risk_tolerance || 'balanced',
      liabilities: body.liabilities || 0,
      age: body.age || 25,
      emis: body.emis || 0,
    }

    const health = calculateHealthScore(profile)
    const surplus = calculateSurplus(profile)
    const debtRatio = calculateDebtBurdenRatio(profile)
    const savingsRate = calculateSavingsRate(profile)
    const allocations = generateAllocations(surplus, profile.risk_tolerance)
    const projections = generateProjections(allocations)

    const systemPrompt = `You are a brilliant, calm financial analyst. Never preachy. Never judgmental. Speak with data and insight. You're analyzing the finances of a young Indian person. Use INR (₹) for all amounts.`

    const userPrompt = `Analyze this financial profile:
- Age: ${profile.age}
- Monthly Income: ₹${profile.monthly_income.toLocaleString('en-IN')}
- Essential Expenses: ₹${profile.essential_expenses.toLocaleString('en-IN')}
- Lifestyle Expenses: ₹${profile.lifestyle_expenses.toLocaleString('en-IN')}
- EMIs: ₹${profile.emis.toLocaleString('en-IN')}
- Existing Savings: ₹${profile.existing_savings.toLocaleString('en-IN')}
- Investments: ${JSON.stringify(profile.existing_investments)}
- Goals: ${profile.goals.join(', ')}
- Risk Tolerance: ${profile.risk_tolerance}

Calculated metrics:
- Health Score: ${health.score}/100
- Investable Surplus: ₹${surplus.toLocaleString('en-IN')}/month
- Savings Rate: ${savingsRate.toFixed(1)}%
- Debt Burden: ${debtRatio.toFixed(1)}%
- Emergency Fund Gap: ₹${health.emergency_fund_gap.toLocaleString('en-IN')}

Investment allocations generated:
${JSON.stringify(allocations, null, 2)}

Projections (1yr, 3yr, 5yr, 10yr):
${JSON.stringify(projections, null, 2)}

Provide:
1. A 2-paragraph personalized financial narrative (analytical, data-driven, not preachy)
2. One key insight about their biggest financial opportunity
3. One risk they should be aware of

Be specific. Use their actual numbers. Frame everything as insight, not advice.`

    const stream = await streamClaude(userPrompt, systemPrompt)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Health-Score': health.score.toString(),
        'X-Surplus': surplus.toString(),
        'X-Savings-Rate': savingsRate.toFixed(1),
        'X-Debt-Ratio': debtRatio.toFixed(1),
      },
    })
  } catch (error) {
    console.error('Analyze API error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
