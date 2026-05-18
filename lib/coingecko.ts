import { getCached, setCache } from './cache'

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  high_24h: number
  low_24h: number
}

export interface CryptoHistoryPoint {
  timestamp: number
  price: number
  volume: number
  market_cap: number
}

export async function getCryptoPrice(
  coinId: string,
  currency: string = 'inr'
): Promise<CryptoPrice | null> {
  const cacheKey = `crypto_price_${coinId}_${currency}`
  const cached = await getCached<CryptoPrice>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&ids=${coinId}&sparkline=false`,
      { next: { revalidate: 300 } }
    )

    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`)

    const data = await res.json()
    if (!data || data.length === 0) return null

    const coin = data[0]
    const result: CryptoPrice = {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
    }

    await setCache(cacheKey, result, false)
    return result
  } catch (error) {
    console.error('CoinGecko price error:', error)
    return null
  }
}

export async function getCryptoHistory(
  coinId: string,
  days: number = 365,
  currency: string = 'inr'
): Promise<CryptoHistoryPoint[]> {
  const cacheKey = `crypto_history_${coinId}_${days}_${currency}`
  const cached = await getCached<CryptoHistoryPoint[]>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`,
      { next: { revalidate: 3600 } }
    )

    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`)

    const data = await res.json()

    const points: CryptoHistoryPoint[] = data.prices.map(
      (price: [number, number], i: number) => ({
        timestamp: price[0],
        price: price[1],
        volume: data.total_volumes?.[i]?.[1] || 0,
        market_cap: data.market_caps?.[i]?.[1] || 0,
      })
    )

    await setCache(cacheKey, points, true)
    return points
  } catch (error) {
    console.error('CoinGecko history error:', error)
    return []
  }
}

export async function getCryptoPriceAtDate(
  coinId: string,
  date: string, // DD-MM-YYYY format
  currency: string = 'inr'
): Promise<number | null> {
  const cacheKey = `crypto_date_${coinId}_${date}_${currency}`
  const cached = await getCached<number>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/history?date=${date}&localization=false`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`)

    const data = await res.json()
    const price = data?.market_data?.current_price?.[currency]

    if (price) {
      await setCache(cacheKey, price, true)
    }

    return price || null
  } catch (error) {
    console.error('CoinGecko date price error:', error)
    return null
  }
}

export async function getMultipleCryptoPrices(
  coinIds: string[],
  currency: string = 'inr'
): Promise<CryptoPrice[]> {
  const ids = coinIds.join(',')
  const cacheKey = `crypto_multi_${ids}_${currency}`
  const cached = await getCached<CryptoPrice[]>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&ids=${ids}&sparkline=false`,
      { next: { revalidate: 300 } }
    )

    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`)

    const data = await res.json()
    const results: CryptoPrice[] = data.map((coin: Record<string, unknown>) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
    }))

    await setCache(cacheKey, results, false)
    return results
  } catch (error) {
    console.error('CoinGecko multi price error:', error)
    return []
  }
}
