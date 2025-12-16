import { createClient } from '@/lib/supabase/server'

// Fetch the authenticated user and their profile (role) from the users table.
const SUPABASE_ENV_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const
const MISSING_SUPABASE_ENV = SUPABASE_ENV_KEYS.filter((key) => !process.env[key])
const HAS_SUPABASE_ENV = MISSING_SUPABASE_ENV.length === 0
const IS_DEV = process.env.NODE_ENV !== 'production'

export async function getSessionUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
      .from('users')
      .select('id, role, full_name, email')
      .eq('id', user.id)
      .single()

    return { user, profile }
  } catch (error) {
    if (!HAS_SUPABASE_ENV) {
      if (IS_DEV) {
        console.warn(`Supabase env vars missing (${MISSING_SUPABASE_ENV.join(', ')}); skipping session lookup.`)
      }
    } else if (IS_DEV) {
      console.error('Failed to fetch session user', error)
    }
    return null
  }
}
