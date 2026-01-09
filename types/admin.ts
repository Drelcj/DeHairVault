// Admin-specific shared types
// Values used by admin product create/edit flows

import type { DrawType, HairCategory, HairGrade, HairOrigin, HairTexture } from './database.types'

export interface ProductVariantInput {
  id?: string
  length: number
  sku: string
  price_override_gbp: number | null
  stock_quantity: number
  weight_grams: number | null
}

export interface ProductFormValues {
  id?: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  features: string[]  // List of product features/highlights
  grade: HairGrade | null  // null = N/A
  origin: HairOrigin
  texture: string  // Changed to string to support custom textures
  category: HairCategory
  draw_type: DrawType | null
  available_lengths: number[]
  base_price_gbp: number
  compare_at_price_gbp: number | null
  cost_price_gbp: number | null
  length_price_modifiers: Record<string, number> | null
  stock_quantity: number
  low_stock_threshold: number
  track_inventory: boolean
  allow_backorder: boolean
  images: string[]
  thumbnail_url: string | null
  video_url: string | null
  is_active: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_preorder_only: boolean
  variants: ProductVariantInput[]
}

export interface ActionResult {
  success: boolean
  message?: string
  error?: string
  id?: string
}
