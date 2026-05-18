import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Browser client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client with service role for API routes (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Auth helpers
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })
  if (error) throw error

  // Create user profile in users table
  if (data.user) {
    await supabaseAdmin.from('users').upsert({
      id: data.user.id,
      email: data.user.email,
      name,
    })
  }

  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Database helpers
export async function getFinancialProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('financial_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function saveFinancialProfile(userId: string, profile: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from('financial_profiles')
    .upsert({
      user_id: userId,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getInvestmentPlan(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('investment_plans')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function saveInvestmentPlan(userId: string, profileId: string, plan: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from('investment_plans')
    .insert({
      user_id: userId,
      profile_id: profileId,
      ...plan,
      generated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSimulationSessions(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('simulation_sessions')
    .select('*, simulations(*)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getSimulationSession(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from('simulation_sessions')
    .select('*, simulations(*)')
    .eq('id', sessionId)
    .single()

  if (error) throw error
  return data
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}
