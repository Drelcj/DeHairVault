# 🚀 NEXT STEP: Apply RLS Migration

## Copy & Paste This SQL into Supabase Dashboard

### Instructions
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your **DeHairVault** project
3. Click **SQL Editor** (left sidebar)
4. Click **+ New Query**
5. **Copy the SQL below** (entire block)
6. **Paste into editor**
7. Click **Run** or press **Ctrl/Cmd + Enter**
8. ✅ Done! You should see "Query executed successfully" at the top

---

## SQL to Execute

```sql
-- Phase 3: Admin policy adjustments (no SUPER_ADMIN) and users insert policy

-- Ensure users can insert their own profile row
CREATE POLICY IF NOT EXISTS users_insert_own ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Replace any SUPER_ADMIN role checks with ADMIN-only checks
-- Products
DROP POLICY IF EXISTS products_admin_all ON products;
CREATE POLICY products_admin_all ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Product Variants
DROP POLICY IF EXISTS product_variants_admin_all ON product_variants;
CREATE POLICY product_variants_admin_all ON product_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Orders
DROP POLICY IF EXISTS orders_admin_all ON orders;
CREATE POLICY orders_admin_all ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Order Items
DROP POLICY IF EXISTS order_items_admin_all ON order_items;
CREATE POLICY order_items_admin_all ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Exchange Rates
DROP POLICY IF EXISTS exchange_rates_admin_all ON exchange_rates;
CREATE POLICY exchange_rates_admin_all ON exchange_rates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Coupons
DROP POLICY IF EXISTS coupons_admin_all ON coupons;
CREATE POLICY coupons_admin_all ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Product Reviews
DROP POLICY IF EXISTS product_reviews_admin_all ON product_reviews;
CREATE POLICY product_reviews_admin_all ON product_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Admin Activity Log
DROP POLICY IF EXISTS admin_activity_log_admin_only ON admin_activity_log;
CREATE POLICY admin_activity_log_admin_only ON admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS admin_activity_log_admin_insert ON admin_activity_log;
CREATE POLICY admin_activity_log_admin_insert ON admin_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );
```

---

## ✅ Verification

After executing, run this SQL in a **new query** to verify policies are in place:

```sql
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'products', 'orders', 'admin_activity_log')
ORDER BY tablename, policyname;
```

**Expected result**: Should show ~15 rows with policies like:
- `users_insert_own`
- `products_admin_all`
- `orders_admin_all`
- `admin_activity_log_admin_only`
- etc.

---

## 🎯 What This Does

| Table | Policy | Effect |
|-------|--------|--------|
| users | users_insert_own | Users can create their own profile on signup |
| products | products_admin_all | Only ADMIN role can view/edit |
| product_variants | product_variants_admin_all | Only ADMIN role can view/edit |
| orders | orders_admin_all | Only ADMIN role can view/edit |
| order_items | order_items_admin_all | Only ADMIN role can view/edit |
| exchange_rates | exchange_rates_admin_all | Only ADMIN role can view/edit |
| coupons | coupons_admin_all | Only ADMIN role can view/edit |
| product_reviews | product_reviews_admin_all | Only ADMIN role can view/edit |
| admin_activity_log | 2 policies | ADMIN can read & insert activity logs |

---

## ⚠️ Important Notes

- ✅ This is **safe to run** - uses `IF NOT EXISTS` and `DROP POLICY IF EXISTS`
- ✅ **No data loss** - only modifies access policies, not data
- ✅ Can be **run multiple times** without issues
- ✅ **Immediately effective** - no need to restart app

---

## 🆘 If Something Goes Wrong

**Error: "Column 'role' does not exist in table users"**
- Make sure `users` table has a `role` column
- Check your Supabase schema

**Error: "User is not authorized to perform this operation"**
- Make sure you're logged in as project owner/admin
- Try in Incognito mode if permissions cached

**Migration seems applied but `/admin/orders` still shows 403**
- Clear browser cache & cookies
- Restart dev server: `npm run dev`
- Re-login with admin user

---

## 📞 Next Steps After Migration

1. ✅ Migration applied
2. Create admin test user:
   - Sign up via `/signup`
   - In Supabase dashboard → Auth Users → click user
   - Go to users table → Find same user → Set `role='ADMIN'`
3. Test `/admin/orders` - should work now!
4. Create test orders to verify everything works
5. Deploy to production

---

**Status**: Ready to apply  
**Time to complete**: < 1 minute  
**Difficulty**: Very easy (just copy/paste)

**Go to**: [app.supabase.com](https://app.supabase.com) → SQL Editor → Paste this SQL → Run ✅
