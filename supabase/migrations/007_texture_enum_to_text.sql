-- Migration: 007_texture_enum_to_text.sql
-- Description: Convert order_items.product_texture from ENUM to TEXT for dynamic texture support
-- This fixes the "invalid input value for enum hair_texture" errors during checkout

-- ============================================================================
-- PHASE 1: CONVERT ORDER_ITEMS.PRODUCT_TEXTURE TO TEXT
-- ============================================================================

-- Step 1: Add a temporary TEXT column
ALTER TABLE order_items ADD COLUMN product_texture_new TEXT;

-- Step 2: Copy existing data (ENUM values cast to TEXT)
UPDATE order_items SET product_texture_new = product_texture::TEXT;

-- Step 3: Drop the old ENUM column
ALTER TABLE order_items DROP COLUMN product_texture;

-- Step 4: Rename the new column to the original name
ALTER TABLE order_items RENAME COLUMN product_texture_new TO product_texture;

-- Step 5: Add NOT NULL constraint (all existing data should be migrated)
ALTER TABLE order_items ALTER COLUMN product_texture SET NOT NULL;

-- ============================================================================
-- PHASE 2: CONVERT ORDER_ITEMS.PRODUCT_GRADE TO TEXT (future-proofing)
-- ============================================================================

-- Step 1: Add a temporary TEXT column
ALTER TABLE order_items ADD COLUMN product_grade_new TEXT;

-- Step 2: Copy existing data (ENUM values cast to TEXT)
UPDATE order_items SET product_grade_new = product_grade::TEXT;

-- Step 3: Drop the old ENUM column
ALTER TABLE order_items DROP COLUMN product_grade;

-- Step 4: Rename the new column to the original name
ALTER TABLE order_items RENAME COLUMN product_grade_new TO product_grade;

-- Step 5: Make grade nullable (some products may not have grades)
-- No NOT NULL constraint - allows NULL for products without grade

-- ============================================================================
-- PHASE 3: CONVERT ORDER_ITEMS.PRODUCT_ORIGIN TO TEXT (future-proofing)
-- ============================================================================

-- Step 1: Add a temporary TEXT column
ALTER TABLE order_items ADD COLUMN product_origin_new TEXT;

-- Step 2: Copy existing data (ENUM values cast to TEXT)
UPDATE order_items SET product_origin_new = product_origin::TEXT;

-- Step 3: Drop the old ENUM column
ALTER TABLE order_items DROP COLUMN product_origin;

-- Step 4: Rename the new column to the original name
ALTER TABLE order_items RENAME COLUMN product_origin_new TO product_origin;

-- Step 5: Add NOT NULL constraint
ALTER TABLE order_items ALTER COLUMN product_origin SET NOT NULL;

-- ============================================================================
-- PHASE 4: DROP DEPRECATED ENUMS (if no longer used elsewhere)
-- ============================================================================

-- Note: We keep the ENUMs for now as they may still be used by:
-- - products table (origin still uses hair_origin)
-- - coupons table (applicable_grades uses hair_grade[])
-- 
-- To fully remove them in the future, run:
-- DROP TYPE IF EXISTS hair_texture CASCADE;
-- (Only after all references are migrated)

-- ============================================================================
-- VERIFICATION QUERY (run after migration)
-- ============================================================================

-- You can verify the migration worked by running:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'order_items' 
-- AND column_name IN ('product_texture', 'product_grade', 'product_origin');
--
-- Expected result: All three should show data_type = 'text'

-- ============================================================================
-- ADD COMMENT FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN order_items.product_texture IS 'Hair texture stored as TEXT for dynamic texture support. Values from hair_textures lookup table.';
COMMENT ON COLUMN order_items.product_grade IS 'Hair grade stored as TEXT. Nullable for products without grade classification.';
COMMENT ON COLUMN order_items.product_origin IS 'Hair origin stored as TEXT for dynamic origin support.';
