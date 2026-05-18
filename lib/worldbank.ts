import { getCached, setCache } from './cache'

const WORLDBANK_BASE = 'https://api.worldbank.org/v2'

export interface MacroDataPoint {
  year: number
  value: number | null
}

export async function getIndiaInflation(): Promise<MacroDataPoint[]> {
  const cacheKey = 'macro_india_inflation'
  const cached = await getCached<MacroDataPoint[]>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(
      `${WORLDBANK_BASE}/country/IN/indicator/FP.CPI.TOTL.ZG?format=json&per_page=30`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) throw new Error(`World Bank API error: ${res.status}`)

    const data = await res.json()
    const entries = data[1] || []

    const points: MacroDataPoint[] = entries
      .map((entry: { date: string; value: number | null }) => ({
        year: parseInt(entry.date),
        value: entry.value,
      }))
      .filter((p: MacroDataPoint) => p.value !== null)
      .sort((a: MacroDataPoint, b: MacroDataPoint) => a.year - b.year)

    await setCache(cacheKey, points, true)
    return points
  } catch (error) {
    console.error('World Bank inflation error:', error)
    return []
  }
}

export async function getIndiaGDP(): Promise<MacroDataPoint[]> {
  const cacheKey = 'macro_india_gdp'
  const cached = await getCached<MacroDataPoint[]>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(
      `${WORLDBANK_BASE}/country/IN/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=30`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) throw new Error(`World Bank API error: ${res.status}`)

    const data = await res.json()
    const entries = data[1] || []

    const points: MacroDataPoint[] = entries
      .map((entry: { date: string; value: number | null }) => ({
        year: parseInt(entry.date),
        value: entry.value,
      }))
      .filter((p: MacroDataPoint) => p.value !== null)
      .sort((a: MacroDataPoint, b: MacroDataPoint) => a.year - b.year)

    await setCache(cacheKey, points, true)
    return points
  } catch (error) {
    console.error('World Bank GDP error:', error)
    return []
  }
}

export async function getIndiaInterestRate(): Promise<MacroDataPoint[]> {
  const cacheKey = 'macro_india_interest'
  const cached = await getCached<MacroDataPoint[]>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(
      `${WORLDBANK_BASE}/country/IN/indicator/FR.INR.RINR?format=json&per_page=30`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) throw new Error(`World Bank API error: ${res.status}`)

    const data = await res.json()
    const entries = data[1] || []

    const points: MacroDataPoint[] = entries
      .map((entry: { date: string; value: number | null }) => ({
        year: parseInt(entry.date),
        value: entry.value,
      }))
      .filter((p: MacroDataPoint) => p.value !== null)
      .sort((a: MacroDataPoint, b: MacroDataPoint) => a.year - b.year)

    await setCache(cacheKey, points, true)
    return points
  } catch (error) {
    console.error('World Bank interest rate error:', error)
    return []
  }
}
