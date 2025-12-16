import { createClient } from '@/lib/supabase/server'

// Fetch the authenticated user and their profile (role) from the users table.
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
    const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    if (!hasEnv) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Supabase env vars missing; skipping session lookup.')
      }
    } else if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to fetch session user', error)
    }
    return null
  }
}
