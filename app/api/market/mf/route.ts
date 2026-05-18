import { NextRequest, NextResponse } from 'next/server'
import { getMutualFundNAV } from '@/lib/mfapi'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const scheme = searchParams.get('scheme')

  if (!scheme) return NextResponse.json({ error: 'scheme param required' }, { status: 400 })

  try {
    const data = await getMutualFundNAV(parseInt(scheme))
    return NextResponse.json({ data })
  } catch (error) {
    console.error('MF API error:', error)
    return NextResponse.json({ error: 'Failed to fetch MF data' }, { status: 500 })
  }
}
