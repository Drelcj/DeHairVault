-- DeHair Vault E-Commerce Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Initial database setup with all tables, enums, RLS policies, functions, and views

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE hair_grade AS ENUM (
  'GRADE_A', -- Raw Baby
  'GRADE_B', -- Single Donor
  'GRADE_C', -- VIP Virgin
  'GRADE_D'  -- Regular Virgin/Remy
);

CREATE TYPE hair_texture AS ENUM (
  'STRAIGHT',
  'BODY_WAVE',
  'LOOSE_WAVE',
  'DEEP_WAVE',
  'WATER_WAVE',
  'KINKY_CURLY',
  'JERRY_CURL',
  'LOOSE_DEEP',
  'NATURAL_WAVE'
);

CREATE TYPE hair_origin AS ENUM (
  'VIETNAM',
  'PHILIPPINES',
  'INDIA',
  'BURMA',
  'CAMBODIA',
  'CHINA'
);

CREATE TYPE hair_category AS ENUM (
  'BUNDLES',
  'CLOSURE',
  'FRONTAL',
  'WIG',
  'PONYTAIL',
  'CLIP_INS'
);

CREATE TYPE draw_type AS ENUM (
  'SINGLE_DRAWN',
  'DOUBLE_DRAWN',
  'SUPER_DOUBLE_DRAWN'
);

CREATE TYPE order_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
);

CREATE TYPE order_type AS ENUM (
  'REGULAR',
  'PRE_ORDER',
  'WHOLESALE'
);

CREATE TYPE user_role AS ENUM (
  'CUSTOMER',
  'ADMIN',
  'SUPER_ADMIN'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  preferred_currency TEXT NOT NULL DEFAULT 'NGN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  grade hair_grade NOT NULL,
  origin hair_origin NOT NULL,
  texture hair_texture NOT NULL,
  category hair_category NOT NULL,
  draw_type draw_type,
  available_lengths INTEGER[] NOT NULL DEFAULT '{}',
  grade_details JSONB,
  base_price_ngn DECIMAL(12, 2) NOT NULL,
  compare_at_price_ngn DECIMAL(12, 2),
  cost_price_ngn DECIMAL(12, 2),
  length_price_modifiers JSONB DEFAULT '{}',
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  track_inventory BOOLEAN NOT NULL DEFAULT TRUE,
  allow_backorder BOOLEAN NOT NULL DEFAULT FALSE,
  images TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  video_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  is_preorder_only BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Variants Table
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  length INTEGER NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price_override_ngn DECIMAL(12, 2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  weight_grams INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, length)
);

-- Carts Table
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cart_owner_check CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Cart Items Table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  selected_length INTEGER,
  unit_price_ngn DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_type order_type NOT NULL DEFAULT 'REGULAR',
  status order_status NOT NULL DEFAULT 'PENDING',
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  shipping_postal_code TEXT,
  billing_same_as_shipping BOOLEAN NOT NULL DEFAULT TRUE,
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_country TEXT,
  billing_postal_code TEXT,
  subtotal_ngn DECIMAL(12, 2) NOT NULL,
  shipping_cost_ngn DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_ngn DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_ngn DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_ngn DECIMAL(12, 2) NOT NULL,
  display_currency TEXT NOT NULL DEFAULT 'NGN',
  exchange_rate DECIMAL(12, 6) NOT NULL DEFAULT 1.0,
  total_display_currency DECIMAL(12, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  payment_metadata JSONB,
  shipping_method TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  estimated_delivery_date DATE,
  is_preorder BOOLEAN NOT NULL DEFAULT FALSE,
  expected_availability_date DATE,
  coupon_code TEXT,
  coupon_discount_type TEXT,
  coupon_discount_value DECIMAL(12, 2),
  customer_notes TEXT,
  admin_notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_grade hair_grade NOT NULL,
  product_texture hair_texture NOT NULL,
  product_origin hair_origin NOT NULL,
  selected_length INTEGER,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_ngn DECIMAL(12, 2) NOT NULL,
  total_price_ngn DECIMAL(12, 2) NOT NULL,
  fulfilled_quantity INTEGER NOT NULL DEFAULT 0,
  product_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exchange Rates Table
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency_code TEXT UNIQUE NOT NULL,
  rate_to_ngn DECIMAL(12, 6) NOT NULL,
  symbol TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coupons Table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(12, 2) NOT NULL,
  minimum_order_ngn DECIMAL(12, 2),
  maximum_discount_ngn DECIMAL(12, 2),
  usage_limit INTEGER,
  usage_limit_per_user INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  applicable_grades hair_grade[],
  applicable_categories hair_category[],
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wishlists Table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Product Reviews Table
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  images TEXT[],
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  admin_response TEXT,
  admin_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin Activity Log Table
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Products indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_grade ON products(grade);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_texture ON products(texture);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);

-- Product variants indexes
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

-- Cart indexes
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_carts_expires_at ON carts(expires_at);

-- Cart items indexes
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Orders indexes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Reviews indexes
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_is_approved ON product_reviews(is_approved);

-- Wishlists indexes
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Generate Order Number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  sequence_num INTEGER;
  order_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 10) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE order_number LIKE 'DHV-' || year || '-%';
  
  -- Format: DHV-YYYY-XXXXXX
  order_num := 'DHV-' || year || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Product Price with Length Modifier
CREATE OR REPLACE FUNCTION calculate_product_price(
  p_product_id UUID,
  p_length INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
  base_price DECIMAL;
  modifier DECIMAL;
  final_price DECIMAL;
BEGIN
  SELECT 
    base_price_ngn,
    COALESCE((length_price_modifiers->>p_length::TEXT)::DECIMAL, 0)
  INTO base_price, modifier
  FROM products
  WHERE id = p_product_id;
  
  IF base_price IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  final_price := base_price + modifier;
  
  RETURN final_price;
END;
$$ LANGUAGE plpgsql;

-- Function: Update Stock on Order Status Change
CREATE OR REPLACE FUNCTION update_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- When order is cancelled or refunded, restore stock
  IF NEW.status IN ('CANCELLED', 'REFUNDED') AND OLD.status NOT IN ('CANCELLED', 'REFUNDED') THEN
    UPDATE products p
    SET stock_quantity = stock_quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    
    UPDATE product_variants pv
    SET stock_quantity = stock_quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.variant_id = pv.id;
  END IF;
  
  -- When order is confirmed, reduce stock
  IF NEW.status = 'CONFIRMED' AND OLD.status = 'PENDING' THEN
    UPDATE products p
    SET stock_quantity = stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    
    UPDATE product_variants pv
    SET stock_quantity = stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.variant_id = pv.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update Updated At Column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-generate order numbers
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION (
    SELECT generate_order_number() INTO NEW.order_number;
    RETURN NEW;
  );

-- Replace the above trigger with a simpler version
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Update stock on order status changes
CREATE TRIGGER trigger_update_stock_on_order
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_stock_on_order();

-- Update updated_at triggers
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_exchange_rates_updated_at
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Products with Stock Information
CREATE OR REPLACE VIEW v_products_with_stock AS
SELECT 
  p.*,
  COALESCE(SUM(pv.stock_quantity), p.stock_quantity) as total_stock,
  COUNT(pv.id) as variant_count,
  COALESCE(MIN(COALESCE(pv.price_override_ngn, p.base_price_ngn)), p.base_price_ngn) as lowest_price_ngn,
  COALESCE(MAX(COALESCE(pv.price_override_ngn, p.base_price_ngn)), p.base_price_ngn) as highest_price_ngn
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id;

-- View: Order Summary (Daily Statistics)
CREATE OR REPLACE VIEW v_order_summary AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  SUM(total_ngn) as total_revenue_ngn,
  COUNT(*) FILTER (WHERE status = 'PENDING') as pending_orders,
  COUNT(*) FILTER (WHERE status IN ('DELIVERED', 'SHIPPED')) as completed_orders,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_orders
FROM orders
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Users: Users can read/update their own profile
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Products: Public can read active products
CREATE POLICY products_select_public ON products
  FOR SELECT USING (is_active = TRUE);

-- Products: Admins can do everything
CREATE POLICY products_admin_all ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Product Variants: Public can read
CREATE POLICY product_variants_select_public ON product_variants
  FOR SELECT USING (TRUE);

-- Product Variants: Admins can modify
CREATE POLICY product_variants_admin_all ON product_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Carts: Users can manage their own cart
CREATE POLICY carts_manage_own ON carts
  FOR ALL USING (auth.uid() = user_id);

-- Cart Items: Users can manage items in their cart
CREATE POLICY cart_items_manage_own ON cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

-- Orders: Users can view their own orders
CREATE POLICY orders_select_own ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Orders: Users can create orders
CREATE POLICY orders_insert_own ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Orders: Admins can view all orders
CREATE POLICY orders_admin_all ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Order Items: Users can view items in their orders
CREATE POLICY order_items_select_own ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Order Items: Admins can view all
CREATE POLICY order_items_admin_all ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Exchange Rates: Public can read active rates
CREATE POLICY exchange_rates_select_public ON exchange_rates
  FOR SELECT USING (is_active = TRUE);

-- Exchange Rates: Admins can manage
CREATE POLICY exchange_rates_admin_all ON exchange_rates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Coupons: Public can read active coupons
CREATE POLICY coupons_select_public ON coupons
  FOR SELECT USING (is_active = TRUE);

-- Coupons: Admins can manage
CREATE POLICY coupons_admin_all ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Wishlists: Users can manage their own wishlist
CREATE POLICY wishlists_manage_own ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Product Reviews: Public can read approved reviews
CREATE POLICY product_reviews_select_public ON product_reviews
  FOR SELECT USING (is_approved = TRUE);

-- Product Reviews: Users can manage their own reviews
CREATE POLICY product_reviews_manage_own ON product_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Product Reviews: Admins can manage all reviews
CREATE POLICY product_reviews_admin_all ON product_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Admin Activity Log: Only admins can read
CREATE POLICY admin_activity_log_admin_only ON admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Admin Activity Log: Only admins can insert
CREATE POLICY admin_activity_log_admin_insert ON admin_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );
