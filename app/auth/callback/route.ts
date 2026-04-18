import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase auth callback handler.
 *
 * Supabase email confirmation (and OAuth) links point here in PKCE flow:
 *   <site-url>/auth/callback?code=XXXX[&next=/some-path]
 *
 * This route exchanges the one-time code for a user session, sets the session
 * cookie, then redirects the user to `next` (default "/").
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Session established — redirect to the intended destination
      const redirectUrl = new URL(next, origin)
      return NextResponse.redirect(redirectUrl)
    }

    console.error('[auth/callback] Code exchange failed:', error.message)
  }

  // Something went wrong — send them to login with an error hint
  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('error', 'confirmation_failed')
  return NextResponse.redirect(loginUrl)
}
