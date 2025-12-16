import { createClient } from '@/lib/supabase/server'

// Fetch the authenticated user and their profile (role) from the users table.
export async function getSessionUser() {
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
}
