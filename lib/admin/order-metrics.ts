// Pure helpers the admin pages use to read orders the way the payment providers saw them.
// No Supabase access here, so they can be unit tested and used from server or client code.

import type { Json } from '@/types/database.types'

export type PaymentMetadata = Record<string, unknown>

type OrderPaymentFields = {
  payment_metadata: Json | null
  payment_reference?: string | null
}

// Unpaid orders are kept as marketing data. Their payment_status says what happened to them.
export const UNPAID_OUTCOMES = ['pending', 'failed', 'expired', 'abandoned'] as const
export type UnpaidOutcome = (typeof UNPAID_OUTCOMES)[number]

// Pending checkouts older than this are treated as abandoned (dashboard + daily cron).
export const STALE_PENDING_HOURS = 48

// Stock is reconciled from this date onward: orders created before it are never used to
// adjust stock, and the cron leaves older Pending orders to the approved backlog run.
export const STOCK_RECONCILIATION_DATE = '2026-10-15T00:00:00Z'

export function getPaymentMetadata(order: OrderPaymentFields): PaymentMetadata | null {
  const meta = order.payment_metadata
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) return meta as PaymentMetadata
  return null
}

/**
 * True when the order was placed against a provider's test mode: a Stripe cs_test_ session,
 * livemode false, or a Paystack transaction on the test domain.
 */
export function isTestOrder(order: OrderPaymentFields): boolean {
  const meta = getPaymentMetadata(order)
  if (!meta) return false
  if (meta.livemode === false) return true
  if (meta.paystackDomain === 'test') return true
  const sessionIds = [meta.stripeSessionId, meta.checkoutSessionId]
  return sessionIds.some((id) => typeof id === 'string' && id.startsWith('cs_test_'))
}

/**
 * What the provider actually charged, as recorded by the webhook / verify route.
 * Stripe reports minor units (amountTotal); Paystack is stored in major units (amount).
 * Returns null when there is no provider record, never a figure derived from total_ngn.
 */
export function getChargedAmount(order: OrderPaymentFields): { amount: number; currency: string } | null {
  const meta = getPaymentMetadata(order)
  if (!meta || typeof meta.currency !== 'string') return null
  const currency = meta.currency.toUpperCase()
  if (typeof meta.amountTotal === 'number') return { amount: meta.amountTotal / 100, currency }
  if (typeof meta.amount === 'number') return { amount: meta.amount, currency }
  return null
}

/** Sum charged amounts per currency, e.g. { GBP: 1360, NGN: 450000 }. */
export function sumChargedByCurrency(orders: OrderPaymentFields[]): {
  totals: Record<string, number>
  missing: number
} {
  const totals: Record<string, number> = {}
  let missing = 0
  for (const order of orders) {
    const charged = getChargedAmount(order)
    if (!charged) {
      missing += 1
      continue
    }
    totals[charged.currency] = (totals[charged.currency] ?? 0) + charged.amount
  }
  return { totals, missing }
}

export function getPaymentProvider(order: OrderPaymentFields & { payment_method?: string | null }): 'stripe' | 'paystack' | null {
  const meta = getPaymentMetadata(order)
  if (meta?.stripeSessionId || meta?.stripePaymentIntent || meta?.checkoutSessionId) return 'stripe'
  if (meta?.paystackReference) return 'paystack'
  if (order.payment_method === 'stripe' || order.payment_method === 'paystack') return order.payment_method
  return null
}

/** The provider reference an admin can search for: payment intent, session id or Paystack reference. */
export function getPaymentReference(order: OrderPaymentFields): string | null {
  if (order.payment_reference) return order.payment_reference
  const meta = getPaymentMetadata(order)
  for (const key of ['stripePaymentIntent', 'stripeSessionId', 'checkoutSessionId', 'paystackReference']) {
    const value = meta?.[key]
    if (typeof value === 'string' && value) return value
  }
  return null
}

export function isPaid(order: { payment_status: string | null }): boolean {
  return order.payment_status === 'paid'
}

/** What happened to an unpaid checkout, for the abandoned-checkouts view. */
export function getUnpaidOutcome(order: { payment_status: string | null; created_at: string | null }, now = new Date()): UnpaidOutcome {
  const status = order.payment_status
  if (status === 'failed' || status === 'expired' || status === 'abandoned') return status
  if (order.created_at && now.getTime() - new Date(order.created_at).getTime() > STALE_PENDING_HOURS * 3600_000) {
    return 'abandoned'
  }
  return 'pending'
}

/** Append a timestamped entry to the admin notes log instead of overwriting it. */
export function appendAdminNote(existing: string | null, note: string, author: string, at = new Date()): string {
  const stamp = at.toISOString().slice(0, 16).replace('T', ' ')
  const entry = `[${stamp} UTC · ${author}] ${note.trim()}`
  return existing?.trim() ? `${existing.trim()}\n\n${entry}` : entry
}
