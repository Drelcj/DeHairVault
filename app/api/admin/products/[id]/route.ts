import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/admin/products/:id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).single<{ role: string | null }>()
  if (!roleRow || roleRow.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', params.id)

  return NextResponse.json({ product, variants: variants || [] })
}

// PATCH /api/admin/products/:id
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).single<{ role: string | null }>()
  if (!roleRow || roleRow.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { name, description, price_ngn, category, sku, stock_quantity, is_available } = body ?? {}

  const updatePayload: Record<string, any> = {}
  if (name !== undefined) updatePayload.name = name
  if (description !== undefined) updatePayload.description = description
  if (price_ngn !== undefined) updatePayload.price_ngn = price_ngn
  if (category !== undefined) updatePayload.category = category
  if (sku !== undefined) updatePayload.sku = sku
  if (stock_quantity !== undefined) updatePayload.stock_quantity = stock_quantity
  if (is_available !== undefined) updatePayload.is_available = is_available

  const serviceClient = createServiceClient()
  const { error: updateError } = await (serviceClient as any)
    .from('products')
    .update(updatePayload)
    .eq('id', params.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  const logPayload: Record<string, any> = {
    admin_id: user.id,
    action: 'UPDATE_PRODUCT',
    resource_type: 'product',
    resource_id: params.id,
    changes: updatePayload,
  }

  await (serviceClient as any).from('admin_activity_log').insert(logPayload)

  const { data: updated } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  return NextResponse.json({ product: updated })
}
