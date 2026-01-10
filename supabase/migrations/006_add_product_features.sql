-- Migration: 006_add_product_features.sql
-- Description: Add features column to products table for storing product bullet points

-- ============================================================================
-- 1. ADD FEATURES COLUMN TO PRODUCTS TABLE
-- ============================================================================

-- Add the features column as TEXT[] (array of strings) with null default
ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT NULL;

-- Add a comment to document the column purpose
COMMENT ON COLUMN products.features IS 'Array of product feature bullet points for display on product detail page';

-- ============================================================================
-- 2. RECREATE VIEW (since we're using p.* it will automatically include features)
-- ============================================================================

-- Drop and recreate the view to ensure it picks up the new column
DROP VIEW IF EXISTS v_products_with_stock;

CREATE VIEW v_products_with_stock AS
SELECT 
  p.*,
  COALESCE(SUM(pv.stock_quantity), p.stock_quantity) as total_stock,
  COUNT(pv.id) as variant_count,
  COALESCE(MIN(COALESCE(pv.price_override_ngn, p.base_price_gbp)), p.base_price_gbp) as lowest_price_gbp,
  COALESCE(MAX(COALESCE(pv.price_override_ngn, p.base_price_gbp)), p.base_price_gbp) as highest_price_gbp
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id;

-- ============================================================================
-- 3. ADD SAMPLE FEATURES TO EXISTING PRODUCTS (optional seed data update)
-- ============================================================================

-- This is optional - you can run this to add sample features to products
-- UPDATE products SET features = ARRAY[
--   '100% Virgin Human Hair',
--   'Can be colored, bleached and styled',
--   'Minimal shedding and tangling',
--   'Double weft for extra security',
--   'Lasts 12+ months with proper care'
-- ] WHERE features IS NULL;
