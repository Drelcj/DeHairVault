# DeHairVault — Engineering SOPs

> **How to read this file**
> Every SOP follows a strict three-part format:
> - **Pattern** — the rule; what we always do
> - **Problem** — what breaks when the rule is ignored (with a real example from this codebase)
> - **Solution** — the canonical implementation to copy, not reinvent
>
> This is a living document. When a new pattern is proven in production, add it here.
> Last updated: 2026-04-17

---

## Section 1 — State & Data Flow

---

### SOP-01: Global vs Local State Decision Rule

**Pattern**
`CartProvider` and `CurrencyProvider` exist for state that must survive page navigations or be consumed by genuinely unrelated parts of the component tree. Everything else is `useState` inside the component that owns it.

**Problem**
Connecting cart item counts, loading spinners, or hover states to a Context provider causes the entire subtree of consumers to re-render whenever the value changes. A `ProductGrid` with 24 cards, each subscribed to `useCart()`, re-renders all 24 cards every time a single cart quantity changes.

**Solution**
Apply this decision tree before reaching for Context:

```
Does the state need to persist across full page navigations?
  YES → Context (CartProvider, CurrencyProvider)
  NO  ↓
Is this state consumed by 3+ components with no common parent?
  YES → Context
  NO  ↓
Is this UI-only state (hover, open/closed, loading, error message)?
  YES → useState in the component that owns the UI
  NO  ↓
Is this state needed only by a component and its direct children?
  YES → useState + prop drilling (max 2 levels before reconsidering)
```

**Never put in Context:** animation state, form field values, modal open/closed, loading flags for a single action.

---

### SOP-02: Server Action Return Contract

**Pattern**
Every Server Action in `/lib/actions/` must return a typed `ActionResult<T>`. No action may return `undefined`, throw to the client, or return `{ success: true }` without specifying what data was created.

**Problem**
The current codebase has 42 occurrences of `as any` concentrated in `lib/actions/` because Supabase join queries produce untyped objects. This means a database error can be silently swallowed and returned as `{ success: true }`.

**Solution**

Define once in `/types/actions.ts`:

```typescript
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

Apply consistently:

```typescript
// ✅ Correct
export async function createOrder(
  formData: CheckoutFormData
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  // ...
  if (orderError) {
    return { success: false, error: orderError.message }
  }
  return { success: true, data: { orderId: order.id, orderNumber: order.order_number } }
}

// ✅ Caller pattern — exhaustive handling
const result = await createOrder(formData)
if (!result.success) {
  setError(result.error)   // error is guaranteed to be a string
  return
}
const { orderId } = result.data  // data is guaranteed to exist
```

```typescript
// ❌ Prohibited patterns
return { success: true }                        // no data shape
return { success: false, error: error as any }  // any escapes typing
throw new Error('something went wrong')         // unhandled in client
```

---

### SOP-03: Optimistic Update Pattern

**Pattern**
For any user-initiated mutation that must feel instant (cart quantity, remove item, wishlist toggle): snapshot → optimistic update → server call → revert on failure. Never wait for the server before updating the UI.

**Problem**
Without the snapshot-and-revert pattern, a failed server call leaves the UI in a permanently incorrect state. The previous cart delete button removed items visually but did not verify the server response — so items would silently reappear on the next page load (the "ghost delete" bug).

**Solution**
The canonical implementation lives in `contexts/cart-context.tsx`. Copy this pattern exactly:

```typescript
// 1. Consumer (cart-item.tsx) — initiates the optimistic flow
const handleRemove = async () => {
  if (isUpdating) return

  const previousCart = cart            // 1. Snapshot current state
  removeItemOptimistic(item.id)        // 2. Update UI immediately
  setIsUpdating(true)

  try {
    const result = await removeFromCart(item.id)
    if (!result.success) {
      revertCart(previousCart)         // 3. Revert on failure
      toast.error(result.error ?? 'Failed to remove item')
    }
    // On success: optimistic state is already correct, no refresh needed
  } catch {
    revertCart(previousCart)           // 3. Revert on exception
    toast.error('Failed to remove item')
  } finally {
    setIsUpdating(false)
  }
}

// 2. Context (cart-context.tsx) — provides the primitives
const removeItemOptimistic = useCallback((itemId: string) => {
  setCart((prev) => {
    if (!prev) return null
    const items = prev.items.filter((i) => i.id !== itemId)
    return {
      ...prev,
      items,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      subtotalGbp: items.reduce((s, i) => s + i.product.base_price_gbp * i.quantity, 0),
    }
  })
}, [])

const revertCart = useCallback((previousCart: CartWithItems | null) => {
  setCart(previousCart)
}, [])
```

---

### SOP-04: Supabase Client Tier Selection

**Pattern**
There are exactly three Supabase clients. Using the wrong one either leaks data (service client in a customer path) or produces silent no-ops (anon client for authenticated writes).

**Problem**
`removeFromCart` in `lib/actions/cart.ts` uses `createClient()` (session-based) but performs no ownership check. Supabase silently returns success on a DELETE that RLS blocks, resulting in ghost deletes. If `createServiceClient()` had been used instead, the RLS bypass would have made it work — but would have allowed any user to delete any cart item by ID.

**Solution**

```
Which client to use:

createBrowserClient()   ← inside 'use client' components
  - Uses the public anon key
  - RLS enforced; user can only touch their own data
  - Import from: @/lib/supabase/client.ts

createServerClient()    ← inside Server Actions and server components
  - Uses the session cookie for the current user
  - RLS enforced; correct for all user-facing data operations
  - Import from: @/lib/supabase/server.ts
  - This is the default. Use it unless you have a reason not to.

createServiceClient()   ← inside webhook handlers and admin-only API routes
  - Uses the service role key — bypasses RLS entirely
  - NEVER use in a path that a customer can trigger
  - Import from: @/lib/supabase/proxy.ts
  - Required for: updateOrderStatus(), clearCartAfterOrder(), admin product ops
```

**Rule:** If a Server Action can be triggered by a `CUSTOMER` role, it must use `createServerClient()` and let RLS do the ownership enforcement, not `createServiceClient()`.

---

## Section 2 — Defensive UI Patterns

---

### SOP-05: Image Fallback Hierarchy

**Pattern**
Every product image must degrade gracefully through three levels: `thumbnail_url` → first item in `images[]` → project placeholder. An empty container is never acceptable.

**Problem**
`ImageCarousel` and `OriginFilterCards` both use `e.currentTarget.style.display = 'none'` in their `onError` handlers. This hides the broken `<img>` tag but leaves the parent container with empty space and no visual feedback — particularly visible in the cart drawer where 80×80px boxes appear blank.

**Solution**

Always use `getProductImageSources()` from `lib/utils.ts` to derive the source list — it already implements the thumbnail-first priority. Then in the Image component:

```tsx
// ✅ Standard pattern
const sources = getProductImageSources(product)
const [imgIndex, setImgIndex] = useState(0)

<Image
  src={sources[imgIndex] ?? '/images/placeholder-product.jpg'}
  alt={product.name}
  fill
  sizes="80px"
  className="object-cover"
  onError={() => {
    if (imgIndex + 1 < sources.length) {
      setImgIndex((i) => i + 1)  // Try next source in the list
    }
    // If all sources exhausted, the src is already the placeholder
  }}
/>
```

```tsx
// ❌ Prohibited
onError={(e) => { e.currentTarget.style.display = 'none' }}   // Leaves empty space
onError={(e) => { e.currentTarget.src = '' }}                  // Triggers infinite error loop
```

The placeholder at `/public/images/placeholder-product.jpg` must always exist. It is a fallback of last resort and must never 404.

---

### SOP-06: Error & Feedback Display Standards

**Pattern**
- Form validation errors → inline, directly under the offending field
- Async operation feedback → Sonner toast (`toast.success` / `toast.error`)
- Page-level blocking errors → inline error card within the affected section
- **Never** use `alert()`, `confirm()`, `prompt()`, or any native browser dialog

**Problem**
Native browser dialogs (`alert`, `confirm`) are unstyled, block the thread, cannot be themed, and break on mobile WebViews. The codebase has no standard for where errors appear — checkout shows them in a red div at the bottom of the form, cart uses toasts, and admin pages have mixed patterns.

**Solution**

```tsx
// 1. Field-level validation error (React Hook Form)
{errors.customerEmail && (
  <p className="mt-1 text-sm text-destructive">{errors.customerEmail.message}</p>
)}

// 2. Server action feedback — async mutation
toast.success('Item added to your bag')
toast.error(result.error ?? 'Something went wrong')

// 3. Section-level blocking error
{error && (
  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">
    <p className="font-medium text-sm">{error}</p>
  </div>
)}

// 4. Confirmation dialogs — MUST use shadcn AlertDialog, never window.confirm
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'

// ❌ Absolutely prohibited
alert('Are you sure?')
if (confirm('Delete this item?')) { ... }
window.prompt('Enter coupon code')
```

**UI Component Rule:** All buttons, inputs, selects, and checkboxes must use components from `/components/ui/`. Never render a bare `<button>`, `<input>`, or `<select>` element directly in a feature component.

---

### SOP-07: Page-Level Error Boundaries

**Pattern**
Every major page section that fetches data or renders dynamic content must be wrapped in a React Error Boundary. An unhandled runtime error in `CartSheet` must not crash the entire storefront layout.

**Problem**
No Error Boundaries currently exist in this codebase. A JavaScript runtime error in any Context consumer (e.g., `useCurrency()` throws during exchange rate parse) will crash every component below `<CurrencyProvider>` in the tree — which is the entire application.

**Solution**

Create `/components/error-boundary.tsx`:

```tsx
'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-muted-foreground text-sm">Something went wrong loading this section.</p>
          <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
```

Wrap critical sections:

```tsx
// app/layout.tsx
<ErrorBoundary>
  <CartSheet />
</ErrorBoundary>

// app/checkout/page.tsx
<ErrorBoundary>
  <CheckoutForm cart={cart} />
</ErrorBoundary>
```

---

## Section 3 — Component Architecture & Design System

---

### SOP-08: Server vs Client Component Boundary Rule

**Pattern**
Every component is a React Server Component (RSC) by default. `'use client'` is added only at the lowest point in the tree where client-side behaviour is actually required.

**Problem**
Placing `'use client'` on a parent component forces every child in its subtree to become a client bundle, even children that do no client-side work. A `CheckoutPage` marked `'use client'` pulls the entire form, address fields, payment selector, and order summary into the JavaScript bundle — adding load time for users on slow Nigerian connections.

**Solution**

```
Add 'use client' ONLY when the component:
  ✓ Uses useState, useEffect, useRef, useReducer, useCallback
  ✓ Has onClick, onChange, onSubmit or other event handlers
  ✓ Calls useCart(), useCurrency() or any Context hook
  ✓ Accesses browser APIs: window, localStorage, navigator, document
  ✓ Uses Framer Motion (motion.* components require client rendering)

Do NOT add 'use client' because:
  ✗ "It's easier" — find the leaf component that actually needs it
  ✗ A child needs it — mark the child, not the parent
  ✗ You're not sure — omit it; RSC is the safe default
```

**Pattern for splitting:**

```tsx
// ✅ app/shop/page.tsx — Server Component fetches data
export default async function ShopPage() {
  const products = await getProducts()
  return <ProductGrid products={products} />
  //      ↑ Server component, no client code
}

// ✅ components/product-card.tsx — 'use client' only on the interactive leaf
'use client'
export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  // ...
}
```

---

### SOP-09: Luxury Animation Standards

**Pattern**
Three animation tiers. The tier used depends on complexity. Framer Motion is the standard for all Tier 2 and above; Tailwind CSS handles Tier 1 only.

**Problem**
The Netflix-style UI goal — products that expand, video players that slide in, carousels that feel weighted — cannot be achieved with Tailwind CSS transitions alone. Tailwind handles hover states and simple fades well, but cannot orchestrate layout animations, shared element transitions, or velocity-based spring physics. The current `ImageCarousel` uses `Math.random()` inside a render path, which causes React hydration mismatches.

**Solution**

**Tier 1 — Micro-interactions (Tailwind CSS only)**
Single-property hover and focus states with no orchestration needed.

```tsx
// Scale on hover, opacity on state change — use Tailwind
className="transition-transform duration-300 ease-out group-hover:scale-110"
className="transition-opacity duration-200 opacity-0 group-hover:opacity-100"
```

**Tier 2 — Entrance & Exit Animations (Framer Motion)**
Components that animate in when mounted, out when unmounted, or transition between states.

```tsx
import { motion, AnimatePresence } from 'framer-motion'

// Standard luxury entrance — used for product cards, modals, drawers
const luxuryEntrance = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -12 },
  transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }, // cubic-bezier "ease"
}

<motion.div {...luxuryEntrance}>
  <ProductCard product={product} />
</motion.div>

// Staggered grid entrance — products entering on page load
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.07 } },
  }}
>
  {products.map((p) => (
    <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
      <ProductCard product={p} />
    </motion.div>
  ))}
</motion.div>
```

**Tier 3 — Netflix-Style Layout Animations (Framer Motion layoutId)**
Shared element transitions — a product card expands into a full-screen viewer, a thumbnail animates into a video player. This is the target pattern for the Netflix-style video feature.

```tsx
import { motion, AnimatePresence } from 'framer-motion'

// Product card (collapsed state)
<motion.div layoutId={`product-${product.id}`} className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer">
  <Image src={thumbnail} ... />
</motion.div>

// Expanded product viewer (when selected)
<AnimatePresence>
  {selectedId === product.id && (
    <motion.div
      layoutId={`product-${product.id}`}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Full detail view — Framer Motion animates the layout transition */}
    </motion.div>
  )}
</AnimatePresence>
```

**Tier 4 — Page Transitions (Framer Motion + Next.js)**

```tsx
// app/template.tsx (not layout.tsx — template re-mounts on navigation)
'use client'
import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.main>
  )
}
```

**Prohibited:**
- CSS `@keyframes` for anything that Framer Motion handles better
- Tailwind `animate-*` for Tier 2+ animations (no orchestration, no exit animations)
- `Math.random()` in any component render path or synchronous effect — always inside `useEffect` or `useMemo`

---

### SOP-10: Typography Hierarchy

**Pattern**
Two font roles. `Playfair Display` (serif) for all headings and luxury accent text. `Inter` (sans) for all body copy, labels, and UI text.

**Problem**
The current syntax `font-[family-name:var(--font-playfair)]` is verbose, easy to mistype, and invisible to search tools. There is no enforced hierarchy for which heading sizes use which font.

**Solution**

Add to `app/globals.css`:

```css
/* Luxury typography utility — use instead of the verbose var() syntax */
.font-display {
  font-family: var(--font-playfair);
}
```

Hierarchy:

```
h1, hero headlines              → font-display text-4xl lg:text-6xl font-medium
h2, section headings            → font-display text-2xl lg:text-3xl font-medium
h3, card titles, modal headers  → font-display text-xl font-medium
h4, sub-labels                  → font-sans text-base font-semibold tracking-wide uppercase text-xs
Body, descriptions              → font-sans text-base text-foreground
Captions, meta, badges          → font-sans text-sm text-muted-foreground
```

```tsx
// ✅ Standard heading
<h1 className="font-display text-5xl font-medium text-foreground">
  Premium Hair Extensions
</h1>

// ❌ Verbose — replace with .font-display
<h1 className="font-[family-name:var(--font-playfair)] text-5xl ...">
```

---

### SOP-11: Mobile-First Breakpoint Convention

**Pattern**
Base CSS styles target mobile (≤639px). Every responsive override uses breakpoint prefixes in ascending order: `sm:` → `lg:` → `xl:`. The `md:` prefix is used sparingly and only when a genuine tablet-specific layout exists.

**Problem**
Inconsistency found across the codebase: `OriginFilterCards` uses `sm:grid-cols-3 lg:grid-cols-6`, `ProductGrid` uses `md:grid-cols-2 lg:grid-cols-3`, and `CheckoutForm` uses `sm:grid-cols-2`. No canonical breakpoint map exists.

**Solution**

```
Canonical breakpoints for this project:
  Base  (0px+):    Single column, stacked layout, full-width elements
  sm:   (640px+):  2-column grids, side-by-side form fields, horizontal nav
  lg:   (1024px+): Multi-column grids, sidebar layouts, desktop navigation
  xl:   (1280px+): Wide container constraints, max-width caps

md: (768px+) — use only for genuine tablet-only adjustments.
              Do not use md: as a substitute for sm: or lg:.
```

```tsx
// ✅ Standard grid progression
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

// ✅ Standard form fields
<div className="grid gap-4 sm:grid-cols-2">

// ✅ Standard container
<div className="container mx-auto px-4 sm:px-6 lg:px-12">

// ❌ Skip-a-breakpoint patterns
<div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6">
```

---

## Section 4 — Type Safety

---

### SOP-12: Supabase Query Typing & Pricing Rule

**Pattern — Type Safety**
Supabase joined queries are typed using database-generated types. `as any` is permitted only at the single point where a joined query result is assigned, and never inside business logic.

**Problem**
42 occurrences of `as any` in `lib/actions/` exist because Supabase's TypeScript client does not automatically infer the shape of joined queries (`.select('*, product:products(*)')`). The current workaround casts the entire result to `any`, which silently swallows type errors throughout the rest of the function.

**Solution**

```typescript
import type { Tables } from '@/types/database.types'

// Define join types explicitly
type CartItemWithProduct = Tables<'cart_items'> & {
  product: Tables<'products'>
}

// One cast at the query boundary — nowhere else
const { data, error } = await supabase
  .from('cart_items')
  .select('*, product:products(*)')
  .eq('cart_id', cartId)

// ✅ Single cast, typed from here on
const items = (data ?? []) as CartItemWithProduct[]

// ✅ All downstream code is fully typed
const subtotal = items.reduce(
  (sum, item) => sum + item.product.base_price_gbp * item.quantity,
  0
)

// ❌ Prohibited
const items = data as any
const subtotal = items.reduce((sum: any, item: any) => sum + item.product.base_price_gbp, 0)
```

---

**Pattern — Pricing Rule (non-negotiable)**

All prices in the database are stored in GBP. Every price display or order calculation must fetch the current exchange rate from the `exchange_rates` table. **Hardcoded rates are never acceptable**, including in fallback chains.

**Problem**
`lib/actions/cart.ts` has `const DEFAULT_GBP_TO_NGN = 1950` used as a fallback when the database rate is unavailable. `lib/actions/checkout.ts` has `cart.exchangeRate || formData.exchangeRate || 1950`. Because `cart.exchangeRate` always holds the NGN rate, `formData.exchangeRate` (which contains the user's actual display currency rate) is silently ignored, causing incorrect `total_display_currency` values for non-NGN customers.

**Solution**

```typescript
// ✅ REQUIRED — fetch rate, never guess
async function getExchangeRate(currencyCode: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('rate_from_gbp')
    .eq('currency_code', currencyCode)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    // Surface the failure — do not substitute a hardcoded number
    throw new Error(`Exchange rate for ${currencyCode} is unavailable. Check the exchange_rates table.`)
  }

  return data.rate_from_gbp
}

// ✅ REQUIRED — use the user's display currency rate, not NGN rate
const displayRate = await getExchangeRate(formData.displayCurrency)
const totalDisplayCurrency = totalGbp * displayRate

// ❌ PROHIBITED in all files
const DEFAULT_GBP_TO_NGN = 1950          // Remove
return cart.exchangeRate || 1950          // Remove
const rate = rateData?.rate_from_gbp ?? 1950  // Remove
```

**The formula:**
```
displayPrice = baseGbpPrice × rate_from_gbp(displayCurrency)
```
Where `rate_from_gbp` means "how many units of this currency equal 1 GBP".

This applies at every site:
- Cart subtotals (`cart-context.tsx`, `cart.ts`)
- Order creation (`checkout.ts`)
- Stripe session amount (`api/checkout/stripe/route.ts`)
- Order success page (`success-page-content.tsx`)

---

### SOP-13: Props Interface Placement & Conventions

**Pattern**
`interface ComponentNameProps` is declared at the top of the component file, immediately after imports. It is exported only if another file needs to import it. `type` is used for unions and primitive aliases; `interface` is used for object shapes (props, API responses, context values) because interfaces are extendable.

**Problem**
The codebase mixes inline props (`({ product }: { product: Product })`), named `interface`, and `type` aliases with no consistency. Inline prop types cannot be referenced, documented, or extended by parent components.

**Solution**

```typescript
// ✅ Standard — interface at top of file
import type { Product } from '@/types/database.types'

interface ProductCardProps {
  product: Product
  /** Index in the grid — used to calculate staggered animation timing */
  index?: number
  onAddToCart?: (productId: string) => void
}

export function ProductCard({ product, index = 0, onAddToCart }: ProductCardProps) {
  // ...
}
```

```typescript
// ✅ Exported interface — only when shared across files
// types/checkout.ts
export interface CheckoutFormData {
  customerName: string
  // ...
}

// ✅ type for unions and aliases
type PaymentMethod = 'stripe' | 'paystack'
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED'
```

```typescript
// ❌ Prohibited
function CartItem({ item }: { item: CartItemWithProduct }) { ... }  // Inline — can't be referenced
type CartItemProps = { item: CartItemWithProduct }                   // Use interface for object shapes
```

---

### SOP-14: Build Error Visibility

**Pattern**
TypeScript errors must be visible during development. `ignoreBuildErrors: true` is a temporary escape hatch, not a permanent setting.

**Problem**
`next.config.mjs` has `ignoreBuildErrors: true`, which means all 42+ existing type errors are invisible during `npm run build`. Developers discover type issues at runtime in production.

**Solution — Immediate action**
Add a type-check step to the development workflow:

```bash
# Run this before every PR — it catches all type errors without blocking a build
npx tsc --noEmit
```

**Solution — Roadmap**
1. Run `npx tsc --noEmit` and fix reported errors file by file, starting with `lib/actions/`
2. Replace `as any` casts with proper join types (SOP-12)
3. Once the error count reaches 0, set `ignoreBuildErrors: false` in `next.config.mjs`
4. Add `npx tsc --noEmit` as a CI step

Do not set `ignoreBuildErrors: false` until step 3 is complete — doing so before fixing errors will break all production deployments.

---

## Section 5 — Asset Optimization

---

### SOP-15: `next/image` Usage Rules

**Pattern**
Every `<Image>` component using the `fill` prop must also specify a `sizes` prop. The `sizes` prop tells the browser which image resolution to download for a given viewport; without it, the browser defaults to 100vw and downloads the full original image for every thumbnail.

**Problem**
`ImageCarousel` renders product images with `fill` but no `sizes` prop. In the cart drawer, product thumbnails are 80×80px but the browser downloads a full-resolution Cloudinary image (~2000px wide) because no `sizes` constraint exists. On a 3G connection (common in Nigeria), this adds 2–4 seconds of unnecessary load.

**Solution**

```tsx
// Sizes reference for each container context in this project:

// Cart thumbnail (fixed 80px)
<Image fill sizes="80px" className="object-cover" />

// Product card in 2-col grid (mobile) → 4-col (desktop)
<Image fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" />

// PDP hero image (full-width mobile, half-width desktop)
<Image fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />

// Origin filter cards (2-col → 3-col → 6-col)
<Image fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" className="object-cover" />

// Admin product thumbnails in table rows (fixed 64px)
<Image fill sizes="64px" className="object-cover" />
```

```tsx
// ✅ Complete standard pattern
<div className="relative aspect-square overflow-hidden rounded-lg">
  <Image
    src={imageUrl}
    alt={altText}
    fill
    sizes="(max-width: 640px) 50vw, 25vw"
    className="object-cover transition-transform duration-300 group-hover:scale-105"
    onError={() => setImgIndex((i) => i + 1)}  // See SOP-05
  />
</div>

// ❌ Missing sizes — always add it
<Image src={url} alt={alt} fill className="object-cover" />
```

---

### SOP-16: Cloudinary Integration Standard

**Pattern**
All product media is served via Cloudinary. Every Cloudinary URL must include `f_auto` (automatic format — WebP for modern browsers, JPEG fallback) and `q_auto` (automatic quality — Cloudinary determines the optimal quality/size balance). Width transformation is added based on the display context.

**Problem**
`unoptimized: true` is set globally in `next.config.mjs`, which was required to prevent Next.js from trying to optimize remote Cloudinary URLs through its own image pipeline. However, this also disables Next.js optimization for local images in `/public/origins/`, which are served without any compression. Cloudinary's own transforms are more powerful than Next.js's pipeline for remote images, but only if the URL includes the right parameters.

**Solution**

Use a URL builder for all Cloudinary references:

```typescript
// lib/utils/cloudinary.ts
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

interface CloudinaryImageOptions {
  width?: number
  height?: number
  quality?: 'auto' | 'auto:best' | 'auto:eco' | number
  format?: 'auto' | 'webp' | 'jpg'
  crop?: 'fill' | 'fit' | 'scale' | 'thumb'
  gravity?: 'face' | 'center' | 'auto'
}

export function buildCloudinaryUrl(publicId: string, options: CloudinaryImageOptions = {}): string {
  const { width, height, quality = 'auto', format = 'auto', crop = 'fill', gravity = 'auto' } = options

  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    crop && `c_${crop}`,
    gravity && `g_${gravity}`,
    width && `w_${width}`,
    height && `h_${height}`,
  ].filter(Boolean).join(',')

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

// Usage at each context:
buildCloudinaryUrl(publicId, { width: 400 })          // Product card
buildCloudinaryUrl(publicId, { width: 800 })          // PDP hero
buildCloudinaryUrl(publicId, { width: 80, crop: 'thumb' })  // Cart thumbnail
```

**next.config.mjs update** — keep `unoptimized: true` for Cloudinary (handled by Cloudinary's CDN), but local images under `/public/` do not need this:

```js
// Cloudinary handles its own optimization via URL transforms
// next.config.mjs can remain as-is while Cloudinary URLs use transform params directly
```

---

### SOP-17: Image Hydration Safety

**Pattern**
No component may call `Math.random()`, `Date.now()`, or any non-deterministic function synchronously during render or in effects that run before hydration. These calls produce different values on the server vs. client, causing React hydration mismatches.

**Problem**
`ImageCarousel` in `components/ui/image-carousel.tsx` calls `Math.random()` inside `getIntervalMs()` for `'browse'` mode:

```typescript
// ❌ This causes a hydration mismatch
case 'browse':
  return 2000 + Math.random() * 1000  // Server: 2347ms. Client: 2891ms. React error.
```

When the server renders `2347` and the client renders `2891`, React's reconciliation fails with a hydration warning, and in strict mode, a full re-render is forced.

**Solution**

```typescript
// ✅ Stable default on server, randomized in useEffect (client-only)
export function ImageCarousel({ mode, staggerIndex = 0, images, ... }: ImageCarouselProps) {
  // Stable server-side value (no randomness)
  const [intervalMs, setIntervalMs] = useState<number | null>(null)

  useEffect(() => {
    // Math.random() is safe here — only runs on the client after hydration
    const calculated = getIntervalMs(mode, images.length, staggerIndex)
    setIntervalMs(calculated)
  }, [mode, images.length, staggerIndex])

  // intervalMs is null until after hydration — carousel doesn't start until then
  // This is the correct behavior: no server-rendered animation state
}
```

---

## Section 6 — Performance & Scalability

---

### SOP-18: Global Performance Budget

This section defines hard constraints for an application serving users in Nigeria, the UK, and the US. Network conditions vary significantly across these regions — solutions must be conservative by default.

---

**Performance Targets**

| Metric | Target | Measurement |
|---|---|---|
| Time to Interactive (TTC) | < 3.5s on 4G | Vercel Analytics / Lighthouse |
| Largest Contentful Paint | < 2.5s | Core Web Vitals |
| Cart open / close | < 100ms perceived | Manual test |
| Exchange rate resolve | < 200ms | Server Action timing |
| Product page full load | < 4s on 3G (NG baseline) | WebPageTest |

---

**Database: Index All High-Frequency Lookup Columns**

Every query that filters by `currency_code`, `product_id`, `user_id`, or `cart_id` must be backed by a database index. Without indexes, Supabase performs a full table scan — O(n) rather than O(log n) — degrading under load.

Add to a new migration (`009_performance_indexes.sql`):

```sql
-- Exchange rate lookups (called on every page load)
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_active
  ON exchange_rates (currency_code, is_active)
  WHERE is_active = true;

-- Cart item lookups by cart
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id
  ON cart_items (cart_id);

-- Cart lookups by user
CREATE INDEX IF NOT EXISTS idx_carts_user_id
  ON carts (user_id);

-- Order lookups by user
CREATE INDEX IF NOT EXISTS idx_orders_user_id
  ON orders (user_id);

-- Product lookups by slug (used on PDP page)
CREATE INDEX IF NOT EXISTS idx_products_slug
  ON products (slug)
  WHERE slug IS NOT NULL;

-- Order items by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items (order_id);
```

---

**Caching: Stale-While-Revalidate for Exchange Rates**

Exchange rates do not change per-request — they are updated by an admin periodically. Fetching from the database on every page load wastes a round-trip and adds latency.

Implement SWR caching at the API route level:

```typescript
// app/api/exchange-rates/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // ... fetch from Supabase

  return NextResponse.json(
    { rates },
    {
      headers: {
        // Fresh for 5 minutes, stale-while-revalidating for 10 minutes
        // Vercel Edge Network caches this globally
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  )
}
```

```typescript
// contexts/currency-context.tsx — add revalidation interval
const fetchExchangeRates = useCallback(async () => {
  const response = await fetch('/api/exchange-rates', {
    next: { revalidate: 300 }, // Next.js fetch cache — 5 minutes
  })
  // ...
}, [])
```

**Rule:** No component may call `getExchangeRates()` directly in a server component or per-request Server Action. All exchange rate access goes through `/api/exchange-rates` so the CDN cache can absorb the load.

---

**Edge Runtime: Middleware and Geolocation**

Currency auto-detection currently calls `ipapi.co` from the client browser. This adds an external network request to the critical path on every first visit.

Move geolocation to the Next.js middleware (Edge Runtime), which runs at Vercel's edge — closer to the user:

```typescript
// proxy.ts (middleware) — add currency detection
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Vercel provides geo data for free on Edge Runtime
  const country = request.geo?.country ?? 'GB'

  const countryToCurrency: Record<string, string> = {
    GB: 'GBP', US: 'USD', NG: 'NGN', GH: 'GHS', CA: 'CAD',
    DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
  }

  const detectedCurrency = countryToCurrency[country] ?? 'GBP'
  const response = NextResponse.next()

  // Set cookie if not already set — CurrencyProvider reads this on first render
  if (!request.cookies.get('dehair_currency')) {
    response.cookies.set('dehair_currency', detectedCurrency, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    })
  }

  return response
}
```

This eliminates the `ipapi.co` fetch entirely, removing an external dependency from the client bundle.

---

**React Server Components: Minimize Client Bundle Size**

Heavy components that only render data (no interactivity) must remain as Server Components. Each kilobyte removed from the client bundle directly improves Time to Interactive for users on slow connections.

```
Do NOT add 'use client' to:
  - app/shop/page.tsx (fetches products, no interaction)
  - app/checkout/page.tsx (fetches cart, renders form that IS a child client component)
  - app/account/orders/page.tsx (fetches orders, display only)
  - Any component that is purely presentational (no event handlers, no hooks)

The CheckoutForm IS 'use client' — but CheckoutPage is not.
The CartSheet IS 'use client' — but the layout that imports it is not.
```

---

**Video: HLS for Netflix-Style Player**

When the Netflix-style video product feature is implemented, video must be delivered via HLS (HTTP Live Streaming), not as raw `.mp4` files.

```
Why HLS:
  - Adaptive bitrate: Nigerian users on 3G get a low-quality stream; UK users get HD
  - Chunked delivery: playback starts in ~1s instead of waiting for full download
  - Cloudinary supports HLS output: upload once, serve at any quality automatically

HLS URL pattern (Cloudinary):
  https://res.cloudinary.com/{cloud}/video/upload/sp_hd/f_m3u8/{public_id}.m3u8

Player library to use: hls.js (already available in modern browsers natively)
```

```typescript
// components/ui/video-player.tsx (future implementation reference)
'use client'
import Hls from 'hls.js'
import { useEffect, useRef } from 'react'

interface VideoPlayerProps {
  hlsUrl: string    // Cloudinary .m3u8 URL
  posterUrl?: string
}

export function VideoPlayer({ hlsUrl, posterUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls({ autoStartLoad: true, startLevel: -1 }) // -1 = auto quality
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)
      return () => hls.destroy()
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS on Safari/iOS
      video.src = hlsUrl
    }
  }, [hlsUrl])

  return (
    <video
      ref={videoRef}
      poster={posterUrl}
      muted
      playsInline
      className="w-full h-auto rounded-xl"
    />
  )
}
```

**Rule:** No product video is ever served as a direct `.mp4` URL. All video goes through Cloudinary's HLS pipeline. The `getWebCompatibleVideoUrl()` utility in `lib/utils/cloudinary-video.ts` should be updated to output `.m3u8` URLs, not `.mp4`.
