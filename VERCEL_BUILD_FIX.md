# Vercel Build Fix Summary

## Problem
The error "Your project's URL and Key are required to create a Supabase client!" occurred during Vercel build because:

1. Next.js tried to **statically prerender** `/admin/products` and `/admin/products/[id]` at build time
2. These pages call `createServiceClient()` which requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Environment variables are **not available** during static generation on Vercel—they're only available at runtime

## Solution Applied
Added `export const dynamic = 'force-dynamic'` to all admin pages:
- `app/admin/page.tsx` 
- `app/admin/products/page.tsx`
- `app/admin/products/[id]/page.tsx`
- `app/admin/products/new/page.tsx`

This forces Next.js to render these pages **on-demand at runtime** instead of at build time, ensuring environment variables are available.

## Vercel Environment Variables Required
Ensure these are set in Vercel Dashboard → Project Settings → Environment Variables:

### Required for all environments (Production, Preview, Development):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public, safe for client)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (SECRET - has full database access, used for admin operations)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key (SECRET)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (SECRET)

### How to set in Vercel:
1. Go to https://vercel.com/[your-team]/[project-name]/settings/environment-variables
2. Add each variable with appropriate scope (Production/Preview/Development)
3. For secrets (SERVICE_ROLE_KEY, STRIPE_SECRET_KEY), mark them as "Encrypted"
4. Redeploy after adding variables

## Local Build Testing
To test the build locally with your `.env.local`:

```powershell
npm run build
```

If successful, you'll see:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

## Why This Works
- **Static pages** (e.g., `/`, `/shop`) → rendered at build time, env vars not needed
- **Dynamic admin pages** → rendered on-demand, env vars injected at request time
- Middleware (`proxy.ts`) still protects routes and checks auth

## Additional Notes
- The `force-dynamic` export is the recommended Next.js approach for pages that need runtime data or auth checks
- Alternative: use `export const revalidate = 0` if you want ISR with no caching
- Admin pages now have a small performance trade-off (rendered per request) but gain security and flexibility
