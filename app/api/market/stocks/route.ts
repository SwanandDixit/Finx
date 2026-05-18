import { NextRequest, NextResponse } from 'next/server'
import { getStockQuote, getStockHistory } from '@/lib/yahoo'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const type = searchParams.get('type') || 'quote'
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
  }

  try {
    if (type === 'history' && start && end) {
      const data = await getStockHistory(symbol, start, end)
      return NextResponse.json({ symbol, data })
    }

    const data = await getStockQuote(symbol)
    return NextResponse.json({ symbol, data })
  } catch (error) {
    console.error('Stock API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
}
