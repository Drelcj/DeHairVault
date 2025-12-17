import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/products
// Public endpoint: returns active products with optional filters
export async function GET(request: Request) {
  const url = new URL(request.url)
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const pageSize = Math.min(100, Number(url.searchParams.get('pageSize') || '20'))
  const sort = url.searchParams.get('sort') || 'featured'
  const texture = url.searchParams.get('texture')
  const category = url.searchParams.get('category')
  const grade = url.searchParams.get('grade')
  const origin = url.searchParams.get('origin')
  const minPrice = url.searchParams.get('minPrice')
  const maxPrice = url.searchParams.get('maxPrice')
  const featured = url.searchParams.get('featured')

  const supabase = await createClient()

  // Base query - only active products
  let query = supabase
    .from('products')
    .select('id, name, slug, short_description, grade, origin, texture, category, base_price_ngn, compare_at_price_ngn, available_lengths, images, thumbnail_url, is_featured, is_new_arrival, is_bestseller, stock_quantity, created_at', { count: 'exact' })
    .eq('is_active', true)

  // Apply filters
  if (texture) {
    query = query.eq('texture', texture)
  }
  if (category) {
    query = query.eq('category', category)
  }
  if (grade) {
    query = query.eq('grade', grade)
  }
  if (origin) {
    query = query.eq('origin', origin)
  }
  if (minPrice) {
    query = query.gte('base_price_ngn', Number(minPrice))
  }
  if (maxPrice) {
    query = query.lte('base_price_ngn', Number(maxPrice))
  }
  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  // Apply sorting
  switch (sort) {
    case 'price-low':
      query = query.order('base_price_ngn', { ascending: true })
      break
    case 'price-high':
      query = query.order('base_price_ngn', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'featured':
    default:
      // Featured products first, then by created_at
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
      break
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data: products, error, count } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    products: products ?? [],
    pagination: {
      page,
      per_page: pageSize,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / pageSize),
    },
  })
}
