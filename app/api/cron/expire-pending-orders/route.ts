import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { updateOrderStatus, clearCartAfterOrder } from '@/lib/actions/checkout'
import { closeUnpaidCheckout } from '@/lib/orders/payment-outcomes'
import {
  STALE_PENDING_HOURS,
  STOCK_RECONCILIATION_DATE,
  getPaymentMetadata,
  isTestOrder,
} from '@/lib/admin/order-metrics'
import { OrderStatus } from '@/types/app.types'

// Daily (vercel.json). For every unpaid PENDING order older than 48h, ask the payment provider
// what happened: a payment the webhook missed is recorded as a normal sale, anything else is
// kept as an abandoned checkout (PENDING -> CANCELLED never touches stock).
//
// Orders created before STOCK_RECONCILIATION_DATE are skipped. That backlog is handled by a
// separately approved run, so no historical order can adjust stock from here.

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BATCH_LIMIT = 200

type Outcome = { orderNumber: string; action: 'paid' | 'expired' | 'abandoned' | 'skipped'; detail: string }

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const cutoff = new Date(Date.now() - STALE_PENDING_HOURS * 3600_000).toISOString()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, payment_method, payment_metadata, created_at')
    .eq('status', 'PENDING')
    .or('payment_status.is.null,payment_status.neq.paid')
    .lt('created_at', cutoff)
    .gte('created_at', STOCK_RECONCILIATION_DATE)
    .order('created_at', { ascending: true })
    .limit(BATCH_LIMIT)

  if (error) {
    console.error('[Cron] Failed to load stale orders:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
  const results: Outcome[] = []

  for (const order of orders ?? []) {
    try {
      results.push(await settleStaleOrder(order, stripe))
    } catch (err) {
      // Left PENDING and retried tomorrow
      console.error(`[Cron] Could not settle order ${order.order_number}:`, err)
      results.push({ orderNumber: order.order_number, action: 'skipped', detail: err instanceof Error ? err.message : 'error' })
    }
  }

  const summary = results.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.action]: (acc[r.action] ?? 0) + 1 }), {})
  console.log('[Cron] expire-pending-orders:', summary)
  return NextResponse.json({ checked: results.length, summary, results })
}

async function settleStaleOrder(
  order: { id: string; order_number: string; payment_method: string | null; payment_metadata: unknown; created_at: string | null },
  stripe: Stripe | null
): Promise<Outcome> {
  const meta = getPaymentMetadata({ payment_metadata: order.payment_metadata as never }) ?? {}
  const reason = `No payment after ${STALE_PENDING_HOURS}h`

  // Test-mode checkouts can't be looked up with live keys; they are never sales
  if (isTestOrder({ payment_metadata: order.payment_metadata as never })) {
    return close(order, 'abandoned', `${reason} (test mode)`)
  }

  const sessionId = typeof meta.checkoutSessionId === 'string' ? meta.checkoutSessionId : null
  const paystackReference = typeof meta.paystackReference === 'string' ? meta.paystackReference : null

  if (sessionId) {
    if (!stripe) return { orderNumber: order.order_number, action: 'skipped', detail: 'STRIPE_SECRET_KEY not set' }
    let session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
      const result = await updateOrderStatus(order.id, OrderStatus.CONFIRMED, 'paid', session.payment_intent as string, {
        stripeSessionId: session.id,
        stripePaymentIntent: session.payment_intent,
        amountTotal: session.amount_total,
        currency: session.currency,
        paymentStatus: session.payment_status,
        livemode: session.livemode,
        recoveredByCron: true,
      })
      if (!result.success) throw new Error(result.error || 'Failed to record payment')
      await clearCartAfterOrder(order.id)
      return { orderNumber: order.order_number, action: 'paid', detail: `Stripe session ${session.id} was paid` }
    }

    // Close a still-open session so it can't be paid after we've closed the order
    if (session.status === 'open') session = await stripe.checkout.sessions.expire(sessionId)
    return close(order, session.status === 'expired' ? 'expired' : 'abandoned', `${reason} (Stripe session ${session.status})`)
  }

  if (paystackReference) {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(paystackReference)}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    })
    const body = await res.json().catch(() => null)
    const data = body?.data
    if (!res.ok && res.status !== 400 && res.status !== 404) throw new Error(`Paystack verify failed (${res.status})`)

    if (data?.status === 'success') {
      const result = await updateOrderStatus(order.id, OrderStatus.CONFIRMED, 'paid', paystackReference, {
        paystackReference,
        paystackTransactionId: data.id,
        amount: data.amount / 100,
        currency: data.currency,
        channel: data.channel,
        paidAt: data.paid_at,
        paystackDomain: data.domain,
        livemode: data.domain !== 'test',
        recoveredByCron: true,
      })
      if (!result.success) throw new Error(result.error || 'Failed to record payment')
      await clearCartAfterOrder(order.id)
      return { orderNumber: order.order_number, action: 'paid', detail: `Paystack ${paystackReference} was paid` }
    }
    return close(order, 'abandoned', `${reason} (Paystack status: ${data?.status ?? 'not found'})`)
  }

  return close(order, 'abandoned', `${reason} (checkout never reached the payment provider)`)
}

async function close(order: { id: string; order_number: string }, outcome: 'expired' | 'abandoned', reason: string): Promise<Outcome> {
  const result = await closeUnpaidCheckout(order.id, outcome, reason, { closedBy: 'cron' })
  if (!result.success) throw new Error(result.error || 'Failed to close order')
  return { orderNumber: order.order_number, action: outcome, detail: reason }
}
