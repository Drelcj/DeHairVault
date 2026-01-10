// Database TypeScript Types for DeHair Vault E-Commerce Platform

// ============================================================================
// ENUMS
// ============================================================================

export enum HairGrade {
  GRADE_A = 'GRADE_A', // Raw Baby
  GRADE_B = 'GRADE_B', // Single Donor
  GRADE_C = 'GRADE_C', // VIP Virgin
  GRADE_D = 'GRADE_D', // Regular Virgin/Remy
  GRADE_E = 'GRADE_E', // Raw Hair
}

export enum HairTexture {
  STRAIGHT = 'STRAIGHT',
  BODY_WAVE = 'BODY_WAVE',
  LOOSE_WAVE = 'LOOSE_WAVE',
  DEEP_WAVE = 'DEEP_WAVE',
  WATER_WAVE = 'WATER_WAVE',
  KINKY_CURLY = 'KINKY_CURLY',
  JERRY_CURL = 'JERRY_CURL',
  LOOSE_DEEP = 'LOOSE_DEEP',
  NATURAL_WAVE = 'NATURAL_WAVE',
}

export enum HairOrigin {
  VIETNAM = 'VIETNAM',
  PHILIPPINES = 'PHILIPPINES',
  INDIA = 'INDIA',
  BURMA = 'BURMA',
  CAMBODIA = 'CAMBODIA',
  CHINA = 'CHINA',
}

export enum HairCategory {
  BUNDLES = 'BUNDLES',
  CLOSURE = 'CLOSURE',
  FRONTAL = 'FRONTAL',
  WIG = 'WIG',
  PONYTAIL = 'PONYTAIL',
  CLIP_INS = 'CLIP_INS',
}

export enum DrawType {
  SINGLE_DRAWN = 'SINGLE_DRAWN',
  DOUBLE_DRAWN = 'DOUBLE_DRAWN',
  SUPER_DOUBLE_DRAWN = 'SUPER_DOUBLE_DRAWN',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum OrderType {
  REGULAR = 'REGULAR',
  PRE_ORDER = 'PRE_ORDER',
  WHOLESALE = 'WHOLESALE',
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  features: string[] | null;
  grade: HairGrade;
  origin: HairOrigin;
  texture: HairTexture;
  category: HairCategory;
  draw_type: DrawType | null;
  available_lengths: number[];
  grade_details: Record<string, any> | null;
  base_price_gbp: number;
  compare_at_price_gbp: number | null;
  cost_price_gbp: number | null;
  length_price_modifiers: Record<string, number> | null;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  images: string[];
  thumbnail_url: string | null;
  video_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_preorder_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  length: number;
  sku: string;
  price_override_gbp: number | null;
  stock_quantity: number;
  weight_grams: number | null;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  selected_length: number | null;
  unit_price_ngn: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  order_type: OrderType;
  status: OrderStatus;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_postal_code: string | null;
  billing_same_as_shipping: boolean;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_country: string | null;
  billing_postal_code: string | null;
  subtotal_ngn: number;
  shipping_cost_ngn: number;
  tax_ngn: number;
  discount_ngn: number;
  total_ngn: number;
  display_currency: string;
  exchange_rate: number;
  total_display_currency: number;
  payment_method: string | null;
  payment_status: string;
  payment_reference: string | null;
  payment_metadata: Record<string, any> | null;
  shipping_method: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_delivery_date: string | null;
  is_preorder: boolean;
  expected_availability_date: string | null;
  coupon_code: string | null;
  coupon_discount_type: string | null;
  coupon_discount_value: number | null;
  customer_notes: string | null;
  admin_notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_grade: HairGrade;
  product_texture: HairTexture;
  product_origin: HairOrigin;
  selected_length: number | null;
  quantity: number;
  unit_price_ngn: number;
  total_price_ngn: number;
  fulfilled_quantity: number;
  product_snapshot: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: string;
  currency_code: string;
  rate_from_gbp: number;
  symbol: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_gbp: number | null;
  maximum_discount_gbp: number | null;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  usage_count: number;
  applicable_grades: HairGrade[] | null;
  applicable_categories: HairCategory[] | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  images: string[] | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  admin_response: string | null;
  admin_responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============================================================================
// INSERT TYPES (without auto-generated fields)
// ============================================================================

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type ProductVariantInsert = Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CartInsert = Omit<Cart, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CartItemInsert = Omit<CartItem, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type OrderInsert = Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'> & {
  id?: string;
  order_number?: string;
};

export type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type ExchangeRateInsert = Omit<ExchangeRate, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CouponInsert = Omit<Coupon, 'id' | 'usage_count' | 'created_at' | 'updated_at'> & {
  id?: string;
  usage_count?: number;
};

export type WishlistInsert = Omit<Wishlist, 'id' | 'created_at'> & {
  id?: string;
};

export type ProductReviewInsert = Omit<ProductReview, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type AdminActivityLogInsert = Omit<AdminActivityLog, 'id' | 'created_at'> & {
  id?: string;
};

// ============================================================================
// UPDATE TYPES (all fields optional except id)
// ============================================================================

export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;
export type ProductUpdate = Partial<Omit<Product, 'id' | 'created_at'>>;
export type ProductVariantUpdate = Partial<Omit<ProductVariant, 'id' | 'created_at'>>;
export type CartUpdate = Partial<Omit<Cart, 'id' | 'created_at'>>;
export type CartItemUpdate = Partial<Omit<CartItem, 'id' | 'created_at'>>;
export type OrderUpdate = Partial<Omit<Order, 'id' | 'order_number' | 'created_at'>>;
export type OrderItemUpdate = Partial<Omit<OrderItem, 'id' | 'created_at'>>;
export type ExchangeRateUpdate = Partial<Omit<ExchangeRate, 'id' | 'created_at'>>;
export type CouponUpdate = Partial<Omit<Coupon, 'id' | 'created_at'>>;
export type ProductReviewUpdate = Partial<Omit<ProductReview, 'id' | 'created_at'>>;

// ============================================================================
// VIEW TYPES
// ============================================================================

export interface ProductWithStock extends Product {
  total_stock: number;
  variant_count: number;
  lowest_price_gbp: number;
  highest_price_gbp: number;
}

export interface OrderSummary {
  date: string;
  total_orders: number;
  total_revenue_ngn: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface GradeDetails {
  donor_count?: string;
  lifespan_years?: number;
  natural_color?: string;
  bleachable?: boolean;
  bleachable_to?: string;
  characteristics?: string[];
  draw_options?: string[];
}

// ============================================================================
// DATABASE HELPER TYPES
// ============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
        Relationships: [];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: ProductVariantInsert;
        Update: ProductVariantUpdate;
        Relationships: [];
      };
      carts: {
        Row: Cart;
        Insert: CartInsert;
        Update: CartUpdate;
        Relationships: [];
      };
      cart_items: {
        Row: CartItem;
        Insert: CartItemInsert;
        Update: CartItemUpdate;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: OrderItemInsert;
        Update: OrderItemUpdate;
        Relationships: [];
      };
      exchange_rates: {
        Row: ExchangeRate;
        Insert: ExchangeRateInsert;
        Update: ExchangeRateUpdate;
        Relationships: [];
      };
      coupons: {
        Row: Coupon;
        Insert: CouponInsert;
        Update: CouponUpdate;
        Relationships: [];
      };
      wishlists: {
        Row: Wishlist;
        Insert: WishlistInsert;
        Update: never;
        Relationships: [];
      };
      product_reviews: {
        Row: ProductReview;
        Insert: ProductReviewInsert;
        Update: ProductReviewUpdate;
        Relationships: [];
      };
      admin_activity_log: {
        Row: AdminActivityLog;
        Insert: AdminActivityLogInsert;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      v_products_with_stock: {
        Row: ProductWithStock;
        Relationships: [];
      };
      v_order_summary: {
        Row: OrderSummary;
        Relationships: [];
      };
    };
    Functions: {
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      calculate_product_price: {
        Args: {
          product_id: string;
          length: number;
        };
        Returns: number;
      };
    };
    Enums: {
      hair_grade: 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'GRADE_D';
      hair_texture: 'STRAIGHT' | 'BODY_WAVE' | 'LOOSE_WAVE' | 'DEEP_WAVE' | 'WATER_WAVE' | 'KINKY_CURLY' | 'JERRY_CURL' | 'LOOSE_DEEP' | 'NATURAL_WAVE';
      hair_origin: 'VIETNAM' | 'PHILIPPINES' | 'INDIA' | 'BURMA' | 'CAMBODIA' | 'CHINA';
      hair_category: 'BUNDLES' | 'CLOSURE' | 'FRONTAL' | 'WIG' | 'PONYTAIL' | 'CLIP_INS';
      draw_type: 'SINGLE_DRAWN' | 'DOUBLE_DRAWN' | 'SUPER_DOUBLE_DRAWN';
      order_status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
      order_type: 'REGULAR' | 'PRE_ORDER' | 'WHOLESALE';
      user_role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
