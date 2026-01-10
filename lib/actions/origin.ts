'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { Product, HairOrigin } from '@/types/database.types'

/**
 * Get products by origin
 */
export async function getProductsByOrigin(origin: HairOrigin): Promise<Product[]> {
  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('origin', origin)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getProductsByOrigin] Error:', error.message)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[getProductsByOrigin] Error:', error)
    return []
  }
}

/**
 * Get product images grouped by origin for the carousel
 */
export async function getOriginProductImages(): Promise<Record<HairOrigin, string[]>> {
  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('origin, thumbnail_url, images')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })

    if (error) {
      console.error('[getOriginProductImages] Error:', error.message)
      return {} as Record<HairOrigin, string[]>
    }

    // Group images by origin
    const imagesByOrigin: Record<string, string[]> = {}
    
    for (const product of data || []) {
      const origin = product.origin as HairOrigin
      if (!imagesByOrigin[origin]) {
        imagesByOrigin[origin] = []
      }
      
      // Get the best image for this product
      const image = product.thumbnail_url || product.images?.[0]
      if (image && !imagesByOrigin[origin].includes(image)) {
        imagesByOrigin[origin].push(image)
      }
    }

    return imagesByOrigin as Record<HairOrigin, string[]>
  } catch (error) {
    console.error('[getOriginProductImages] Error:', error)
    return {} as Record<HairOrigin, string[]>
  }
}

/**
 * Get product count by origin
 */
export async function getOriginProductCounts(): Promise<Record<HairOrigin, number>> {
  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('origin')
      .eq('is_active', true)

    if (error) {
      console.error('[getOriginProductCounts] Error:', error.message)
      return {} as Record<HairOrigin, number>
    }

    // Count products by origin
    const countsByOrigin: Record<string, number> = {}
    
    for (const product of data || []) {
      const origin = product.origin
      countsByOrigin[origin] = (countsByOrigin[origin] || 0) + 1
    }

    return countsByOrigin as Record<HairOrigin, number>
  } catch (error) {
    console.error('[getOriginProductCounts] Error:', error)
    return {} as Record<HairOrigin, number>
  }
}
