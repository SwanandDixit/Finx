import { NextRequest, NextResponse } from 'next/server'
import { streamClaude } from '@/lib/claude'
import { supabaseAdmin } from '@/lib/supabase'
import { getSimulationConfig, calculateOptimalOutcome } from '@/lib/simulation-engine'

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()

    const { data: session } = await supabaseAdmin
      .from('simulation_sessions')
      .select('*, simulations(*)')
      .eq('id', sessionId)
      .single()

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const config = getSimulationConfig(session.simulations.slug)
    if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 })

    const optimalValue = calculateOptimalOutcome(config)

    const systemPrompt = `You are a world-class trading mentor, behavioral economist, and financial strategist. Never judgmental, never preachy. Speak like a brilliant, calm analyst reviewing data. Frame everything as insight, not correction. Use real numbers from their decisions. Never say "you made a mistake" or "you should have".`

    const userPrompt = `A user just completed the "${config.name}" simulation.

Decision log: ${JSON.stringify(session.decisions || [])}
Starting capital: ₹${session.starting_value?.toLocaleString('en-IN')}
Final portfolio value: ₹${(session.final_value || session.starting_value)?.toLocaleString('en-IN')}
Optimal outcome: ₹${optimalValue.toLocaleString('en-IN')}

Analyze their performance:

1. BEHAVIORAL_FINGERPRINT: Score 0-10 on: Patience, Risk Calibration, Emotional Control, Opportunity Recognition, Conviction, Diversification. Return as JSON object.

2. BIAS_REPORT: Identify which biases appeared (loss aversion, FOMO, panic selling, herd mentality, anchoring, recency bias, overconfidence, analysis paralysis) with evidence. Return as JSON array of {bias, detected: boolean, explanation}.

3. ALTERNATE_TIMELINE: What if they held throughout? What were optimal decisions? Return as JSON {hold_value, optimal_value}.

4. HISTORICAL_PARALLEL: A real historical parallel to their behavior. 2-3 sentences.

5. MENTOR_SUMMARY: 4 paragraphs. What happened. Why psychologically. What experienced investors do. What to try next time. Analytical, not preachy.

Format your response as:
---FINGERPRINT---
{json}
---BIASES---
[json]
---TIMELINE---
{json}
---PARALLEL---
text
---MENTOR---
text paragraphs`

    const stream = await streamClaude(userPrompt, systemPrompt)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Simulation analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
