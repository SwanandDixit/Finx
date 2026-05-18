import { NextRequest, NextResponse } from 'next/server'
import { getCryptoPrice, getCryptoHistory, getMultipleCryptoPrices } from '@/lib/coingecko'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const coin = searchParams.get('coin')
  const coins = searchParams.get('coins')
  const days = parseInt(searchParams.get('days') || '365')
  const currency = searchParams.get('currency') || 'inr'
  const type = searchParams.get('type') || 'price'

  try {
    if (coins) {
      const data = await getMultipleCryptoPrices(coins.split(','), currency)
      return NextResponse.json({ data })
    }

    if (!coin) return NextResponse.json({ error: 'coin param required' }, { status: 400 })

    if (type === 'history') {
      const data = await getCryptoHistory(coin, days, currency)
      return NextResponse.json({ coin, data })
    }

    const data = await getCryptoPrice(coin, currency)
    return NextResponse.json({ coin, data })
  } catch (error) {
    console.error('Crypto API error:', error)
    return NextResponse.json({ error: 'Failed to fetch crypto data' }, { status: 500 })
  }
}
