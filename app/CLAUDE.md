# Frontend Patterns — app/ and components/

> This file is loaded automatically when working in the `app/` or `components/` directories.
> See root `CLAUDE.md` for project-wide rules.

## Component Conventions

- **Server components** are the default in `app/`. Add `'use client'` only when you need hooks, event handlers, or context consumers.
- **File naming**: kebab-case (`cart-item.tsx`, `order-summary.tsx`)
- **Component naming**: PascalCase (`CartItem`, `OrderSummary`)
- Feature components group by domain: `components/cart/`, `components/checkout/`, `components/admin/`, `components/auth/`
- Shared layout pieces (Header, Footer, ProductCard) live directly in `components/`

## shadcn/ui Components

- Base components live in `components/ui/`. Do not edit these files by hand.
- Add new ones via CLI: `npx shadcn@latest add <component>`
- Wrap or extend them in feature-specific components rather than modifying the originals.

## Styling

- Tailwind CSS v4 — no `tailwind.config.js`. All customisation is in `app/globals.css`.
- Custom theme tokens (defined as CSS vars in `globals.css`):
  - `--color-gold`, `--color-champagne`, `--color-cream`, `--color-rose-gold`
- Font vars: `--font-inter` (body), `--font-playfair` (headings / luxury accents)
- Avoid inline styles. Use Tailwind classes or the CSS var tokens.

## Forms

- Use React Hook Form + Zod for all forms.
- Bind with `@hookform/resolvers/zod`.
- Keep Zod schemas co-located with the form component or in the corresponding `/lib/actions/` file.

## State & Context

- Use `useCart()` from `contexts/cart-context.tsx` for any cart interaction.
- Use `formatPrice()` / `convertFromGbp()` from `useCurrency()` for any price display — never format prices manually.
- Do not create new global state outside of `/contexts/`. Add to an existing provider or create a new one there.

## Pages (App Router)

- `app/page.tsx` — homepage
- `app/shop/` — product listing + filters
- `app/checkout/` — checkout flow
- `app/account/` — user account
- `app/admin/` — admin dashboard (role-protected)
- `app/api/` — only for webhooks, payment sessions, and external integrations

## Dynamic Product Attributes

- Textures, grades, and origins come from the database — they are admin-configurable strings.
- Never hardcode these in `switch` statements, `if/else` chains, or UI label mappings.
- Render them as-is from the data.
