'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAction(email: string, password: string) {
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

  let destination = '/'
  if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
    destination = '/admin'
  }

  // Revalidate the entire layout to ensure HeaderShell gets fresh session data
  revalidatePath('/', 'layout')

  return { success: true, destination }
}
