-- DeHair Vault Seed Data (GBP-based)
-- This file contains sample data for development and testing
-- All prices are in GBP (British Pounds)

-- ============================================================================
-- EXCHANGE RATES (Rate from GBP)
-- ============================================================================

INSERT INTO exchange_rates (currency_code, rate_from_gbp, symbol, is_active) VALUES
  ('GBP', 1.000000, '£', TRUE),
  ('USD', 1.270000, '$', TRUE),
  ('EUR', 1.170000, '€', TRUE),
  ('NGN', 1950.000000, '₦', TRUE),
  ('CAD', 1.720000, 'C$', TRUE),
  ('GHS', 15.500000, '₵', TRUE)
ON CONFLICT (currency_code) DO UPDATE SET
  rate_from_gbp = EXCLUDED.rate_from_gbp,
  symbol = EXCLUDED.symbol,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- SAMPLE PRODUCTS (Prices in GBP)
-- ============================================================================

-- Grade A - Raw Baby Hair Products
INSERT INTO products (
  name,
  slug,
  description,
  short_description,
  grade,
  origin,
  texture,
  category,
  draw_type,
  available_lengths,
  grade_details,
  base_price_gbp,
  compare_at_price_gbp,
  length_price_modifiers,
  stock_quantity,
  low_stock_threshold,
  track_inventory,
  allow_backorder,
  images,
  thumbnail_url,
  is_active,
  is_featured,
  is_new_arrival,
  is_bestseller,
  is_preorder_only
) VALUES
(
  'Raw Baby Straight Bundles',
  'raw-baby-straight-bundles',
  'Our Raw Baby Straight Bundles are sourced from 1-2 children donors, ensuring the highest quality and rarest hair available. This premium grade hair is completely unprocessed, maintaining its natural brown color and exceptional silkiness. With proper care, these bundles can last up to 10 years, making them a true investment piece.',
  'Ultra-premium raw baby hair from Vietnam. Lifespan: 10 years. Limited stock.',
  'GRADE_A',
  'VIETNAM',
  'STRAIGHT',
  'BUNDLES',
  'DOUBLE_DRAWN',
  ARRAY[6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
  '{"donor_count": "1-2 children", "lifespan_years": 10, "natural_color": "natural brown", "bleachable": false, "characteristics": ["rare", "limited stock", "ultra-premium", "silkiest texture"]}'::jsonb,
  179.49,  -- ~£180 (was ₦350,000)
  199.99,  -- Compare at price
  '{"6": 179.49, "8": 189.74, "10": 199.99, "12": 215.39, "14": 230.77, "16": 246.15, "18": 261.54, "20": 282.05, "22": 302.56, "24": 323.08, "26": 358.97}'::jsonb,
  25,
  5,
  TRUE,
  FALSE,
  ARRAY['/products/raw-baby-straight-1.jpg', '/products/raw-baby-straight-2.jpg'],
  '/products/raw-baby-straight-thumb.jpg',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE
),
(
  'Raw Baby Body Wave Bundles',
  'raw-baby-body-wave-bundles',
  'Experience the epitome of luxury with our Raw Baby Body Wave Bundles. This extremely rare hair is sourced from young donors, offering unparalleled softness and natural wave pattern. Perfect for those seeking the most exclusive hair experience.',
  'Premium raw baby body wave. Natural wave pattern. 10-year lifespan.',
  'GRADE_A',
  'VIETNAM',
  'BODY_WAVE',
  'BUNDLES',
  'SUPER_DOUBLE_DRAWN',
  ARRAY[8, 10, 12, 14, 16, 18, 20, 22, 24],
  '{"donor_count": "1-2 children", "lifespan_years": 10, "natural_color": "natural brown", "bleachable": false, "characteristics": ["rare", "natural wave", "ultra-soft"]}'::jsonb,
  189.74,  -- ~£190 (was ₦370,000)
  219.99,
  '{"8": 189.74, "10": 199.99, "12": 215.39, "14": 230.77, "16": 251.28, "18": 271.79, "20": 292.31, "22": 317.95, "24": 343.59}'::jsonb,
  15,
  3,
  TRUE,
  FALSE,
  ARRAY['/products/raw-baby-body-wave-1.jpg', '/products/raw-baby-body-wave-2.jpg'],
  '/products/raw-baby-body-wave-thumb.jpg',
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  FALSE
),

-- Grade B - Single Donor Products
(
  'Single Donor Straight Bundles',
  'single-donor-straight-bundles',
  'Our Single Donor Straight Bundles come from one carefully selected healthy adult donor. This ensures consistent quality throughout every strand. Bleachable up to 613 blonde with proper technique, these bundles offer versatility and longevity.',
  'Premium single donor hair. Bleachable to 613. 9-year lifespan.',
  'GRADE_B',
  'PHILIPPINES',
  'STRAIGHT',
  'BUNDLES',
  'DOUBLE_DRAWN',
  ARRAY[10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
  '{"donor_count": "1 adult", "lifespan_years": 9, "bleachable_to": "613", "characteristics": ["consistent", "versatile", "premium quality"]}'::jsonb,
  128.21,  -- ~£128 (was ₦250,000)
  149.99,
  '{"10": 128.21, "12": 138.46, "14": 148.72, "16": 158.97, "18": 174.36, "20": 189.74, "22": 205.13, "24": 225.64, "26": 246.15, "28": 271.79, "30": 307.69}'::jsonb,
  45,
  10,
  TRUE,
  FALSE,
  ARRAY['/products/single-donor-straight-1.jpg', '/products/single-donor-straight-2.jpg'],
  '/products/single-donor-straight-thumb.jpg',
  TRUE,
  TRUE,
  FALSE,
  TRUE,
  FALSE
),
(
  'Single Donor Deep Wave Bundles',
  'single-donor-deep-wave-bundles',
  'Luxurious deep wave pattern from a single donor source. These bundles maintain their wave pattern beautifully while offering the flexibility to straighten or curl as desired. A customer favorite for its versatility.',
  'Deep wave single donor. Holds pattern. Bleachable to honey blonde.',
  'GRADE_B',
  'VIETNAM',
  'DEEP_WAVE',
  'BUNDLES',
  'DOUBLE_DRAWN',
  ARRAY[10, 12, 14, 16, 18, 20, 22, 24],
  '{"donor_count": "1 adult", "lifespan_years": 9, "bleachable_to": "honey blonde", "characteristics": ["defined waves", "versatile", "low maintenance"]}'::jsonb,
  138.46,  -- ~£138 (was ₦270,000)
  159.99,
  '{"10": 138.46, "12": 148.72, "14": 158.97, "16": 174.36, "18": 189.74, "20": 205.13, "22": 225.64, "24": 246.15}'::jsonb,
  38,
  8,
  TRUE,
  FALSE,
  ARRAY['/products/single-donor-deep-wave-1.jpg'],
  '/products/single-donor-deep-wave-thumb.jpg',
  TRUE,
  FALSE,
  TRUE,
  FALSE,
  FALSE
),

-- Grade C - VIP Virgin Products
(
  'VIP Virgin Loose Wave Bundles',
  'vip-virgin-loose-wave-bundles',
  'Our VIP Virgin Loose Wave Bundles offer an excellent balance of quality and value. Sourced from 2-3 carefully cuticle-aligned donors, this hair maintains consistent quality and can be styled in numerous ways.',
  'VIP quality loose wave. Multiple draw types. 6-year lifespan.',
  'GRADE_C',
  'INDIA',
  'LOOSE_WAVE',
  'BUNDLES',
  'SINGLE_DRAWN',
  ARRAY[10, 12, 14, 16, 18, 20, 22, 24, 26],
  '{"donor_count": "2-3 adults", "lifespan_years": 6, "bleachable_to": "honey blonde", "characteristics": ["great value", "versatile styling", "multiple draw options"]}'::jsonb,
  87.18,  -- ~£87 (was ₦170,000)
  99.99,
  '{"10": 87.18, "12": 92.31, "14": 97.44, "16": 107.69, "18": 117.95, "20": 128.21, "22": 143.59, "24": 158.97, "26": 174.36}'::jsonb,
  60,
  15,
  TRUE,
  FALSE,
  ARRAY['/products/vip-virgin-loose-wave-1.jpg', '/products/vip-virgin-loose-wave-2.jpg'],
  '/products/vip-virgin-loose-wave-thumb.jpg',
  TRUE,
  FALSE,
  FALSE,
  TRUE,
  FALSE
),

-- Grade D - Virgin Remy Products
(
  'Virgin Remy Straight Bundles',
  'virgin-remy-straight-bundles',
  'Our Virgin Remy Straight Bundles offer excellent quality at an accessible price point. Perfect for those new to luxury hair extensions or looking for everyday wear options. Cuticle-aligned for tangle-free styling.',
  'Budget-friendly virgin remy. Cuticle-aligned. 3-year lifespan.',
  'GRADE_D',
  'CHINA',
  'STRAIGHT',
  'BUNDLES',
  'SINGLE_DRAWN',
  ARRAY[10, 12, 14, 16, 18, 20, 22, 24],
  '{"donor_count": "4+ adults", "lifespan_years": 3, "bleachable_to": "#27", "characteristics": ["budget-friendly", "cuticle-aligned", "everyday wear"]}'::jsonb,
  51.28,  -- ~£51 (was ₦100,000)
  64.99,
  '{"10": 51.28, "12": 56.41, "14": 61.54, "16": 66.67, "18": 76.92, "20": 87.18, "22": 97.44, "24": 112.82}'::jsonb,
  100,
  20,
  TRUE,
  FALSE,
  ARRAY['/products/virgin-remy-straight-1.jpg'],
  '/products/virgin-remy-straight-thumb.jpg',
  TRUE,
  FALSE,
  FALSE,
  FALSE,
  FALSE
),

-- Closures and Frontals
(
  'HD Lace Closure 5x5',
  'hd-lace-closure-5x5',
  'Premium HD lace closure that blends seamlessly with all skin tones. Features pre-plucked hairline with baby hairs for the most natural look. Swiss lace construction ensures durability and comfort.',
  '5x5 HD lace closure. Pre-plucked. Natural hairline.',
  'GRADE_B',
  'VIETNAM',
  'STRAIGHT',
  'CLOSURE',
  NULL,
  ARRAY[10, 12, 14, 16, 18],
  '{"lace_type": "HD Swiss Lace", "size": "5x5", "features": ["pre-plucked", "baby hairs", "bleached knots"]}'::jsonb,
  97.44,  -- ~£97 (was ₦190,000)
  119.99,
  '{"10": 97.44, "12": 107.69, "14": 117.95, "16": 128.21, "18": 138.46}'::jsonb,
  30,
  5,
  TRUE,
  FALSE,
  ARRAY['/products/hd-closure-1.jpg', '/products/hd-closure-2.jpg'],
  '/products/hd-closure-thumb.jpg',
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  FALSE
),
(
  '13x4 HD Lace Frontal',
  '13x4-hd-lace-frontal',
  'Our 13x4 HD Lace Frontal offers ear-to-ear coverage with an undetectable hairline. Perfect for versatile parting and styling. Pre-plucked with natural baby hairs for a flawless finish.',
  '13x4 frontal. Ear-to-ear coverage. HD invisible lace.',
  'GRADE_B',
  'VIETNAM',
  'STRAIGHT',
  'FRONTAL',
  NULL,
  ARRAY[12, 14, 16, 18, 20],
  '{"lace_type": "HD Swiss Lace", "size": "13x4", "features": ["ear-to-ear", "pre-plucked", "bleached knots", "baby hairs"]}'::jsonb,
  153.85,  -- ~£154 (was ₦300,000)
  179.99,
  '{"12": 153.85, "14": 169.23, "16": 184.62, "18": 205.13, "20": 230.77}'::jsonb,
  25,
  5,
  TRUE,
  FALSE,
  ARRAY['/products/hd-frontal-1.jpg'],
  '/products/hd-frontal-thumb.jpg',
  TRUE,
  TRUE,
  FALSE,
  TRUE,
  FALSE
);
