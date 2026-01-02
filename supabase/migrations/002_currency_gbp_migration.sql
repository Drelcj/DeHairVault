-- Migration: Convert from NGN-based to GBP-based currency system
-- This migration updates the database schema to use GBP as the base currency

-- ============================================================================
-- Step 1: Exchange Rates Table - Add new column and migrate data
-- ============================================================================

-- Add new column for GBP-based rates
ALTER TABLE exchange_rates ADD COLUMN IF NOT EXISTS rate_from_gbp DECIMAL(12, 6);

-- Migrate existing data (assuming 1 GBP ≈ 1950 NGN as approximate rate)
-- This converts the rate_to_ngn to rate_from_gbp
-- Formula: if rate_to_ngn was the rate to convert TO NGN, then rate_from_gbp = 1950 / rate_to_ngn
UPDATE exchange_rates 
SET rate_from_gbp = CASE 
  WHEN currency_code = 'GBP' THEN 1
  WHEN currency_code = 'NGN' THEN 1950
  WHEN currency_code = 'USD' THEN 1.27
  WHEN currency_code = 'EUR' THEN 1.17
  WHEN currency_code = 'CAD' THEN 1.72
  WHEN currency_code = 'GHS' THEN 15.5
  ELSE 1
END
WHERE rate_from_gbp IS NULL;

-- Make rate_from_gbp required
ALTER TABLE exchange_rates ALTER COLUMN rate_from_gbp SET NOT NULL;

-- Optionally drop old column after verification (uncomment when ready)
-- ALTER TABLE exchange_rates DROP COLUMN IF EXISTS rate_to_ngn;

-- ============================================================================
-- Step 2: Products Table - Rename price columns
-- ============================================================================

-- Add new GBP columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_price_gbp DECIMAL(12, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price_gbp DECIMAL(12, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price_gbp DECIMAL(12, 2);

-- Migrate product prices (convert NGN to GBP at rate of 1950)
UPDATE products 
SET base_price_gbp = ROUND(base_price_ngn / 1950, 2),
    compare_at_price_gbp = CASE WHEN compare_at_price_ngn IS NOT NULL THEN ROUND(compare_at_price_ngn / 1950, 2) ELSE NULL END,
    cost_price_gbp = CASE WHEN cost_price_ngn IS NOT NULL THEN ROUND(cost_price_ngn / 1950, 2) ELSE NULL END
WHERE base_price_gbp IS NULL;

-- Make base_price_gbp required
ALTER TABLE products ALTER COLUMN base_price_gbp SET NOT NULL;

-- ============================================================================
-- Step 3: Product Variants Table - Rename price column
-- ============================================================================

ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS price_override_gbp DECIMAL(12, 2);

UPDATE product_variants 
SET price_override_gbp = CASE WHEN price_override_ngn IS NOT NULL THEN ROUND(price_override_ngn / 1950, 2) ELSE NULL END
WHERE price_override_gbp IS NULL AND price_override_ngn IS NOT NULL;

-- ============================================================================
-- Step 4: Coupons Table - Update columns (if exists)
-- ============================================================================

-- Add new GBP columns to coupons
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS minimum_order_gbp DECIMAL(12, 2);
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS maximum_discount_gbp DECIMAL(12, 2);

UPDATE coupons 
SET minimum_order_gbp = CASE WHEN minimum_order_ngn IS NOT NULL THEN ROUND(minimum_order_ngn / 1950, 2) ELSE NULL END,
    maximum_discount_gbp = CASE WHEN maximum_discount_ngn IS NOT NULL THEN ROUND(maximum_discount_ngn / 1950, 2) ELSE NULL END
WHERE minimum_order_gbp IS NULL;

-- ============================================================================
-- Step 5: Insert/Update default exchange rates
-- ============================================================================

-- Upsert default exchange rates
INSERT INTO exchange_rates (currency_code, rate_from_gbp, symbol, is_active)
VALUES 
  ('GBP', 1, '£', true),
  ('USD', 1.27, '$', true),
  ('EUR', 1.17, '€', true),
  ('NGN', 1950, '₦', true),
  ('CAD', 1.72, 'C$', true),
  ('GHS', 15.5, '₵', true)
ON CONFLICT (currency_code) 
DO UPDATE SET 
  rate_from_gbp = EXCLUDED.rate_from_gbp,
  symbol = EXCLUDED.symbol,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- Step 6: Update views (if any)
-- ============================================================================

-- If you have a products_with_price_range view, it needs to be updated
DROP VIEW IF EXISTS products_with_price_range;

CREATE OR REPLACE VIEW products_with_price_range AS
SELECT 
  p.*,
  COALESCE(MIN(COALESCE(pv.price_override_gbp, p.base_price_gbp)), p.base_price_gbp) as lowest_price_gbp,
  COALESCE(MAX(COALESCE(pv.price_override_gbp, p.base_price_gbp)), p.base_price_gbp) as highest_price_gbp
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id;

-- ============================================================================
-- NOTE: After verifying everything works, you can drop the old NGN columns:
-- ============================================================================
-- ALTER TABLE exchange_rates DROP COLUMN IF EXISTS rate_to_ngn;
-- ALTER TABLE products DROP COLUMN IF EXISTS base_price_ngn;
-- ALTER TABLE products DROP COLUMN IF EXISTS compare_at_price_ngn;
-- ALTER TABLE products DROP COLUMN IF EXISTS cost_price_ngn;
-- ALTER TABLE product_variants DROP COLUMN IF EXISTS price_override_ngn;
-- ALTER TABLE coupons DROP COLUMN IF EXISTS minimum_order_ngn;
-- ALTER TABLE coupons DROP COLUMN IF EXISTS maximum_discount_ngn;
