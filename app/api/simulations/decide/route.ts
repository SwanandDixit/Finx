import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, decision } = await req.json()

    // Get current session
    const { data: session, error: getErr } = await supabaseAdmin
      .from('simulation_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (getErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const decisions = [...(session.decisions || []), decision]

    const { error: updateErr } = await supabaseAdmin
      .from('simulation_sessions')
      .update({ decisions })
      .eq('id', sessionId)

    if (updateErr) throw updateErr

    return NextResponse.json({ success: true, decisions })
  } catch (error) {
    console.error('Decision record error:', error)
    return NextResponse.json({ error: 'Failed to record decision' }, { status: 500 })
  }
}
