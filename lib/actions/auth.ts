'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAction(email: string, password: string, redirectTo?: string) {
  // Basic input validation
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { error: 'Please provide a valid email address.' }
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  const supabase = await createClient()

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: signInError.message }
  }

  const user = data.user
  if (!user) {
    return { error: 'Unable to sign in. Please try again.' }
  }

  // Fetch user role to determine redirect destination
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  // Admin users always go to admin dashboard
  // Other users go to redirectTo or homepage
  let destination = redirectTo || '/'
  if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
    destination = '/admin'
  }

  // Revalidate the entire layout to ensure HeaderShell gets fresh session data
  revalidatePath('/', 'layout')

  return { success: true, destination }
}
