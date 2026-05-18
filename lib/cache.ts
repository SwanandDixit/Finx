import { supabaseAdmin } from './supabase'

const LIVE_TTL_SECONDS = 3600       // 1 hour for live data
const HISTORICAL_TTL_SECONDS = 86400 // 24 hours for historical data

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('market_data_cache')
      .select('data, expires_at')
      .eq('cache_key', key)
      .single()

    if (error || !data) return null

    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    if (now > expiresAt) {
      // Cache expired, delete it
      await supabaseAdmin
        .from('market_data_cache')
        .delete()
        .eq('cache_key', key)
      return null
    }

    return data.data as T
  } catch {
    return null
  }
}

export async function setCache(
  key: string,
  data: unknown,
  isHistorical: boolean = false
): Promise<void> {
  const ttl = isHistorical ? HISTORICAL_TTL_SECONDS : LIVE_TTL_SECONDS
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString()

  try {
    await supabaseAdmin
      .from('market_data_cache')
      .upsert({
        cache_key: key,
        data,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt,
      }, {
        onConflict: 'cache_key',
      })
  } catch (error) {
    console.error('Cache write error:', error)
  }
}

export async function clearCache(keyPattern?: string): Promise<void> {
  try {
    if (keyPattern) {
      await supabaseAdmin
        .from('market_data_cache')
        .delete()
        .like('cache_key', `%${keyPattern}%`)
    } else {
      await supabaseAdmin
        .from('market_data_cache')
        .delete()
        .lt('expires_at', new Date().toISOString())
    }
  } catch (error) {
    console.error('Cache clear error:', error)
  }
}
