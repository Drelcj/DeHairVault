// Auth Proxy
// Protects admin routes and refreshes Supabase auth tokens
// 
// SECURITY NOTE: This proxy should NOT be used as the sole security boundary for authentication.
// Per Next.js security recommendations, always verify authentication state in your API routes,
// Server Actions, and page components as well. The proxy is primarily for session management
// and initial request filtering.

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
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
