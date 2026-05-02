/**
 * app.types.ts — Convenience type aliases over the auto-generated Database type.
 *
 * DO NOT put hand-written logic here. All types derive directly from
 * Database["public"]["Tables"]["..."]["Row"] or Database["public"]["Enums"]["..."]
 * so they stay in sync every time `supabase gen types typescript` is re-run.
 *
 * Import from this file instead of directly from database.types.ts.
 * The Supabase client files are the only ones that should import `Database` directly.
 */

import { Constants, type Database } from './database.types'

// ── Table row / insert / update types ────────────────────────────────────────

export type Product            = Database['public']['Tables']['products']['Row']
export type ProductInsert      = Database['public']['Tables']['products']['Insert']
export type ProductUpdate      = Database['public']['Tables']['products']['Update']

export type ProductVariant       = Database['public']['Tables']['product_variants']['Row']
export type ProductVariantInsert = Database['public']['Tables']['product_variants']['Insert']
export type ProductVariantUpdate = Database['public']['Tables']['product_variants']['Update']

export type Cart       = Database['public']['Tables']['carts']['Row']
export type CartInsert = Database['public']['Tables']['carts']['Insert']
export type CartUpdate = Database['public']['Tables']['carts']['Update']

export type CartItem       = Database['public']['Tables']['cart_items']['Row']
export type CartItemInsert = Database['public']['Tables']['cart_items']['Insert']
export type CartItemUpdate = Database['public']['Tables']['cart_items']['Update']

export type Order       = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type OrderItem       = Database['public']['Tables']['order_items']['Row']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update']

export type ExchangeRate       = Database['public']['Tables']['exchange_rates']['Row']
export type ExchangeRateInsert = Database['public']['Tables']['exchange_rates']['Insert']
export type ExchangeRateUpdate = Database['public']['Tables']['exchange_rates']['Update']

export type ProductWithStock = Database['public']['Views']['v_products_with_stock']['Row']
export type OrderSummary     = Database['public']['Views']['v_order_summary']['Row']

// ── Pure enum types (type-only, no runtime value needed) ─────────────────────

export type HairGrade  = Database['public']['Enums']['hair_grade']
export type HairOrigin = Database['public']['Enums']['hair_origin']
export type HairTexture = Database['public']['Enums']['hair_texture']
export type OrderStatus = Database['public']['Enums']['order_status']
export type OrderType   = Database['public']['Enums']['order_type']
export type UserRole    = Database['public']['Enums']['user_role']

// ── Enum runtime objects ──────────────────────────────────────────────────────
//
// Each block exports BOTH a const object (for value access like HairCategory.BUNDLES)
// AND a type alias (for annotation like field: HairCategory), matching the old enum API
// so no callsites need to change beyond updating the import path.

export const HairCategory = {
  BUNDLES:  'BUNDLES',
  CLOSURE:  'CLOSURE',
  FRONTAL:  'FRONTAL',
  WIG:      'WIG',
  PONYTAIL: 'PONYTAIL',
  CLIP_INS: 'CLIP_INS',
} as const
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type HairCategory = Database['public']['Enums']['hair_category']

export const DrawType = {
  SINGLE_DRAWN:       'SINGLE_DRAWN',
  DOUBLE_DRAWN:       'DOUBLE_DRAWN',
  SUPER_DOUBLE_DRAWN: 'SUPER_DOUBLE_DRAWN',
} as const
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DrawType = Database['public']['Enums']['draw_type']

// ── Known value arrays (used for filter dropdowns / validation) ───────────────

export const KNOWN_HAIR_GRADES   = Constants.public.Enums.hair_grade   as string[]
export const KNOWN_HAIR_TEXTURES = Constants.public.Enums.hair_texture as string[]
export const KNOWN_HAIR_ORIGINS  = Constants.public.Enums.hair_origin  as string[]
