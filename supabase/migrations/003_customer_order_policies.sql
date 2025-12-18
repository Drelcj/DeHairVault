-- Migration: 003_customer_order_policies.sql
-- Description: Allow authenticated customers only to create carts, orders, and order items
-- NOTE: Guest users cannot create carts or orders - authentication required

-- ============================================
-- ORDER POLICIES (authenticated users only)
-- ============================================

-- Orders: Allow authenticated users to insert their own orders
DROP POLICY IF EXISTS orders_insert_own ON orders;
CREATE POLICY orders_insert_own ON orders
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Orders: Allow users to select their own orders
DROP POLICY IF EXISTS orders_select_own ON orders;
CREATE POLICY orders_select_own ON orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Order Items: Allow authenticated users to insert items for their own orders
DROP POLICY IF EXISTS order_items_insert_own ON order_items;
CREATE POLICY order_items_insert_own ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Order Items: Users can view items in their orders
DROP POLICY IF EXISTS order_items_select_own ON order_items;
CREATE POLICY order_items_select_own ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================
-- CART POLICIES (authenticated users only)
-- ============================================

-- Carts: Allow authenticated users to create their own cart
DROP POLICY IF EXISTS carts_insert_anyone ON carts;
DROP POLICY IF EXISTS carts_insert_own ON carts;
CREATE POLICY carts_insert_own ON carts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Carts: Allow users to select their own cart
DROP POLICY IF EXISTS carts_select_own ON carts;
CREATE POLICY carts_select_own ON carts
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Carts: Allow users to update their own cart
DROP POLICY IF EXISTS carts_update_own ON carts;
CREATE POLICY carts_update_own ON carts
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Carts: Allow users to delete their own cart
DROP POLICY IF EXISTS carts_delete_own ON carts;
CREATE POLICY carts_delete_own ON carts
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- ============================================
-- CART ITEMS POLICIES (authenticated users only)
-- ============================================

-- Cart Items: Allow insert for items in user's own cart
DROP POLICY IF EXISTS cart_items_insert_own ON cart_items;
CREATE POLICY cart_items_insert_own ON cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

-- Cart Items: Allow select for items in user's own cart
DROP POLICY IF EXISTS cart_items_select_own ON cart_items;
CREATE POLICY cart_items_select_own ON cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

-- Cart Items: Allow update for items in user's own cart
DROP POLICY IF EXISTS cart_items_update_own ON cart_items;
CREATE POLICY cart_items_update_own ON cart_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

-- Cart Items: Allow delete for items in user's own cart
DROP POLICY IF EXISTS cart_items_delete_own ON cart_items;
CREATE POLICY cart_items_delete_own ON cart_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

