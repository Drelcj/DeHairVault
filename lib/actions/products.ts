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

/**
 * Normalize a slug for consistent matching:
 * - Decode URL encoding (%20 -> space)
 * - Convert to lowercase
 * - Replace spaces and multiple dashes with single dashes
 * - Remove leading/trailing dashes
 */
function normalizeSlug(slug: string): string {
  return decodeURIComponent(slug)
    .toLowerCase()
    .replace(/[\s_]+/g, '-')  // Replace spaces and underscores with dashes
    .replace(/-+/g, '-')       // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, '')   // Remove leading/trailing dashes
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Use service client to bypass RLS for reliable public access
    const supabase = createServiceClient()
    
    // Normalize the incoming slug
    const normalizedSlug = normalizeSlug(slug)
    const decodedSlug = decodeURIComponent(slug)
    
    console.log(`[getProductBySlug] Looking up product with slug: "${slug}"`)
    console.log(`[getProductBySlug] Normalized slug: "${normalizedSlug}"`)
    
    // Strategy 1: Try exact match with normalized slug
    let { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', normalizedSlug)
      .eq('is_active', true)
      .single()

    if (!data && !error?.message?.includes('multiple')) {
      // Strategy 2: Try with decoded but non-normalized slug (for legacy data)
      const result = await supabase
        .from('products')
        .select('*')
        .eq('slug', decodedSlug)
        .eq('is_active', true)
        .single()
      
      data = result.data
      error = result.error
    }

    if (!data && !error?.message?.includes('multiple')) {
      // Strategy 3: Case-insensitive match using ilike
      const result = await supabase
        .from('products')
        .select('*')
        .ilike('slug', normalizedSlug)
        .eq('is_active', true)
        .single()
      
      data = result.data
      error = result.error
    }

    if (!data && !error?.message?.includes('multiple')) {
      // Strategy 4: Try matching with original slug (mixed case with spaces)
      const result = await supabase
        .from('products')
        .select('*')
        .ilike('slug', decodedSlug.replace(/ /g, '%'))  // Allow spaces to match anything
        .eq('is_active', true)
        .single()
      
      data = result.data
      error = result.error
    }

    if (error && !error.message?.includes('0 rows')) {
      console.error('[getProductBySlug] Error fetching product by slug:', error.message, { slug, normalizedSlug })
      return null
    }

    if (data) {
      console.log(`[getProductBySlug] Found product: ${data.name}`)
    } else {
      console.log(`[getProductBySlug] No product found for slug: "${slug}"`)
    }
    
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

/**
 * Get related products based on same category or texture, excluding current product
 */
export async function getRelatedProducts(
  currentProductId: string,
  category: string,
  texture: string,
  limit: number = 4
): Promise<Product[]> {
  try {
    const supabase = createServiceClient()
    
    // First try to get products with same category
    const { data: sameCategoryProducts, error: categoryError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .neq('id', currentProductId)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (categoryError) {
      console.error('[getRelatedProducts] Error:', categoryError.message)
      return []
    }

    let relatedProducts = sameCategoryProducts || []

    // If we don't have enough, try same texture
    if (relatedProducts.length < limit) {
      const existingIds = relatedProducts.map(p => p.id)
      let textureQuery = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('texture', texture)
        .neq('id', currentProductId)
        .order('is_featured', { ascending: false })
        .limit(limit - relatedProducts.length)

      // Only add the NOT IN filter if we have existing IDs
      if (existingIds.length > 0) {
        textureQuery = textureQuery.not('id', 'in', `(${existingIds.join(',')})`)
      }

      const { data: sameTextureProducts } = await textureQuery

      if (sameTextureProducts) {
        relatedProducts = [...relatedProducts, ...sameTextureProducts]
      }
    }

    // If still not enough, get any other products
    if (relatedProducts.length < limit) {
      const existingIds = relatedProducts.map(p => p.id)
      let otherQuery = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .neq('id', currentProductId)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit - relatedProducts.length)

      // Only add the NOT IN filter if we have existing IDs
      if (existingIds.length > 0) {
        otherQuery = otherQuery.not('id', 'in', `(${existingIds.join(',')})`)
      }

      const { data: otherProducts } = await otherQuery

      if (otherProducts) {
        relatedProducts = [...relatedProducts, ...otherProducts]
      }
    }

    console.log(`[getRelatedProducts] Found ${relatedProducts.length} related products`)
    return relatedProducts
  } catch (error) {
    console.error('[getRelatedProducts] Error:', error)
    return []
  }
}

/**
 * Delete a product by ID (admin only)
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Check admin role
    const serviceClient = createServiceClient()
    const { data: roleData } = await serviceClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!roleData || !['ADMIN', 'SUPER_ADMIN'].includes(roleData.role)) {
      return { success: false, error: 'Forbidden - Admin access required' }
    }
    
    // Delete the product (cascade will handle variants)
    const { error: deleteError } = await serviceClient
      .from('products')
      .delete()
      .eq('id', productId)
    
    if (deleteError) {
      console.error('[deleteProduct] Error:', deleteError)
      return { success: false, error: deleteError.message }
    }
    
    console.log(`[deleteProduct] Successfully deleted product: ${productId}`)
    return { success: true }
  } catch (error) {
    console.error('[deleteProduct] Error:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}
