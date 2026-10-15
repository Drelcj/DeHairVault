import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { appendAdminNote } from '@/lib/admin/order-metrics'
import { VALID_TRANSITIONS, isHistoricalOrder, transitionMovesStock } from '@/lib/admin/order-transitions'
import type { Database } from '@/types/database.types'

type OrderUpdate = Database['public']['Tables']['orders']['Update']

// POST /api/admin/orders/:id/status
// Changes the status and/or appends an admin note. Notes are never overwritten.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use service client for role check
  const serviceClient = createServiceClient()
  const { data: roleRow } = await serviceClient.from('users').select('role').eq('id', user.id).single<{ role: string | null }>()
  if (!roleRow || !['ADMIN', 'SUPER_ADMIN'].includes(roleRow.role || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const { status, tracking_number, tracking_url } = body ?? {}
  const note: string = typeof body?.admin_note === 'string' ? body.admin_note.trim() : ''

  const { data: order, error: fetchError } = await serviceClient
    .from('orders')
    .select('status, admin_notes, created_at')
    .eq('id', id)
    .maybeSingle()
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const currentStatus = order.status ?? 'PENDING'
  const isStatusChange = typeof status === 'string' && status !== '' && status !== currentStatus
  if (!isStatusChange && !note) {
    return NextResponse.json({ error: 'Nothing to update: choose a new status or write a note' }, { status: 400 })
  }

  const updatePayload: OrderUpdate = { updated_at: new Date().toISOString() }

  if (isStatusChange) {
    if (!(VALID_TRANSITIONS[currentStatus] ?? []).includes(status)) {
      return NextResponse.json({ error: `Can't move an order from ${currentStatus} to ${status}` }, { status: 400 })
    }
    // The stock trigger would adjust variant stock for this move. Orders from before stock was
    // reconciled already happened against today's stock numbers, so they must not move it.
    if (isHistoricalOrder(order.created_at) && transitionMovesStock(currentStatus, status)) {
      return NextResponse.json(
        {
          error: `This order predates stock reconciliation. Moving it from ${currentStatus} to ${status} would change stock levels, so it is blocked. Ask a developer to correct it directly.`,
        },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    updatePayload.status = status as OrderUpdate['status']
    if (status === 'SHIPPED') updatePayload.shipped_at = now
    if (status === 'DELIVERED') updatePayload.delivered_at = now
    if (status === 'CANCELLED') updatePayload.cancelled_at = now
  }
  if (tracking_number) updatePayload.tracking_number = tracking_number
  if (tracking_url) updatePayload.tracking_url = tracking_url
  if (note) updatePayload.admin_notes = appendAdminNote(order.admin_notes, note, user.email ?? user.id)

  const { error } = await serviceClient
    .from('orders')
    .update(updatePayload)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: logError } = await serviceClient.from('admin_activity_log').insert({
    admin_id: user.id,
    action: isStatusChange ? 'UPDATE_ORDER_STATUS' : 'ADD_ORDER_NOTE',
    entity_type: 'order',
    entity_id: id,
    old_values: { status: currentStatus },
    new_values: { ...updatePayload, admin_notes: note || undefined },
  })
  if (logError) console.error('Failed to write admin activity log:', logError)

  return NextResponse.json({ success: true })
}
