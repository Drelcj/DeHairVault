import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { appendAdminNote } from '@/lib/admin/order-metrics'
import {
  VALID_TRANSITIONS,
  canMarkDelivered,
  isHistoricalOrder,
  isValidTrackingUrl,
  transitionMovesStock,
} from '@/lib/admin/order-transitions'
import { sendOrderShippedEmail } from '@/lib/email/send-order-emails'
import type { Database } from '@/types/database.types'

type OrderUpdate = Database['public']['Tables']['orders']['Update']

// POST /api/admin/orders/:id/status
// Changes the status and/or appends an admin note. Notes are never overwritten.
// mark_delivered: true moves a paid Confirmed/Processing/Shipped order straight to Delivered.
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
  const markDelivered = body?.mark_delivered === true
  const status: unknown = markDelivered ? 'DELIVERED' : body?.status
  const trackingNumber: string = typeof body?.tracking_number === 'string' ? body.tracking_number.trim() : ''
  const trackingUrl: string = typeof body?.tracking_url === 'string' ? body.tracking_url.trim() : ''
  const note: string = typeof body?.admin_note === 'string' ? body.admin_note.trim() : ''

  if (trackingUrl && !isValidTrackingUrl(trackingUrl)) {
    return NextResponse.json({ error: 'Tracking link must be a full web address starting with https://' }, { status: 400 })
  }

  const { data: order, error: fetchError } = await serviceClient
    .from('orders')
    .select('status, payment_status, admin_notes, created_at, shipped_at')
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
    if (markDelivered) {
      if (!canMarkDelivered(order)) {
        return NextResponse.json(
          { error: `Only paid orders that are Confirmed, Processing or Shipped can be marked delivered (this one is ${currentStatus}, ${order.payment_status ?? 'unpaid'})` },
          { status: 400 }
        )
      }
    } else if (!(VALID_TRANSITIONS[currentStatus] ?? []).includes(status)) {
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
    if (status === 'DELIVERED') {
      updatePayload.delivered_at = now
      // The shortcut skips Shipped, so record a ship date if there isn't one
      if (!order.shipped_at) updatePayload.shipped_at = now
    }
    if (status === 'CANCELLED') updatePayload.cancelled_at = now
  }
  if (trackingNumber) updatePayload.tracking_number = trackingNumber
  if (trackingUrl) updatePayload.tracking_url = trackingUrl
  if (note) updatePayload.admin_notes = appendAdminNote(order.admin_notes, note, user.email ?? user.id)

  // Only update if the status is still what we read. Two saves at once (a double click, two
  // admins) can't both apply the move, so side effects like the shipped email happen once.
  const updateQuery = serviceClient.from('orders').update(updatePayload).eq('id', id)
  const { data: updated, error } = await (order.status === null
    ? updateQuery.is('status', null)
    : updateQuery.eq('status', order.status)
  ).select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!updated || updated.length === 0) {
    return NextResponse.json({ error: 'This order was just changed by someone else. Refresh the page and try again.' }, { status: 409 })
  }

  const { error: logError } = await serviceClient.from('admin_activity_log').insert({
    admin_id: user.id,
    action: !isStatusChange ? 'ADD_ORDER_NOTE' : markDelivered ? 'MARK_ORDER_DELIVERED' : 'UPDATE_ORDER_STATUS',
    entity_type: 'order',
    entity_id: id,
    old_values: { status: currentStatus },
    new_values: { ...updatePayload, admin_notes: note || undefined },
  })
  if (logError) console.error('Failed to write admin activity log:', logError)

  // The Delivered shortcut never sends this: it only goes out on a real move to Shipped
  let shippedEmail: { sent: boolean; error?: string } | undefined
  if (isStatusChange && status === 'SHIPPED') {
    const result = await sendOrderShippedEmail(id)
    shippedEmail = result.ok ? { sent: true } : { sent: false, error: result.error }
  }

  return NextResponse.json({ success: true, shippedEmail })
}
