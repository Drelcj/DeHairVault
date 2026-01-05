'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP } from '@/lib/utils/rate-limit'

export async function loginAction(email: string, password: string, redirectTo?: string) {
  // Rate limiting: 5 attempts per minute per IP
  const headersList = await headers()
  const clientIP = getClientIP(headersList)
  const rateLimitResult = await checkRateLimit(`login:${clientIP}`, {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
  })

  if (!rateLimitResult.success) {
    const waitSeconds = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    return { error: `Too many login attempts. Please try again in ${waitSeconds} seconds.` }
  }

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

  // Use service client to bypass RLS for role lookup
  const serviceClient = createServiceClient()

  // Fetch user role to determine redirect destination
  const { data: profile, error: profileError } = await serviceClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  console.log('[Login] User:', user.id, user.email, 'Profile:', profile, 'Error:', profileError)

  // Admin users always go to admin dashboard
  // Other users go to redirectTo or homepage
  let destination = redirectTo || '/'
  if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
    destination = '/admin'
  }

  console.log('[Login] Destination:', destination, 'Role:', profile?.role)

  // Revalidate the entire layout to ensure HeaderShell gets fresh session data
  revalidatePath('/', 'layout')

  return { success: true, destination }
}
