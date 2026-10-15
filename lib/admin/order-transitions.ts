// Admin order status rules, shared by the status form and the status API route

import { STOCK_RECONCILIATION_DATE } from '@/lib/admin/order-metrics'

export const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
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
