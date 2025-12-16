# Admin System Specification (Phase 2)

This document defines the Admin flows, roles/permissions, dashboard layout, and required API endpoints. It follows the existing project’s Tailwind design tokens, component patterns, and colors.

## Roles & Access Control

- Guest: Unauthenticated; can browse public products only.
- Customer: Authenticated; can manage own profile, cart, orders, reviews, wishlist.
- Admin: Full access to admin dashboard, product catalog, inventory, and orders.
- Policy: No super admin. Only `users.role === 'ADMIN'` is treated as admin.

### Access Matrix
- Products:
  - Guest/Customer: Read active products.
  - Admin: Full CRUD (products, variants), publish/unpublish, feature flags.
- Inventory:
  - Guest/Customer: No access.
  - Admin: Adjust stock, thresholds, backorder flags.
- Orders:
  - Guest: No access.
  - Customer: Read own orders; create order at checkout.
  - Admin: Read all; update status, tracking, notes; refund/cancel.
- Wishlists/Reviews:
  - Customer: CRUD own wishlist; create/update own reviews; public sees approved reviews.
  - Admin: Moderate reviews (approve/feature), read all wishlists for insights.
- Admin Portal:
  - Admin only: Dashboard, reporting, activity log.

### RLS/Policy Updates (Supabase)
- Replace role checks `users.role IN ('ADMIN', 'SUPER_ADMIN')` with `users.role = 'ADMIN'` across admin-managed tables:
  - products, product_variants, orders, order_items, exchange_rates, coupons, product_reviews, admin_activity_log.
- Ensure `users` insert/upsert is allowed for authenticated users:
  - Add: `CREATE POLICY users_insert_own ON users FOR INSERT WITH CHECK (auth.uid() = id);`
- Keep public read policies for active products, approved reviews, and active exchange rates.

## Admin Dashboard Layout

- Style: Use existing classes (e.g., `bg-background`, `border-border`, `bg-card`, rounded borders, subtle shadows, Playfair headings).
- Header: `DeHair Vault Admin` title, quick links (Products, Orders), and session dropdown.
- KPI Cards (top row):
  - Pending Orders: count where `orders.status = 'PENDING'`.
  - Low Stock Items: where `track_inventory = true` and `stock_quantity < low_stock_threshold` (or variants below threshold).
  - Sales YTD: sum `orders.total_ngn` for delivered/shipped this year.
- Charts (middle row):
  - Revenue 30d: from view `v_order_summary`.
  - Order Volume 30d: from `v_order_summary`.
- Tables (bottom row):
  - Recent Orders: last 10 orders with (Order #, Customer, Total, Status, Placed At, Actions).
  - Low Stock: product/variant, on-hand, threshold, backorder flag, quick “Adjust”.
- Navigation: Dashboard, Products, Orders, Inventory, Reviews, Coupons (optional).
- Empty/loading: Bordered cards, muted text, skeletons consistent with current UI.

## API Endpoints — Products (Admin-only)

Base: `/api/admin/products` (verify `users.role === 'ADMIN'`; log to `admin_activity_log`).

- List: `GET /api/admin/products`
  - Query: `q`, `category`, `grade`, `texture`, `is_active`, `is_featured`, `page`, `pageSize`, `sort` (`updated_at:desc` etc.).
  - Returns: paginated list; source `products` joined with `v_products_with_stock`.
- Get: `GET /api/admin/products/:id`
  - Returns: product + variants.
- Create: `POST /api/admin/products`
  - Body: product fields + optional variants array `{ length, sku, price_override_ngn, stock_quantity }`.
  - Behavior: Insert product; upsert variants with `UNIQUE(product_id,length)`.
- Update: `PATCH /api/admin/products/:id`
  - Body: partial product; variants upsert/remove.
  - Behavior: Upsert variants, delete removed, update product; return updated resource.
- Delete: `DELETE /api/admin/products/:id`
  - Behavior: Prefer soft-delete (`is_active=false`) in UI; hard delete optional.
- Inventory Adjust: `POST /api/admin/products/:id/adjust`
  - Body: `{ product_delta?: number, variants?: [{variant_id, delta}] }`.
  - Behavior: Atomic stock adjustments; record in `admin_activity_log`.

## API Endpoints — Orders (Admin-only)

Base: `/api/admin/orders` (verify `users.role === 'ADMIN'`; log mutations).

- List: `GET /api/admin/orders`
  - Query: `status`, `q` (order number/email/name), `dateFrom`, `dateTo`, `type` (`REGULAR|PRE_ORDER|WHOLESALE`), `page`, `pageSize`, `sort` (`created_at:desc`, `total_ngn:desc`).
  - Returns: paginated orders with item counts.
- Get: `GET /api/admin/orders/:id`
  - Returns: order + items; payment/shipping metadata; status timeline.
- Update Status: `POST /api/admin/orders/:id/status`
  - Body: `{ status, tracking_number?, tracking_url?, admin_notes? }`.
  - Rules: `PENDING -> CONFIRMED|CANCELLED`; `CONFIRMED -> PROCESSING`; `PROCESSING -> SHIPPED`; `SHIPPED -> DELIVERED`; `* -> REFUNDED` with guards; `update_stock_on_order` trigger handles stock changes.
- Edit Admin Notes: `PATCH /api/admin/orders/:id`
  - Body: `{ admin_notes }`.
- Refund/Cancel: `POST /api/admin/orders/:id/refund` or `/cancel`
  - Body: `{ reason, amount? }`.
- Summary: `GET /api/admin/orders/summary`
  - Returns: 30d revenue and counts via `v_order_summary`, plus pending/completed totals.

## Backend Implementation Notes

- Use Next.js Route Handlers under `app/api/admin/**`.
- Auth: Read session via server Supabase client; select `users.role` by auth uid; require `ADMIN` for all admin routes.
- Writes: Prefer service-role client for admin mutations; ensure secrets only server-side.
- Logging: Insert into `admin_activity_log` on mutations with `{ admin_id, action, resource_type, resource_id, changes }`.
- Pagination: Standard `page`/`pageSize`; return `{ data, pagination }`.

## UI Implementation Notes

- Follow existing styling: glassy headers (`bg-background/80 backdrop-blur-xl`), bordered cards (`border border-border bg-card`), rounded corners, subtle shadows, serif headings.
- Reuse primitives in `components/ui` and admin products components for consistency.
- Ensure responsive layouts and accessible focus styles.
