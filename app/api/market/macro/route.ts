import { NextRequest, NextResponse } from 'next/server'
import { getIndiaInflation, getIndiaGDP, getIndiaInterestRate } from '@/lib/worldbank'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const indicator = searchParams.get('indicator') || 'inflation'

  try {
    let data
    switch (indicator) {
      case 'gdp': data = await getIndiaGDP(); break
      case 'interest': data = await getIndiaInterestRate(); break
      default: data = await getIndiaInflation()
    }
    return NextResponse.json({ indicator, data })
  } catch (error) {
    console.error('Macro API error:', error)
    return NextResponse.json({ error: 'Failed to fetch macro data' }, { status: 500 })
  }
}
