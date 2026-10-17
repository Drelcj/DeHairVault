// Auth Proxy
// Protects admin routes and refreshes Supabase auth tokens
//
// SECURITY NOTE: This proxy should NOT be used as the sole security boundary for authentication.
// Per Next.js security recommendations, always verify authentication state in your API routes,
// Server Actions, and page components as well. The proxy is primarily for session management
// and initial request filtering.

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';
import {
  COOKIE_MAX_AGE,
  CURRENCY_COOKIE_KEY,
  currencyForCountry,
  isSupportedCurrency,
  type SupportedCurrency,
} from '@/lib/currency/config';

// First visit: pick the display currency from the visitor's country (Vercel's
// geo header) and store it in the cookie the server and browser both read.
// Outside production, `?geo=GB` (any country code) overrides detection for testing.
function detectCurrency(request: NextRequest): SupportedCurrency | null {
  const geoOverride = process.env.VERCEL_ENV !== 'production'
    ? request.nextUrl.searchParams.get('geo')
    : null;
  if (geoOverride) return currencyForCountry(geoOverride);

  if (isSupportedCurrency(request.cookies.get(CURRENCY_COOKIE_KEY)?.value)) return null;
  return currencyForCountry(request.headers.get('x-vercel-ip-country'));
}

export async function proxy(request: NextRequest) {
  const detected = detectCurrency(request);
  // Set on the request too, so this same render already uses it
  if (detected) request.cookies.set(CURRENCY_COOKIE_KEY, detected);

  const response = await updateSession(request);

  if (detected) {
    response.cookies.set(CURRENCY_COOKIE_KEY, detected, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    });
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
