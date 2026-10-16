// Admin order status rules, shared by the status form and the status API route

import { STOCK_RECONCILIATION_DATE } from '@/lib/admin/order-metrics'

export const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  // CONFIRMED -> SHIPPED lets an order that is packed and sent in one go get its tracking straight away
  CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

/**
 * Paid orders in these statuses can be marked Delivered in one step, for orders fulfilled
 * outside the system. None of these moves touches stock (see transitionMovesStock).
 */
export const MARK_DELIVERED_FROM = ['CONFIRMED', 'PROCESSING', 'SHIPPED']

export function canMarkDelivered(order: { status: string | null; payment_status: string | null }): boolean {
  return order.payment_status === 'paid' && MARK_DELIVERED_FROM.includes(order.status ?? '')
}

/** Tracking links must be plain http(s) URLs: they are shown as links in admin and in the customer email. */
export function isValidTrackingUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * True when the live trg_update_stock_on_order would change variant stock for this move:
 * PENDING -> CONFIRMED takes stock, CONFIRMED/PROCESSING -> CANCELLED gives it back.
 */
export function transitionMovesStock(from: string, to: string): boolean {
  if (from === 'PENDING' && to === 'CONFIRMED') return true
  if ((from === 'CONFIRMED' || from === 'PROCESSING') && to === 'CANCELLED') return true
  return false
}

/** Orders placed before stock was reconciled must never adjust stock. */
export function isHistoricalOrder(createdAt: string | null): boolean {
  return !!createdAt && new Date(createdAt) < new Date(STOCK_RECONCILIATION_DATE)
}
