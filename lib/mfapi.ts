import { getCached, setCache } from './cache'

const MFAPI_BASE = 'https://api.mfapi.in/mf'

export interface MutualFundNAV {
  date: string
  nav: number
}

export interface MutualFundData {
  schemeCode: number
  schemeName: string
  nav: MutualFundNAV[]
}

export async function getMutualFundNAV(schemeCode: number): Promise<MutualFundData | null> {
  const cacheKey = `mf_nav_${schemeCode}`
  const cached = await getCached<MutualFundData>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(`${MFAPI_BASE}/${schemeCode}`, {
      next: { revalidate: 86400 },
    })

    if (!res.ok) throw new Error(`MF API error: ${res.status}`)

    const data = await res.json()

    const result: MutualFundData = {
      schemeCode: data.meta?.scheme_code || schemeCode,
      schemeName: data.meta?.scheme_name || `Scheme ${schemeCode}`,
      nav: (data.data || []).map((item: { date: string; nav: string }) => ({
        date: item.date,
        nav: parseFloat(item.nav) || 0,
      })),
    }

    await setCache(cacheKey, result, true)
    return result
  } catch (error) {
    console.error('MF API error:', error)
    return null
  }
}

// Popular mutual fund scheme codes for investment suggestions
export const POPULAR_SCHEMES = {
  // Index Funds
  NIFTY_50_INDEX: 120505,        // UTI Nifty 50 Index Fund
  NIFTY_NEXT_50: 120506,         // UTI Nifty Next 50 Index Fund
  
  // Large Cap
  AXIS_BLUECHIP: 120503,         // Axis Bluechip Fund
  MIRAE_LARGE_CAP: 118834,       // Mirae Asset Large Cap Fund
  
  // Mid Cap
  HDFC_MIDCAP: 101356,           // HDFC Mid-Cap Opportunities Fund
  KOTAK_EMERGING: 120505,        // Kotak Emerging Equity Fund
  
  // Small Cap
  SBI_SMALL_CAP: 125494,         // SBI Small Cap Fund
  NIPPON_SMALL_CAP: 113177,      // Nippon India Small Cap Fund
  
  // Debt
  HDFC_SHORT_TERM: 109685,       // HDFC Short Term Debt Fund
  SBI_MAGNUM_GILT: 119455,       // SBI Magnum Gilt Fund
  
  // Gold
  SBI_GOLD_ETF: 135637,          // SBI Gold ETF
}
