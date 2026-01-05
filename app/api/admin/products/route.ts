import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// GET /api/admin/products
// Query params: q (search), sort (created_at:desc, name:asc, price:asc), page, pageSize
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use service client for role check to bypass RLS
  const serviceClient = createServiceClient()
  const { data: roleRow } = await serviceClient.from('users').select('role').eq('id', user.id).single<{ role: string | null }>()
  if (!roleRow || (roleRow.role !== 'ADMIN' && roleRow.role !== 'SUPER_ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const rawQ = url.searchParams.get('q') || ''
  // Sanitize search input: escape special PostgREST/SQL characters
  const q = rawQ.replace(/[%_\\]/g, '\\$&').slice(0, 100)
  const sort = url.searchParams.get('sort') || 'created_at:desc'
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const pageSize = Math.min(100, parseInt(url.searchParams.get('pageSize') || '20'))

  let query = supabase.from('products').select('*', { count: 'exact' })

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  }

  const [field, direction] = sort.split(':')
  if (field && direction) {
    query = query.order(field, { ascending: direction === 'asc' })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const offset = (page - 1) * pageSize
  query = query.range(offset, offset + pageSize - 1)

  const { data: products, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    products: products || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  })
}
