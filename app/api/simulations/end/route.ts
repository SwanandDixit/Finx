import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, finalValue } = await req.json()

    const { error } = await supabaseAdmin
      .from('simulation_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        final_value: finalValue,
      })
      .eq('id', sessionId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('End simulation error:', error)
    return NextResponse.json({ error: 'Failed to end simulation' }, { status: 500 })
  }
}
