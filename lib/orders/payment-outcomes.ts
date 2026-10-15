// Records what happened to a checkout that did not (yet) end in a payment.
// Server-only helpers for the payment routes, webhooks and the stale-order cron.
//
// Unpaid orders are kept as marketing data, never deleted. An expired or abandoned checkout
// moves PENDING -> CANCELLED with payment_status saying why. That is stock-safe: the live
// trg_update_stock_on_order only restores stock when an order leaves CONFIRMED/PROCESSING,
// and a PENDING order never had stock taken. Every update below is guarded on status
// PENDING and an unpaid payment_status, so a paid order is never touched.

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database.types'
import { getPaymentMetadata, type PaymentMetadata } from '@/lib/admin/order-metrics'

type Result = { success: boolean; updated: boolean; error?: string }

async function mergeMetadata(orderId: string, details: PaymentMetadata): Promise<Json> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('orders').select('payment_metadata').eq('id', orderId).maybeSingle()
  const prior = data ? getPaymentMetadata(data) ?? {} : {}
  return { ...prior, ...details } as Json
}

/** Store the provider's session id / reference and test-or-live mode when checkout starts. */
export async function recordCheckoutStarted(orderId: string, details: PaymentMetadata): Promise<Result> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_metadata: await mergeMetadata(orderId, details), updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .or('payment_status.is.null,payment_status.neq.paid')
      .select('id')
    if (error) return { success: false, updated: false, error: error.message }
    return { success: true, updated: (data?.length ?? 0) > 0 }
  } catch (error) {
    console.error('[PaymentOutcome] recordCheckoutStarted failed:', error)
    return { success: false, updated: false, error: 'Failed to record checkout' }
  }
}

/**
 * A payment attempt failed. The order stays PENDING so the customer can retry in the same
 * checkout; it becomes abandoned when the session expires or the cron finds it stale.
 */
export async function recordPaymentFailed(orderId: string, details: PaymentMetadata): Promise<Result> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        payment_metadata: await mergeMetadata(orderId, { ...details, failedAt: new Date().toISOString() }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'PENDING')
      .or('payment_status.is.null,payment_status.neq.paid')
      .select('id')
    if (error) return { success: false, updated: false, error: error.message }
    revalidatePath('/admin/orders')
    return { success: true, updated: (data?.length ?? 0) > 0 }
  } catch (error) {
    console.error('[PaymentOutcome] recordPaymentFailed failed:', error)
    return { success: false, updated: false, error: 'Failed to record payment failure' }
  }
}

/**
 * Close an unpaid checkout: the provider session expired, or it sat unpaid past the stale
 * window. A previously failed payment keeps 'failed' as its outcome.
 */
export async function closeUnpaidCheckout(
  orderId: string,
  outcome: 'expired' | 'abandoned',
  reason: string,
  details: PaymentMetadata = {}
): Promise<Result> {
  try {
    const supabase = createServiceClient()
    const { data: current } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('id', orderId)
      .maybeSingle()
    const paymentStatus = current?.payment_status === 'failed' ? 'failed' : outcome
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'CANCELLED',
        payment_status: paymentStatus,
        cancellation_reason: reason,
        cancelled_at: now,
        payment_metadata: await mergeMetadata(orderId, { ...details, closedAt: now, closedAs: outcome }),
        updated_at: now,
      })
      .eq('id', orderId)
      .eq('status', 'PENDING')
      .or('payment_status.is.null,payment_status.neq.paid')
      .select('id')
    if (error) return { success: false, updated: false, error: error.message }
    revalidatePath('/admin/orders')
    return { success: true, updated: (data?.length ?? 0) > 0 }
  } catch (error) {
    console.error('[PaymentOutcome] closeUnpaidCheckout failed:', error)
    return { success: false, updated: false, error: 'Failed to close checkout' }
  }
}
