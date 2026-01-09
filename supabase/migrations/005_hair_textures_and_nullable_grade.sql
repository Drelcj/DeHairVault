-- Migration: Add hair_textures lookup table and make grade nullable
-- This allows dynamic texture creation and optional grade selection

-- ============================================================================
-- 1. CREATE HAIR_TEXTURES LOOKUP TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hair_textures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comment for documentation
COMMENT ON TABLE hair_textures IS 'Lookup table for hair textures - allows dynamic addition of new textures by admins';

-- Insert default textures from the existing enum values
INSERT INTO hair_textures (value, label) VALUES
  ('STRAIGHT', 'Straight'),
  ('BODY_WAVE', 'Body Wave'),
  ('LOOSE_WAVE', 'Loose Wave'),
  ('DEEP_WAVE', 'Deep Wave'),
  ('WATER_WAVE', 'Water Wave'),
  ('KINKY_CURLY', 'Kinky Curly'),
  ('JERRY_CURL', 'Jerry Curl'),
  ('LOOSE_DEEP', 'Loose Deep'),
  ('NATURAL_WAVE', 'Natural Wave')
ON CONFLICT (value) DO NOTHING;

-- ============================================================================
-- 2. MODIFY PRODUCTS TABLE - MAKE GRADE NULLABLE
-- ============================================================================

-- Change the grade column to allow NULL (N/A option)
-- First, drop the NOT NULL constraint if it exists
ALTER TABLE products ALTER COLUMN grade DROP NOT NULL;

-- Drop the view that depends on texture column
DROP VIEW IF EXISTS v_products_with_stock;

-- Change texture column to TEXT to support custom textures
-- (keeping enum values as valid options but allowing new ones)
ALTER TABLE products ALTER COLUMN texture TYPE TEXT;

-- Recreate the view (must DROP first since column names changed from _ngn to _gbp)
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
-- 3. RLS POLICIES FOR HAIR_TEXTURES
-- ============================================================================

-- Enable RLS
ALTER TABLE hair_textures ENABLE ROW LEVEL SECURITY;

-- Public read access (everyone can see available textures)
CREATE POLICY "hair_textures_public_read" ON hair_textures
  FOR SELECT
  USING (is_active = true);

-- Admin write access
CREATE POLICY "hair_textures_admin_insert" ON hair_textures
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "hair_textures_admin_update" ON hair_textures
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- 4. TRIGGER TO UPDATE updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_hair_textures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hair_textures_updated_at ON hair_textures;
CREATE TRIGGER hair_textures_updated_at
  BEFORE UPDATE ON hair_textures
  FOR EACH ROW
  EXECUTE FUNCTION update_hair_textures_updated_at();
