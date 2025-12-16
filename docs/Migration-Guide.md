# Admin Policies Migration Guide

## Overview
This migration applies RLS (Row Level Security) policies to enforce admin-only access across all sensitive tables and adds the `users_insert_own` policy to allow users to register their own profiles.

## What Gets Updated
- **users**: Add insert policy for self-registration
- **products**: Replace SUPER_ADMIN checks with ADMIN-only
- **product_variants**: Replace SUPER_ADMIN checks with ADMIN-only
- **orders**: Replace SUPER_ADMIN checks with ADMIN-only
- **order_items**: Replace SUPER_ADMIN checks with ADMIN-only
- **exchange_rates**: Replace SUPER_ADMIN checks with ADMIN-only
- **coupons**: Replace SUPER_ADMIN checks with ADMIN-only
- **product_reviews**: Replace SUPER_ADMIN checks with ADMIN-only
- **admin_activity_log**: Add admin-only read/insert policies

## How to Apply

### Method 1: Supabase Dashboard (Recommended for this project)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your DeHairVault project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **+ New Query**
5. Copy the entire contents of `supabase/migrations/002_admin_policies.sql`
6. Paste into the SQL editor
7. Click **Run** (CMD/CTRL + Enter)
8. Verify: No error messages should appear

### Method 2: Supabase CLI (If installed locally)

```bash
# Install globally (one-time)
npm install -g supabase

# In the project directory
supabase db push

# Or specific migration
supabase migration up 002_admin_policies
```

### Method 3: Direct cURL (Advanced)

```bash
curl -X POST "https://YOUR_PROJECT_URL/rest/v1/rpc/query" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d "SELECT <sql_content_here>"
```

## Verification Steps

After applying the migration, verify the policies are in place:

1. **In Supabase Dashboard**:
   - Go to **Authentication** → **Policies**
   - For each table (products, orders, etc.), check that policies exist
   - Look for policies containing `users.role = 'ADMIN'`

2. **Or run this SQL query** (SQL Editor):
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'products', 'orders', 'order_items', 'admin_activity_log')
ORDER BY tablename, policyname;
```

Expected output: Should show policies for all listed tables with `ADMIN` role checks.

## Rollback (If needed)

If you need to revert, you can drop the policies:

```sql
DROP POLICY IF EXISTS users_insert_own ON users;
DROP POLICY IF EXISTS products_admin_all ON products;
DROP POLICY IF EXISTS product_variants_admin_all ON product_variants;
DROP POLICY IF EXISTS orders_admin_all ON orders;
DROP POLICY IF EXISTS order_items_admin_all ON order_items;
DROP POLICY IF EXISTS exchange_rates_admin_all ON exchange_rates;
DROP POLICY IF EXISTS coupons_admin_all ON coupons;
DROP POLICY IF EXISTS product_reviews_admin_all ON product_reviews;
DROP POLICY IF EXISTS admin_activity_log_admin_only ON admin_activity_log;
DROP POLICY IF EXISTS admin_activity_log_admin_insert ON admin_activity_log;
```

## Impact on Application

### Before Migration
- No admin-only enforcement via RLS (relied on proxy middleware)
- Users could potentially access admin tables

### After Migration
- All admin operations (`/api/admin/*`) enforce ADMIN role via RLS + proxy
- Only users with `role = 'ADMIN'` in the users table can access/modify admin data
- All changes are logged to `admin_activity_log`
- User self-registration is enabled with `users_insert_own` policy

## Testing the Migration

After applying, test with an admin user:

```bash
# 1. Create a test admin user (via Supabase Auth + Users table)
# 2. Set role='ADMIN' in the users table
# 3. Try accessing the admin API:

curl http://localhost:3000/api/admin/orders \
  -H "Cookie: sb-session-token=YOUR_SESSION"

# Should return orders (200)
# Should fail with 403 if user role is not ADMIN
```

---

**Last Updated**: December 16, 2025  
**Status**: Ready to apply
