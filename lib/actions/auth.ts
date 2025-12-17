'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth/session'

export async function loginAction(email: string, password: string, redirectTo: string = '/') {
  try {
    const supabase = await createClient()
    
    // Sign in with email and password
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return { success: false, error: signInError.message }
    }

    if (!data.user) {
      return { success: false, error: 'Unable to sign in. Please try again.' }
    }

    // Get the session user with role information
    const sessionUser = await getSessionUser()
    
    if (!sessionUser || !sessionUser.profile) {
      return { success: false, error: 'Unable to retrieve user profile.' }
    }

    const role = sessionUser.profile.role

    // Determine redirect destination based on role
    let destination = redirectTo
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      // Admin users should go to admin panel
      destination = '/admin'
    } else if (role === 'CUSTOMER') {
      // Customer users go to redirectTo or home
      destination = redirectTo === '/admin' ? '/' : redirectTo
    }

    return { success: true, redirectTo: destination }
  } catch (error) {
    console.error('Login action error:', error)
    return { success: false, error: 'An unexpected error occurred during login.' }
  }
}
