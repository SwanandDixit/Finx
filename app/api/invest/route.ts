import { NextRequest, NextResponse } from 'next/server'
import { calculateSurplus, calculateHealthScore, generateAllocations, generateProjections } from '@/lib/financial-engine'
import type { FinancialProfile } from '@/lib/financial-engine'
import { supabaseAdmin } from '@/lib/supabase'

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

    const surplus = calculateSurplus(profile)
    const health = calculateHealthScore(profile)
    const allocations = generateAllocations(surplus, profile.risk_tolerance)
    const projections = generateProjections(allocations)

    // Save to DB if user_id provided
    if (body.user_id && body.profile_id) {
      await supabaseAdmin.from('investment_plans').insert({
        user_id: body.user_id,
        profile_id: body.profile_id,
        conservative_plan: allocations.conservative,
        balanced_plan: allocations.balanced,
        aggressive_plan: allocations.aggressive,
        generated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      health_score: health,
      surplus,
      allocations,
      projections,
    })
  } catch (error) {
    console.error('Invest API error:', error)
    return NextResponse.json({ error: 'Investment plan generation failed' }, { status: 500 })
  }
}
