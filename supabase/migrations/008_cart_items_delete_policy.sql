-- Migration: 008_cart_items_delete_policy.sql
-- Description: Add missing DELETE policy on cart_items so authenticated users
--              can remove items from their own cart.
--
-- Root cause: removeFromCart() in lib/actions/cart.ts returned { success: true }
-- even when RLS blocked the DELETE (Supabase returns 0 rows affected, not an error).
-- The optimistic UI removal stuck, but the item reappeared on the next cart refresh
-- — the "ghost delete" bug.
--
-- This migration adds the missing policy. All other cart_items policies
-- (INSERT, SELECT, UPDATE) were already present in 003_customer_order_policies.sql.

DROP POLICY IF EXISTS cart_items_delete_own ON cart_items;

CREATE POLICY cart_items_delete_own ON cart_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    )
  );
