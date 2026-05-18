import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSimulationConfig, initSimulationState } from '@/lib/simulation-engine'

export async function POST(req: NextRequest) {
  try {
    const { slug, userId } = await req.json()

    const config = getSimulationConfig(slug)
    if (!config) return NextResponse.json({ error: 'Simulation not found' }, { status: 404 })

    // Get or create simulation record
    let { data: sim } = await supabaseAdmin
      .from('simulations')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!sim) {
      const { data: newSim, error } = await supabaseAdmin.from('simulations').insert({
        slug: config.slug,
        name: config.name,
        description: config.description,
        difficulty: config.difficulty,
        duration_mins: config.duration_mins,
        data_period_start: config.datePeriodStart,
        data_period_end: config.datePeriodEnd,
        scenario_config: config,
      }).select().single()
      if (error) throw error
      sim = newSim
    }

    if (!sim) {
      return NextResponse.json({ error: 'Failed to initialize simulation record' }, { status: 500 })
    }

    // Create session
    const { data: session, error: sessErr } = await supabaseAdmin
      .from('simulation_sessions')
      .insert({
        user_id: userId || null,
        simulation_id: sim.id,
        starting_value: config.startingCapital,
        decisions: [],
        status: 'active',
      })
      .select()
      .single()

    if (sessErr) throw sessErr

    const state = initSimulationState(config, session.id)

    return NextResponse.json({ session, state, config })
  } catch (error) {
    console.error('Simulation start error:', error)
    return NextResponse.json({ error: 'Failed to start simulation' }, { status: 500 })
  }
}
