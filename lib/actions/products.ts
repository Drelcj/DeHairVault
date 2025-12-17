'use server'

import { createClient } from '@/lib/supabase/server'
import type { Product, HairTexture } from '@/types/database.types'

export interface ProductFilters {
  textures?: HairTexture[]
  lengths?: number[]
  minPrice?: number
  maxPrice?: number
  categories?: string[]
  isActive?: boolean
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', filters?.isActive !== undefined ? filters.isActive : true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    // Apply texture filter
    if (filters?.textures && filters.textures.length > 0) {
      query = query.in('texture', filters.textures)
    }

    // Apply price range filter
    if (filters?.minPrice !== undefined) {
      query = query.gte('base_price_ngn', filters.minPrice)
    }
    if (filters?.maxPrice !== undefined) {
      query = query.lte('base_price_ngn', filters.maxPrice)
    }

    // Apply category filter
    if (filters?.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    // Apply length filter (needs to be done client-side as it's an array field)
    let products = data || []
    if (filters?.lengths && filters.lengths.length > 0) {
      products = products.filter((product) => {
        return filters.lengths!.some((length) => product.available_lengths.includes(length))
      })
    }

    return products
  } catch (error) {
    console.error('Error in getProducts:', error)
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching product by slug:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getProductBySlug:', error)
    return null
  }
}
