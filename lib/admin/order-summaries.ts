// Server-side loader for the light order fields the admin dashboard and orders list
// classify in code (test vs live, paid vs unpaid). Test detection reads payment_metadata,
// which PostgREST can't filter reliably, so all rows are fetched in pages of 1000.

import { createServiceClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database.types'
import {
  STALE_PENDING_HOURS,
  isPaid,
  isTestOrder,
} from '@/lib/admin/order-metrics'

export type OrderSummary = {
  id: string
  status: string | null
  payment_status: string | null
  payment_metadata: Json | null
  payment_method: string | null
  created_at: string | null
  paid_at: string | null
}

const PAGE_SIZE = 1000

export async function fetchOrderSummaries(): Promise<OrderSummary[]> {
  const supabase = createServiceClient()
  const rows: OrderSummary[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, payment_status, payment_metadata, payment_method, created_at, paid_at')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw new Error(`Failed to load orders: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) break
  }

  return rows
}

// Statuses that mean a paid order still needs to be shipped
const AWAITING_SHIPMENT_STATUSES = ['CONFIRMED', 'PROCESSING']
// Paid orders in these statuses don't count as sales
const NOT_A_SALE_STATUSES = ['CANCELLED', 'REFUNDED']

export function isAwaitingShipment(order: OrderSummary): boolean {
  return isPaid(order) && AWAITING_SHIPMENT_STATUSES.includes(order.status ?? '')
}

export function isUnpaidCheckout(order: OrderSummary): boolean {
  return order.status === 'PENDING' && !isPaid(order)
}

export function isSale(order: OrderSummary): boolean {
  return isPaid(order) && !isTestOrder(order) && !NOT_A_SALE_STATUSES.includes(order.status ?? '')
}

export function isStale(order: OrderSummary, now = new Date()): boolean {
  return !!order.created_at && now.getTime() - new Date(order.created_at).getTime() > STALE_PENDING_HOURS * 3600_000
}

/** When the sale happened: the paid timestamp, or the order date for older orders without one. */
export function saleDate(order: OrderSummary): Date | null {
  const value = order.paid_at ?? order.created_at
  return value ? new Date(value) : null
}
