# Backend / Server Patterns — lib/

> This file is loaded automatically when working in the `lib/` directory.
> See root `CLAUDE.md` for project-wide rules.

## Server Actions (`lib/actions/`)

- All internal data access must go through Server Actions here — not raw fetch calls from components.
- Every file starts with `'use server'`.
- Validate inputs with Zod at the top of each action before touching the database.
- Return a typed result object — do not throw unhandled errors to the client.

## Supabase Clients (`lib/supabase/`)

Three clients exist for different trust levels. Use the right one:

| File | Client | Use Case |
|---|---|---|
| `client.ts` | `createBrowserClient()` | Client components — anon key, RLS enforced |
| `server.ts` | `createServerClient()` | Server components + Server Actions — session cookie, RLS enforced |
| `proxy.ts` | `createServiceClient()` | Admin-only operations that must bypass RLS |

Never use the service client in customer-facing code paths.

## Auth (`lib/auth/session.ts`)

- `getSessionUser()` returns `{ user, profile: { id, role, full_name, email } }` or `null`.
- Always check role before performing admin operations. Roles: `CUSTOMER`, `ADMIN`, `SUPER_ADMIN`.
- Role constants are in `lib/constants/enums.ts`.

## Payment Logic

- Stripe: `/app/api/checkout/stripe/` (session) + `/app/api/webhooks/stripe/` (webhook)
- Paystack: `/app/api/checkout/paystack/` (session) + `/app/api/webhooks/paystack/` (webhook)
- Payment logic is **not** centralised in a single `lib/stripe.ts` file — it lives in the API routes above.
- Do not move or consolidate payment logic without discussing first.
- Never fulfill an order from a client callback. Orders are confirmed only via webhook.

## Currency (`lib/` + `contexts/currency-context.tsx`)

- All prices in the DB are in GBP (base currency).
- Exchange rates are stored in the `exchange_rates` table and fetched at `/api/exchange-rates`.
- Do not hardcode exchange rates or currency symbols in server logic.

## Types

- DB types are auto-generated in `types/database.types.ts` — do not hand-edit.
- Admin-specific types live in `types/admin.ts`.
- Add new shared types to `types/` as separate files or extend `admin.ts`.

## Rate Limiting

- Login endpoint is rate-limited via Upstash Redis (`lib/utils/rate-limit.ts`).
- 5 attempts per minute per IP.
- Apply the same pattern to any new sensitive endpoints.
