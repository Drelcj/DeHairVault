import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/orders/:id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!roleRow || roleRow.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: items } = await supabase
    .from('order_items')
    .select('id, product_name, selected_length, quantity, unit_price_ngn, total_price_ngn')
    .eq('order_id', params.id)

  return NextResponse.json({ order, items: items ?? [] })
}

// PATCH /api/admin/orders/:id (admin notes)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!roleRow || roleRow.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { admin_notes } = body ?? {}

  const { error } = await supabase.from('orders').update({ admin_notes }).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // log activity (best-effort)
  await supabase.from('admin_activity_log').insert({
    admin_id: user.id,
    action: 'UPDATE_ORDER_NOTES',
    resource_type: 'order',
    resource_id: params.id,
    changes: { admin_notes },
  })

  return NextResponse.json({ success: true })
}
