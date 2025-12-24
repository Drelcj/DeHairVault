import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// GET /api/admin/orders
// Admin-only: returns paginated orders with optional filters
export async function GET(request: Request) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || '20')
  const status = url.searchParams.get('status')
  const q = url.searchParams.get('q')
  const dateFrom = url.searchParams.get('dateFrom')
  const dateTo = url.searchParams.get('dateTo')
  const sort = url.searchParams.get('sort') || 'created_at:desc'

  const [sortCol, sortDir] = sort.split(':')

  const supabase = await createClient()

  // Auth: require session and ADMIN role
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service client for role check to bypass RLS
  const serviceClient = createServiceClient()
  const { data: roleRow, error: roleErr } = await serviceClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleErr || !roleRow || (roleRow.role !== 'ADMIN' && roleRow.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Base query - use service client for data access
  let query = serviceClient
    .from('orders')
    .select('id, order_number, customer_name, customer_email, total_ngn, status, created_at', { count: 'exact' })

  // Filters
  if (status) query = query.eq('status', status)
  if (q) {
    // naive OR filter via text search on order_number, email, name
    // Supabase supports `or` with filter syntax
    query = query.or(
      `order_number.ilike.%${q}%,customer_email.ilike.%${q}%,customer_name.ilike.%${q}%`
    )
  }
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)

  // Sorting
  query = query.order(sortCol, { ascending: sortDir?.toLowerCase() === 'asc' })

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: data ?? [],
    pagination: {
      page,
      per_page: pageSize,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / pageSize),
    },
  })
}
