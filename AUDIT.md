# DeHairVault — Architecture Audit Snapshot

> **This is a point-in-time snapshot from 2026-04-16.**
> Do NOT regenerate this file automatically on every task. Update it manually when major architectural changes are made (e.g. new database tables, new payment integrations, directory restructures). Use it as historical context when investigating how things were set up, not as a live description of the current state.

---

## 1. Tech Stack

| Layer | Details |
|---|---|
| Framework | Next.js 16.0.10, React 19.2.0, TypeScript 5 |
| Database | Supabase (PostgreSQL), raw supabase-js, no ORM |
| Auth | Supabase Auth (email/password), token-refresh middleware at `/proxy.ts` |
| State | React Context API — `CartProvider`, `CurrencyProvider`. No Redux/Zustand. |
| Styling | Tailwind CSS v4.1.9 (PostCSS) + shadcn/ui (New York/neutral) + Radix UI |
| Forms | React Hook Form v7 + Zod v3.25 |
| Payments | Stripe v20 (USD/GBP/EUR) + Paystack v2.22 (NGN) |
| Images | Cloudinary (remote only, via `/app/api/admin/upload/`) |
| Email | Resend v6 |
| Charts | Recharts v2.15 |
| Rate Limiting | Upstash Redis — 5 login attempts/min/IP |
| Testing | Vitest v4.1 + jsdom + @testing-library/react v16 |
| Deployment | Vercel + Vercel Analytics |

---

## 2. Project Structure

```
DeHairVault/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout — wraps all providers
│   ├── page.tsx                # Homepage
│   ├── api/
│   │   ├── admin/              # Admin-only REST routes (products, orders, upload)
│   │   ├── checkout/           # Stripe + Paystack session creation + verification
│   │   ├── webhooks/           # Stripe + Paystack webhook handlers
│   │   └── exchange-rates/     # Currency rate endpoint
│   ├── admin/                  # Admin dashboard pages
│   ├── shop/                   # Product listing + filtering
│   ├── checkout/               # Checkout flow
│   ├── account/                # User account pages
│   ├── auth/ (login, signup)
│   ├── about, contact, faqs, policies/
│   └── globals.css             # Tailwind v4 config + CSS vars + theme
│
├── components/
│   ├── ui/                     # shadcn/ui base components (auto-generated via CLI)
│   ├── admin/                  # Admin-specific UI
│   ├── auth/                   # Login/signup forms
│   ├── cart/                   # Cart sheet, cart items
│   ├── checkout/               # Checkout form + payment UI
│   └── *.tsx                   # Shared: Header, Footer, ProductCard, etc.
│
├── contexts/
│   ├── cart-context.tsx        # Cart state, optimistic updates, useCart() hook
│   └── currency-context.tsx    # Multi-currency, geo-detection, cookie persistence
│
├── hooks/
│   └── useProductForm.ts
│
├── lib/
│   ├── actions/                # Server Actions ('use server')
│   │   ├── auth.ts
│   │   ├── cart.ts
│   │   ├── products.ts
│   │   └── checkout.ts
│   ├── auth/session.ts         # getSessionUser() — user + role resolution
│   ├── supabase/               # Three Supabase client tiers
│   │   ├── client.ts           # createBrowserClient() — anon, RLS enforced
│   │   ├── server.ts           # createServerClient() — session cookie, RLS enforced
│   │   └── proxy.ts            # createServiceClient() — bypasses RLS (admin only)
│   ├── services/shipping.ts
│   ├── constants/enums.ts      # Roles, statuses, enums
│   └── utils/                  # Helpers (rate-limit.ts, etc.)
│
├── types/
│   ├── database.types.ts       # Auto-generated Supabase schema types (source of truth)
│   └── admin.ts                # Admin-specific types
│
├── supabase/
│   ├── migrations/             # 7 SQL migration files (001–007)
│   ├── functions/              # Supabase Edge Functions
│   ├── seed.sql                # NGN seed data
│   └── seed_gbp.sql            # GBP seed data
│
├── public/                     # Static assets
├── proxy.ts                    # Auth middleware (token refresh)
├── next.config.mjs             # Cloudinary remote patterns, ignoreBuildErrors: true
├── tsconfig.json               # Path alias: @/* → project root
├── vitest.config.ts
├── vitest.setup.ts
├── components.json             # shadcn/ui config
└── postcss.config.mjs          # Tailwind v4 PostCSS plugin
```

---

## 3. Database

**Engine**: Supabase PostgreSQL  
**Query layer**: `supabase-js` (no ORM)  
**Base currency**: GBP — all product prices stored in GBP, converted at runtime  

### Tables (from `types/database.types.ts`)
`users`, `products`, `product_variants`, `carts`, `cart_items`, `orders`, `order_items`, `exchange_rates`, `coupons`, `wishlists`, `product_reviews`, `admin_activity_logs`

### Migrations (`/supabase/migrations/`)
| File | Content |
|---|---|
| `001_initial_schema.sql` | Core tables: users, products, orders, carts |
| `002_admin_policies.sql` | RLS policies for admin operations |
| `002_currency_gbp_migration.sql` | GBP as base currency |
| `003_customer_order_policies.sql` | Customer-level RLS |
| `004_storage_bucket.sql` | Cloud storage setup |
| `005_hair_textures_and_nullable_grade.sql` | Dynamic attributes |
| `006_add_product_features.sql` | Product feature list column |
| `007_texture_enum_to_text.sql` | Texture enum → text (dynamic strings) |

### Key Design Decisions
- Product attributes (textures, grades, origins) are **dynamic text strings**, not enums — admin can add new values without code changes
- Hair grades: Raw Baby, Single Donor, VIP Virgin, Virgin Remy, Raw Hair (Grade A–E)
- Order flow: created → paid (webhook) → shipped → delivered
- RLS enforced at DB level; service role client used selectively for trusted admin ops

---

## 4. State Management

**Pattern**: React Context API + custom hooks only

| Provider | File | Responsibility |
|---|---|---|
| `CartProvider` | `/contexts/cart-context.tsx` | Cart items, drawer open/close, optimistic quantity updates |
| `CurrencyProvider` | `/contexts/currency-context.tsx` | Selected currency, exchange rates, `formatPrice()`, `convertFromGbp()` |
| `ThemeProvider` | next-themes | Light/dark mode |

- `CurrencyProvider` detects user locale via `ipapi.co`, persists selection in cookie `dehair_currency`
- Cart uses optimistic updates: UI updates immediately, server state reconciled after

---

## 5. Authentication

- Supabase Auth (email/password)
- `getSessionUser()` in `/lib/auth/session.ts` → returns `{ user, profile: { id, role, full_name, email } }`
- Middleware at `/proxy.ts` refreshes tokens on every request
- Rate limiting on login: Upstash Redis, 5 req/min per IP (`/lib/utils/rate-limit.ts`)
- **Roles**: `CUSTOMER`, `ADMIN`, `SUPER_ADMIN` (in `/lib/constants/enums.ts`)

---

## 6. Payment Architecture

### Stripe (USD/GBP/EUR)
- Session creation: `POST /api/checkout/stripe`
- Verification: `POST /api/checkout/stripe/verify`
- Webhook: `POST /api/webhooks/stripe`

### Paystack (NGN)
- Session creation: `POST /api/checkout/paystack`
- Verification: `POST /api/checkout/paystack/verify`
- Webhook: `POST /api/webhooks/paystack`

### Rule
Never mark an order fulfilled from the client-side redirect. Always wait for the webhook.

---

## 7. Styling System

- Tailwind CSS v4 — no `tailwind.config.js`. Config lives in `app/globals.css` + `postcss.config.mjs`.
- shadcn/ui (New York style, neutral base) — components in `/components/ui/`
- Luxury theme using oklch color space. Custom tokens: `gold`, `champagne`, `cream`, `rose-gold`
- Fonts: Inter (body) via `--font-inter`, Playfair Display (headings) via `--font-playfair`

---

## 8. Testing

- Vitest v4.1 + jsdom, `@testing-library/react` v16
- Config: `/vitest.config.ts` (environment: jsdom, globals: true)
- Setup: `/vitest.setup.ts` (imports `@testing-library/jest-dom/vitest`)
- Run: `npx vitest`

---

## 9. Build Notes

- `ignoreBuildErrors: true` in `next.config.mjs` — TypeScript errors do not block `next build`
- All remote images served from `res.cloudinary.com`; local images are unoptimized
- No `tailwind.config.js` — Tailwind v4 is fully PostCSS-driven
- Path alias `@/*` → project root (set in `tsconfig.json`)
