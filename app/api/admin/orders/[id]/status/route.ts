import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

// POST /api/admin/orders/:id/status
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).single<{ role: string | null }>()
  if (!roleRow || (roleRow.role !== 'ADMIN' && roleRow.role !== 'SUPER_ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { status, tracking_number, tracking_url, admin_notes } = body ?? {}
  if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 })

  const serviceClient = await createServiceClient()
  const updatePayload: {
    status: string
    tracking_number?: string
    tracking_url?: string
    admin_notes?: string
  } = { status }
  if (tracking_number) updatePayload.tracking_number = tracking_number
  if (tracking_url) updatePayload.tracking_url = tracking_url
  if (admin_notes) updatePayload.admin_notes = admin_notes

  const { error } = await (serviceClient as any)
    .from('orders')
    .update(updatePayload)
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const logPayload: Record<string, any> = {
    admin_id: user.id,
    action: 'UPDATE_ORDER_STATUS',
    resource_type: 'order',
    resource_id: params.id,
    changes: updatePayload,
  }

  await (serviceClient as any).from('admin_activity_log').insert(logPayload)

  return NextResponse.json({ success: true })
}
