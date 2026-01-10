"use server"

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, ProductFormValues, ProductVariantInput } from '@/types/admin'

function normalizeProductPayload(payload: ProductFormValues) {
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    short_description: payload.short_description,
    features: payload.features || null,
    grade: payload.grade,
    origin: payload.origin,
    texture: payload.texture,
    category: payload.category,
    draw_type: payload.draw_type,
    available_lengths: payload.available_lengths,
    grade_details: null,
    base_price_gbp: payload.base_price_gbp,
    compare_at_price_gbp: payload.compare_at_price_gbp,
    cost_price_gbp: payload.cost_price_gbp,
    length_price_modifiers: payload.length_price_modifiers,
    stock_quantity: payload.stock_quantity,
    low_stock_threshold: payload.low_stock_threshold,
    track_inventory: payload.track_inventory,
    allow_backorder: payload.allow_backorder,
    images: payload.images,
    thumbnail_url: payload.thumbnail_url,
    video_url: payload.video_url,
    video_urls: payload.video_urls || null,
    is_active: payload.is_active,
    is_featured: payload.is_featured,
    is_new_arrival: payload.is_new_arrival,
    is_bestseller: false,
    is_preorder_only: payload.is_preorder_only,
  }
}

async function upsertVariants(productId: string, variants: ProductVariantInput[]) {
  if (!variants.length) return
  const supabase = createServiceClient()
  await supabase
    .from('product_variants')
    .upsert(
      variants.map((variant) => ({
        id: variant.id,
        product_id: productId,
        length: variant.length,
        sku: variant.sku,
        price_override_gbp: variant.price_override_gbp,
        stock_quantity: variant.stock_quantity,
        weight_grams: variant.weight_grams,
      }))
    )
}

export async function createProductAction(payload: ProductFormValues): Promise<ActionResult> {
  const supabase = createServiceClient()
  const productPayload = normalizeProductPayload(payload)

  const { data, error } = await supabase
    .from('products')
    .insert(productPayload)
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message || 'Unable to create product' }
  }

  await upsertVariants(data.id, payload.variants)
  revalidatePath('/admin/products')
  return { success: true, id: data.id, message: 'Product created' }
}

export async function updateProductAction(id: string, payload: ProductFormValues): Promise<ActionResult> {
  const supabase = createServiceClient()
  const productPayload = normalizeProductPayload(payload)

  const { error } = await supabase
    .from('products')
    .update(productPayload)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  await upsertVariants(id, payload.variants)
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}`)
  return { success: true, id, message: 'Product updated' }
}
