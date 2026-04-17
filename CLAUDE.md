# DeHairVault — Claude Code Context

## Project Overview
Luxury hair e-commerce platform (live at dehairvault.com). Sells hair extensions and wigs with dynamic product attributes (grades, textures, origins). Single Next.js app — not a monorepo.

Multi-currency storefront, customer cart/checkout, admin panel for product/order management.

## Tech Stack
- **Framework**: Next.js 16.0.10 (App Router), React 19, TypeScript 5
- **Database**: Supabase (PostgreSQL) — raw `supabase-js`, no ORM
- **Auth**: Supabase Auth (email/password) + token-refresh middleware at `/proxy.ts`
- **State**: React Context API only — `CartProvider`, `CurrencyProvider`. No Redux or Zustand.
- **Styling**: Tailwind CSS v4 (PostCSS plugin) + shadcn/ui (New York style) + Radix UI primitives
- **Animations**: Framer Motion (Tier 2+ transitions) + Tailwind CSS (micro-interactions only)
- **Forms**: React Hook Form + Zod
- **Payments**: Stripe (USD/GBP/EUR) + Paystack (NGN)
- **Images**: Cloudinary (remote images only)
- **Email**: Resend
- **Testing**: Vitest + jsdom + @testing-library/react
- **Deploy**: Vercel + Vercel Analytics

## Known Issues (verify before assuming they're still open)
1. ~~CRITICAL: Stripe checkout~~ — **FIXED 2026-04-17**: `{CHECKOUT_SESSION_ID}` added to `success_url`; webhook endpoint was already correct. Requires `STRIPE_WEBHOOK_SECRET` set in Vercel env + webhook registered in Stripe dashboard (see webhook setup instructions below).
2. ~~HIGH: Cart delete button (ghost delete)~~ — **FIXED 2026-04-17**: `008_cart_items_delete_policy.sql` adds the missing RLS DELETE policy. Apply this migration to Supabase before deploying.
3. HIGH: Admin product upload needs direct image upload (Cloudinary), not URL input — see `/app/api/admin/upload/`
4. MEDIUM: Admin product listing needs Netflix-style video upload + HLS streaming (see `skills.md` SOP-18 for VideoPlayer implementation guide)

## Files to Read First for Any Task
- `/lib/supabase/` — three Supabase client tiers (browser, server, service role)
- `/lib/actions/` — all Server Actions (auth, cart, products, checkout)
- `/lib/auth/session.ts` — `getSessionUser()`, how roles are resolved
- `/contexts/cart-context.tsx` — cart state + optimistic update pattern
- `/contexts/currency-context.tsx` — multi-currency, price formatting
- `/app/api/checkout/` — Stripe + Paystack session creation
- `/app/api/webhooks/` — Stripe + Paystack webhook handlers
- `/components/cart/` — cart drawer and item components
- `/app/admin/` — admin panel pages
- `/types/database.types.ts` — auto-generated schema types (source of truth for DB shape)
- `/types/admin.ts` — admin-specific types

> **AUDIT.md** contains a full architecture snapshot from 2026-04-16. Read it only when you need historical context on a specific subsystem. Do not re-generate it.

## Architecture Rules

### Database
- Never modify the DB schema without asking the user first.
- All prices are stored in **GBP**. Use `convertFromGbp()` from `CurrencyProvider` at render time — never store converted prices.
- Three Supabase client tiers — use the right one:
  - `createBrowserClient()` → client components (anon key, RLS enforced)
  - `createServerClient()` → server components + Server Actions (session cookie, RLS enforced)
  - `createServiceClient()` → admin-only operations that must bypass RLS
- Schema types are auto-generated. Do not hand-edit `types/database.types.ts`.

### Pricing Rule (non-negotiable)
- Exchange rates are **always** fetched live from the `exchange_rates` table. Hardcoded rates are never acceptable — not even as a fallback.
- The formula for every price display: `displayPrice = baseGbpPrice × rate_from_gbp(displayCurrency)`.
- Never use `cart.exchangeRate` as a proxy for the user's display currency rate — they are different values. `cart.exchangeRate` holds the NGN rate; use `getRate()` from `CurrencyProvider` for the user's selected currency.
- If an exchange rate is missing from the database, surface an error — do not substitute a hardcoded number like `1950`.
- See `skills.md` SOP-12 for the canonical implementation.

### Data Fetching
- All internal data access goes through **Server Actions** in `/lib/actions/` — not raw fetch calls.
- API routes in `/app/api/` are only for: payment sessions, webhooks, and external integrations.
- Mark server action files with `'use server'` at the top.

### Payments
- Stripe handles USD/GBP/EUR. Paystack handles NGN. Both live in `/app/api/checkout/` and `/app/api/webhooks/`.
- Do not scatter payment logic. All Stripe logic belongs in `/app/api/checkout/stripe/` and `/app/api/webhooks/stripe/`.
- Never fulfill an order without webhook confirmation — do not trust client-side redirect callbacks alone.

### Images
- Product images use **Cloudinary**, not Supabase Storage.
- Uploads go through `/app/api/admin/upload/`.
- Never store base64 image data in the database.

### State
- Add new global state via React Context in `/contexts/` — not local component state, not Zustand.
- Cart state uses optimistic updates: update context immediately, reconcile with Supabase after.

### Auth & Roles
- Get current user + role via `getSessionUser()` from `/lib/auth/session.ts`.
- Roles: `CUSTOMER`, `ADMIN`, `SUPER_ADMIN` (defined in `/lib/constants/enums.ts`).
- Admin-only operations must use the service role client.

### UI Components
- Use existing components from `/components/ui/` (shadcn/ui) before creating new ones.
- Add new shadcn components via CLI: `npx shadcn@latest add <component>` — do not write them manually.
- Custom theme tokens (gold, champagne, cream, rose-gold) are CSS vars in `/app/globals.css`.
- Tailwind v4 has no `tailwind.config.js` — configuration is in `globals.css` and `postcss.config.mjs`.
- **Never use native browser dialogs**: `alert()`, `confirm()`, and `prompt()` are prohibited. Use Sonner toasts (`toast.success` / `toast.error`) for async feedback and shadcn `<AlertDialog>` for confirmations.
- **Never render bare HTML form elements**: all `<button>`, `<input>`, `<select>`, and `<textarea>` must use the corresponding shadcn/ui component from `/components/ui/`. This ensures every interactive element inherits the project theme automatically.
- **Animations**: use Framer Motion for entrance/exit and layout transitions; Tailwind CSS transitions for simple hover/focus micro-interactions only. See `skills.md` SOP-09 for the full animation tier guide.

### Product Attributes
- Textures, grades, and origins are **dynamic strings** managed by the admin — never hardcode them in UI logic or switch/if chains.

## Code Style
- TypeScript throughout. Avoid `any` types even though `ignoreBuildErrors: true` is set in `next.config.mjs`.
- `async/await` only — no raw `.then()` chains.
- Component names: PascalCase. File names: kebab-case (`cart-item.tsx`).
- Server components are the default. Add `'use client'` only when the component needs interactivity, hooks, or context.
- Do not refactor working code while fixing a bug.
- Do not install new npm packages without asking first.
- Test the actual behaviour before marking something fixed — do not assume.

## Environment Variables
Required in `.env` (see `.env.example` for full list):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
```

## Performance & Scalability

### Edge-First
- Prefer Next.js Edge Runtime for middleware and geolocation. Currency detection must happen at the edge (using `request.geo` in `/proxy.ts`) — never via a client-side `ipapi.co` call on the critical render path.
- Vercel's Edge Network caches the `/api/exchange-rates` response globally. All exchange rate access goes through this route — no component queries the database directly for rates.

### Image & Video Optimization
- All product images must be served via Cloudinary with `f_auto,q_auto` URL transforms applied. Never serve a raw Cloudinary upload URL without transforms.
- All product video must be served via Cloudinary's HLS pipeline (`.m3u8`), not as raw `.mp4` files. This enables adaptive bitrate streaming for users on variable connections (Nigeria 3G → UK fibre).
- Always specify the `sizes` prop on every `<Image fill>` component. See `skills.md` SOP-15 for the sizes reference per context.

### React Server Components (RSC)
- Minimize client bundle size. Page-level components (`app/**/page.tsx`) must remain Server Components; only the interactive leaves should be `'use client'`.
- Heavy data-fetching components that don't need event handlers must never be given `'use client'`. Every unnecessary `'use client'` increases Time to Interactive for users in Nigeria.

### Database Performance
- All high-frequency filter columns (`currency_code`, `product_id`, `user_id`, `cart_id`, `slug`) must have database indexes. See `skills.md` SOP-18 for the full index migration.
- Exchange rates use stale-while-revalidate caching (`s-maxage=300, stale-while-revalidate=600`) on the API route — no direct per-request DB queries for rates.
- Apply `009_performance_indexes.sql` migration before any significant traffic increase.

### Video (Netflix-Style Player)
- Use HLS (`hls.js`) for all video delivery. Never embed a direct `.mp4` URL in a product page.
- The `getWebCompatibleVideoUrl()` utility must output `.m3u8` Cloudinary URLs, not `.mp4`.
- See `skills.md` SOP-18 for the canonical `VideoPlayer` component implementation.

## Commands
```bash
npm run dev          # start dev server
npm run build        # production build
npm run lint         # ESLint
npx vitest           # run tests
npx tsc --noEmit     # type-check without building (run before every PR)
```
