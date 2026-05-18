import { getCached, setCache } from './cache'

// yahoo-finance2 is a server-only module
// eslint-disable-next-line @typescript-eslint/no-require-imports
let yahooFinance: any = null

async function getYahoo() {
  if (!yahooFinance) {
    const mod = await import('yahoo-finance2')
    yahooFinance = mod.default
  }
  return yahooFinance
}

export interface StockQuote {
  symbol: string
  shortName: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  regularMarketDayHigh: number
  regularMarketDayLow: number
  regularMarketVolume: number
  regularMarketPreviousClose: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  marketCap: number
}

export interface StockHistoryPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  adjClose: number
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  const cacheKey = `stock_quote_${symbol}`
  const cached = await getCached<StockQuote>(cacheKey)
  if (cached) return cached

  try {
    const yf = await getYahoo()
    const quote = await yf.quote(symbol)

    const result: StockQuote = {
      symbol: quote.symbol || symbol,
      shortName: (quote.shortName as string) || symbol,
      regularMarketPrice: (quote.regularMarketPrice as number) || 0,
      regularMarketChange: (quote.regularMarketChange as number) || 0,
      regularMarketChangePercent: (quote.regularMarketChangePercent as number) || 0,
      regularMarketDayHigh: (quote.regularMarketDayHigh as number) || 0,
      regularMarketDayLow: (quote.regularMarketDayLow as number) || 0,
      regularMarketVolume: (quote.regularMarketVolume as number) || 0,
      regularMarketPreviousClose: (quote.regularMarketPreviousClose as number) || 0,
      fiftyTwoWeekHigh: (quote.fiftyTwoWeekHigh as number) || 0,
      fiftyTwoWeekLow: (quote.fiftyTwoWeekLow as number) || 0,
      marketCap: (quote.marketCap as number) || 0,
    }

    await setCache(cacheKey, result, false)
    return result
  } catch (error) {
    console.error('Yahoo Finance quote error:', error)
    return null
  }
}

export async function getStockHistory(
  symbol: string,
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): Promise<StockHistoryPoint[]> {
  const cacheKey = `stock_history_${symbol}_${startDate}_${endDate}`
  const cached = await getCached<StockHistoryPoint[]>(cacheKey)
  if (cached) return cached

  try {
    const yf = await getYahoo()
    const result = await yf.historical(symbol, {
      period1: startDate,
      period2: endDate,
    })

    const points: StockHistoryPoint[] = result.map((item: any) => ({
      date: new Date(item.date).toISOString().split('T')[0],
      open: item.open || 0,
      high: item.high || 0,
      low: item.low || 0,
      close: item.close || 0,
      volume: item.volume || 0,
      adjClose: item.adjClose || item.close || 0,
    }))

    await setCache(cacheKey, points, true)
    return points
  } catch (error) {
    console.error('Yahoo Finance history error:', error)
    return []
  }
}

export async function getMultipleStockQuotes(
  symbols: string[]
): Promise<StockQuote[]> {
  const results = await Promise.allSettled(
    symbols.map((s) => getStockQuote(s))
  )

  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((r): r is StockQuote => r !== null)
}
