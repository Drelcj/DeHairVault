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
