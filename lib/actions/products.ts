'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
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
    // Use service client to bypass RLS for reliable public access
    const supabase = createServiceClient()
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase environment variables not configured')
      return []
    }
    
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

    // Apply price range filter (GBP)
    if (filters?.minPrice !== undefined) {
      query = query.gte('base_price_gbp', filters.minPrice)
    }
    if (filters?.maxPrice !== undefined) {
      query = query.lte('base_price_gbp', filters.maxPrice)
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

    // Apply length filter (done server-side as array filtering requires post-query processing)
    let products = data || []
    if (filters?.lengths && filters.lengths.length > 0) {
      products = products.filter((product) => {
        return filters.lengths!.some((length) => product.available_lengths.includes(length))
      })
    }

    console.log(`Fetched ${products.length} products from database`)
    return products
  } catch (error) {
    console.error('Error in getProducts:', error)
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Use service client to bypass RLS for reliable public access
    const supabase = createServiceClient()
    
    console.log(`[getProductBySlug] Looking up product with slug: ${slug}`)
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('[getProductBySlug] Error fetching product by slug:', error.message, { slug })
      return null
    }

    console.log(`[getProductBySlug] Found product: ${data?.name}`)
    return data
  } catch (error) {
    console.error('[getProductBySlug] Error in getProductBySlug:', error)
    return null
  }
}

export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  try {
    // Use service client to bypass RLS for reliable public access
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[getFeaturedProducts] Error fetching featured products:', error.message)
      return []
    }

    console.log(`[getFeaturedProducts] Found ${data?.length || 0} featured products`)
    return data || []
  } catch (error) {
    console.error('[getFeaturedProducts] Error in getFeaturedProducts:', error)
    return []
  }
}
