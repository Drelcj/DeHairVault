-- DeHair Vault Seed Data
-- This file contains sample data for development and testing

-- ============================================================================
-- EXCHANGE RATES
-- ============================================================================

INSERT INTO exchange_rates (currency_code, rate_to_ngn, symbol, is_active) VALUES
  ('NGN', 1.000000, '₦', TRUE),
  ('USD', 1550.000000, '$', TRUE),
  ('GBP', 1950.000000, '£', TRUE),
  ('EUR', 1680.000000, '€', TRUE),
  ('CAD', 1140.000000, 'C$', TRUE),
  ('GHS', 105.000000, '₵', TRUE);

-- ============================================================================
-- SAMPLE PRODUCTS
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
  base_price_ngn,
  compare_at_price_ngn,
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
  'Our Raw Baby Straight Bundles are sourced from 1-2 children donors, ensuring the highest quality and rarest hair available. This premium grade hair is completely unprocessed, maintaining its natural brown color and exceptional silkiness. With proper care, these bundles can last up to 10 years, making them a true investment piece. Due to the limited availability of this rare hair type, stock is always limited.',
  'Ultra-premium raw baby hair from Vietnam. Lifespan: 10 years. Limited stock.',
  'GRADE_A',
  'VIETNAM',
  'STRAIGHT',
  'BUNDLES',
  'DOUBLE_DRAWN',
  ARRAY[6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
  '{"donor_count": "1-2 children", "lifespan_years": 10, "natural_color": "natural brown", "bleachable": false, "characteristics": ["rare", "limited stock", "ultra-premium", "silkiest texture"]}'::jsonb,
  350000.00,
  450000.00,
  '{"6": 0, "8": 0, "10": 0, "12": 20000, "14": 40000, "16": 60000, "18": 80000, "20": 100000, "22": 120000, "24": 140000, "26": 160000}'::jsonb,
  15,
  3,
  TRUE,
  FALSE,
  ARRAY['https://example.com/images/raw-baby-straight-1.jpg', 'https://example.com/images/raw-baby-straight-2.jpg'],
  'https://example.com/images/raw-baby-straight-thumb.jpg',
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  FALSE
),
(
  'Raw Baby Body Wave Bundles',
  'raw-baby-body-wave-bundles',
  'Sourced from the finest Cambodian donors, our Raw Baby Body Wave Bundles offer a luxurious natural wave pattern that requires minimal styling. These bundles are from 1-2 children donors, ensuring uniform texture and exceptional quality. The hair maintains its natural color and can be heat styled while retaining its wave pattern. With a lifespan of up to 10 years, these bundles represent the pinnacle of hair quality.',
  'Premium raw baby body wave from Cambodia. Natural wave pattern. Lifespan: 10 years.',
  'GRADE_A',
  'CAMBODIA',
  'BODY_WAVE',
  'BUNDLES',
  'DOUBLE_DRAWN',
  ARRAY[8, 10, 12, 14, 16, 18, 20, 22, 24],
  '{"donor_count": "1-2 children", "lifespan_years": 10, "natural_color": "natural brown", "bleachable": false, "characteristics": ["rare", "limited stock", "holds wave pattern", "heat resistant"]}'::jsonb,
  380000.00,
  480000.00,
  '{"8": 0, "10": 0, "12": 20000, "14": 40000, "16": 60000, "18": 90000, "20": 120000, "22": 150000, "24": 180000}'::jsonb,
  12,
  3,
  TRUE,
  FALSE,
  ARRAY['https://example.com/images/raw-baby-bodywave-1.jpg', 'https://example.com/images/raw-baby-bodywave-2.jpg'],
  'https://example.com/images/raw-baby-bodywave-thumb.jpg',
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  FALSE
),

-- Grade B - Single Donor Products
(
  'Single Donor Straight',
  'single-donor-straight',
  'Our Single Donor Straight hair comes from one healthy donor, ensuring consistency in texture, color, and quality throughout all bundles. This Vietnamese hair is completely unprocessed and can be bleached to 613 blonde. With a lifespan of up to 9 years, it offers exceptional value and versatility. Perfect for those who want premium quality with styling flexibility.',
  'Premium single donor Vietnamese straight hair. Bleachable to 613. Lifespan: 9 years.',
  'GRADE_B',
  'VIETNAM',
  'STRAIGHT',
  'BUNDLES',
  'DOUBLE_DRAWN',
  ARRAY[10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
  '{"donor_count": "1 healthy donor", "lifespan_years": 9, "bleachable_to": "613", "natural_color": "natural brown/black", "characteristics": ["consistent texture", "uniform quality", "highly versatile"]}'::jsonb,
  180000.00,
  230000.00,
  '{"10": 0, "12": 0, "14": 15000, "16": 30000, "18": 45000, "20": 60000, "22": 80000, "24": 100000, "26": 120000, "28": 140000, "30": 160000}'::jsonb,
  30,
  5,
  TRUE,
  FALSE,
  ARRAY['https://example.com/images/single-donor-straight-1.jpg', 'https://example.com/images/single-donor-straight-2.jpg'],
  'https://example.com/images/single-donor-straight-thumb.jpg',
  TRUE,
  TRUE,
  FALSE,
  TRUE,
  FALSE
),
(
  'Single Donor Deep Wave',
  'single-donor-deep-wave',
  'Experience the beauty of natural deep waves with our Single Donor Deep Wave bundles from India. Sourced from one healthy donor, these bundles offer consistent wave patterns and exceptional quality. The hair can be bleached to 613 and styled while maintaining its natural wave pattern. With a lifespan of 9 years, these bundles are perfect for creating glamorous, voluminous looks.',
  'Luxurious single donor deep wave from India. Bleachable to 613. Lifespan: 9 years.',
  'GRADE_B',
  'INDIA',
  'DEEP_WAVE',
  'BUNDLES',
  'DOUBLE_DRAWN',
  ARRAY[12, 14, 16, 18, 20, 22, 24, 26, 28],
  '{"donor_count": "1 healthy donor", "lifespan_years": 9, "bleachable_to": "613", "natural_color": "natural black", "characteristics": ["defined waves", "voluminous", "low maintenance"]}'::jsonb,
  200000.00,
  250000.00,
  '{"12": 0, "14": 15000, "16": 30000, "18": 50000, "20": 70000, "22": 90000, "24": 110000, "26": 130000, "28": 150000}'::jsonb,
  25,
  5,
  TRUE,
  FALSE,
  ARRAY['https://example.com/images/single-donor-deepwave-1.jpg', 'https://example.com/images/single-donor-deepwave-2.jpg'],
  'https://example.com/images/single-donor-deepwave-thumb.jpg',
  TRUE,
  FALSE,
  FALSE,
  TRUE,
  FALSE
),

-- Grade C - VIP Virgin Products
(
  'VIP Virgin Body Wave',
  'vip-virgin-body-wave',
  'Our VIP Virgin Body Wave bundles from the Philippines offer the perfect balance of quality and affordability. Sourced from 2-3 healthy donors, these bundles provide a natural body wave pattern that is easy to maintain. The hair can be bleached to honey blonde and is available in both double drawn and super double drawn options. With a 6-year lifespan, this is an excellent choice for those seeking quality virgin hair.',
  'Premium VIP virgin body wave from Philippines. Bleachable to honey blonde. Lifespan: 6 years.',
  'GRADE_C',
  'PHILIPPINES',
  'BODY_WAVE',
  'BUNDLES',
  'DOUBLE_DRAWN',
  ARRAY[10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32],
  '{"donor_count": "2-3 donors", "lifespan_years": 6, "bleachable_to": "honey blonde", "natural_color": "natural brown", "draw_options": ["double drawn", "super double drawn"], "characteristics": ["natural shine", "soft texture", "tangle-free"]}'::jsonb,
  120000.00,
  160000.00,
  '{"10": 0, "12": 0, "14": 10000, "16": 20000, "18": 30000, "20": 45000, "22": 60000, "24": 75000, "26": 90000, "28": 105000, "30": 120000, "32": 135000}'::jsonb,
  50,
  8,
  TRUE,
  TRUE,
  ARRAY['https://example.com/images/vip-virgin-bodywave-1.jpg', 'https://example.com/images/vip-virgin-bodywave-2.jpg'],
  'https://example.com/images/vip-virgin-bodywave-thumb.jpg',
  TRUE,
  TRUE,
  FALSE,
  FALSE,
  FALSE
),
(
  'VIP Virgin Loose Wave',
  'vip-virgin-loose-wave',
  'Discover the elegance of our VIP Virgin Loose Wave bundles from Burma. Featuring a soft, romantic wave pattern, these bundles from 2-3 donors offer consistent quality and beautiful movement. The hair can be bleached to honey blonde and is available in multiple draw types for customization. Perfect for creating effortless, glamorous styles with a 6-year lifespan.',
  'Beautiful VIP virgin loose wave from Burma. Bleachable to honey blonde. Lifespan: 6 years.',
  'GRADE_C',
  'BURMA',
  'LOOSE_WAVE',
  'BUNDLES',
  'DOUBLE_DRAWN',
  ARRAY[12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
  '{"donor_count": "2-3 donors", "lifespan_years": 6, "bleachable_to": "honey blonde", "natural_color": "natural brown/black", "draw_options": ["double drawn", "super double drawn"], "characteristics": ["romantic waves", "lightweight", "minimal shedding"]}'::jsonb,
  130000.00,
  170000.00,
  '{"12": 0, "14": 10000, "16": 20000, "18": 35000, "20": 50000, "22": 65000, "24": 80000, "26": 95000, "28": 110000, "30": 125000}'::jsonb,
  45,
  8,
  TRUE,
  TRUE,
  ARRAY['https://example.com/images/vip-virgin-loosewave-1.jpg', 'https://example.com/images/vip-virgin-loosewave-2.jpg'],
  'https://example.com/images/vip-virgin-loosewave-thumb.jpg',
  TRUE,
  FALSE,
  TRUE,
  FALSE,
  FALSE
),

-- Grade D - Regular Virgin/Remy Products
(
  'Virgin Remy Straight',
  'virgin-remy-straight',
  'Our Virgin Remy Straight bundles from China provide excellent quality at an affordable price point. Sourced from 4+ donors and carefully processed to maintain cuticle alignment, these bundles offer a sleek, straight texture. The hair can be bleached to #27 and provides 3 years of beautiful wear. Perfect for those seeking quality hair on a budget.',
  'Budget-friendly virgin remy straight from China. Bleachable to #27. Lifespan: 3 years.',
  'GRADE_D',
  'CHINA',
  'STRAIGHT',
  'BUNDLES',
  'SINGLE_DRAWN',
  ARRAY[10, 12, 14, 16, 18, 20, 22, 24, 26, 28],
  '{"donor_count": "4+ donors", "lifespan_years": 3, "bleachable_to": "#27", "natural_color": "natural black", "characteristics": ["budget-friendly", "cuticle aligned", "good value"]}'::jsonb,
  55000.00,
  75000.00,
  '{"10": 0, "12": 0, "14": 5000, "16": 10000, "18": 15000, "20": 22000, "22": 30000, "24": 38000, "26": 46000, "28": 54000}'::jsonb,
  80,
  10,
  TRUE,
  TRUE,
  ARRAY['https://example.com/images/virgin-remy-straight-1.jpg', 'https://example.com/images/virgin-remy-straight-2.jpg'],
  'https://example.com/images/virgin-remy-straight-thumb.jpg',
  TRUE,
  FALSE,
  FALSE,
  TRUE,
  FALSE
),
(
  'Virgin Remy Water Wave',
  'virgin-remy-water-wave',
  'Our Virgin Remy Water Wave bundles from India feature a beautiful, defined wave pattern at an accessible price. Sourced from 4+ donors, these bundles maintain their wave pattern and offer versatility in styling. The hair can be bleached to #27 and lasts up to 3 years with proper care. Ideal for creating beach waves and textured styles.',
  'Affordable virgin remy water wave from India. Bleachable to #27. Lifespan: 3 years.',
  'GRADE_D',
  'INDIA',
  'WATER_WAVE',
  'BUNDLES',
  'SINGLE_DRAWN',
  ARRAY[12, 14, 16, 18, 20, 22, 24, 26],
  '{"donor_count": "4+ donors", "lifespan_years": 3, "bleachable_to": "#27", "natural_color": "natural black", "characteristics": ["budget-friendly", "defined pattern", "easy styling"]}'::jsonb,
  60000.00,
  80000.00,
  '{"12": 0, "14": 5000, "16": 10000, "18": 17000, "20": 24000, "22": 32000, "24": 40000, "26": 48000}'::jsonb,
  70,
  10,
  TRUE,
  TRUE,
  ARRAY['https://example.com/images/virgin-remy-waterwave-1.jpg', 'https://example.com/images/virgin-remy-waterwave-2.jpg'],
  'https://example.com/images/virgin-remy-waterwave-thumb.jpg',
  TRUE,
  FALSE,
  FALSE,
  FALSE,
  FALSE
);

-- ============================================================================
-- SAMPLE PRODUCT VARIANTS
-- ============================================================================

-- Create variants for each product's available lengths
-- Raw Baby Straight Bundles variants (6" - 26")
INSERT INTO product_variants (product_id, length, sku, stock_quantity, weight_grams)
SELECT 
  p.id,
  length,
  'RBS-' || length || '-' || SUBSTRING(p.id::TEXT, 1, 8),
  CASE 
    WHEN length <= 12 THEN 3
    WHEN length <= 18 THEN 2
    ELSE 1
  END,
  length * 10 + 50
FROM products p, UNNEST(p.available_lengths) AS length
WHERE p.slug = 'raw-baby-straight-bundles';

-- Raw Baby Body Wave Bundles variants (8" - 24")
INSERT INTO product_variants (product_id, length, sku, stock_quantity, weight_grams)
SELECT 
  p.id,
  length,
  'RBBW-' || length || '-' || SUBSTRING(p.id::TEXT, 1, 8),
  CASE 
    WHEN length <= 12 THEN 3
    WHEN length <= 18 THEN 2
    ELSE 1
  END,
  length * 10 + 60
FROM products p, UNNEST(p.available_lengths) AS length
WHERE p.slug = 'raw-baby-body-wave-bundles';

-- Single Donor Straight variants (10" - 30")
INSERT INTO product_variants (product_id, length, sku, stock_quantity, weight_grams)
SELECT 
  p.id,
  length,
  'SDS-' || length || '-' || SUBSTRING(p.id::TEXT, 1, 8),
  CASE 
    WHEN length <= 16 THEN 6
    WHEN length <= 24 THEN 4
    ELSE 2
  END,
  length * 10 + 50
FROM products p, UNNEST(p.available_lengths) AS length
WHERE p.slug = 'single-donor-straight';

-- Single Donor Deep Wave variants (12" - 28")
INSERT INTO product_variants (product_id, length, sku, stock_quantity, weight_grams)
SELECT 
  p.id,
  length,
  'SDDW-' || length || '-' || SUBSTRING(p.id::TEXT, 1, 8),
  CASE 
    WHEN length <= 16 THEN 5
    WHEN length <= 24 THEN 3
    ELSE 2
  END,
  length * 10 + 60
FROM products p, UNNEST(p.available_lengths) AS length
WHERE p.slug = 'single-donor-deep-wave';

-- VIP Virgin Body Wave variants (10" - 32")
INSERT INTO product_variants (product_id, length, sku, stock_quantity, weight_grams)
SELECT 
  p.id,
  length,
  'VVBW-' || length || '-' || SUBSTRING(p.id::TEXT, 1, 8),
  CASE 
    WHEN length <= 18 THEN 10
    WHEN length <= 26 THEN 6
    ELSE 3
  END,
  length * 10 + 55
FROM products p, UNNEST(p.available_lengths) AS length
WHERE p.slug = 'vip-virgin-body-wave';

-- VIP Virgin Loose Wave variants (12" - 30")
INSERT INTO product_variants (product_id, length, sku, stock_quantity, weight_grams)
SELECT 
  p.id,
  length,
  'VVLW-' || length || '-' || SUBSTRING(p.id::TEXT, 1, 8),
  CASE 
    WHEN length <= 18 THEN 9
    WHEN length <= 26 THEN 5
    ELSE 3
  END,
  length * 10 + 55
FROM products p, UNNEST(p.available_lengths) AS length
WHERE p.slug = 'vip-virgin-loose-wave';

-- Virgin Remy Straight variants (10" - 28")
INSERT INTO product_variants (product_id, length, sku, stock_quantity, weight_grams)
SELECT 
  p.id,
  length,
  'VRS-' || length || '-' || SUBSTRING(p.id::TEXT, 1, 8),
  CASE 
    WHEN length <= 18 THEN 16
    WHEN length <= 24 THEN 10
    ELSE 6
  END,
  length * 10 + 50
FROM products p, UNNEST(p.available_lengths) AS length
WHERE p.slug = 'virgin-remy-straight';

-- Virgin Remy Water Wave variants (12" - 26")
INSERT INTO product_variants (product_id, length, sku, stock_quantity, weight_grams)
SELECT 
  p.id,
  length,
  'VRWW-' || length || '-' || SUBSTRING(p.id::TEXT, 1, 8),
  CASE 
    WHEN length <= 18 THEN 14
    WHEN length <= 24 THEN 8
    ELSE 5
  END,
  length * 10 + 60
FROM products p, UNNEST(p.available_lengths) AS length
WHERE p.slug = 'virgin-remy-water-wave';

-- ============================================================================
-- SAMPLE COUPONS
-- ============================================================================

INSERT INTO coupons (
  code,
  discount_type,
  discount_value,
  minimum_order_ngn,
  maximum_discount_ngn,
  usage_limit,
  usage_limit_per_user,
  applicable_grades,
  applicable_categories,
  starts_at,
  expires_at,
  is_active
) VALUES
(
  'WELCOME10',
  'percentage',
  10.00,
  100000.00,
  50000.00,
  1000,
  1,
  NULL,
  NULL,
  NOW(),
  NOW() + INTERVAL '30 days',
  TRUE
),
(
  'PREMIUM20',
  'percentage',
  20.00,
  300000.00,
  100000.00,
  500,
  2,
  ARRAY['GRADE_A', 'GRADE_B']::hair_grade[],
  NULL,
  NOW(),
  NOW() + INTERVAL '60 days',
  TRUE
),
(
  'BUNDLE50K',
  'fixed',
  50000.00,
  200000.00,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY['BUNDLES']::hair_category[],
  NOW(),
  NOW() + INTERVAL '90 days',
  TRUE
);
