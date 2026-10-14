// Turns an order row into the display-ready values both order emails share.
// Pure: no I/O, so it is safe to unit test and to reuse for previews.

import type { Order, OrderItem } from '@/types/app.types'
import { formatPrice } from '@/lib/utils/currency'

export type OrderWithItems = Order & { order_items: OrderItem[] }

export interface OrderEmailItem {
  name: string
  details: string
  quantity: number
  lineTotal: string
}

export interface OrderEmailData {
  orderNumber: string
  orderDate: string
  customerName: string
  customerEmail: string
  items: OrderEmailItem[]
  totalPaid: string
  shippingAddress: string[]
  customerOrderUrl: string
  adminOrderUrl: string
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://www.dehairvault.com').replace(/\/$/, '')
}

// What the gateway actually charged, as recorded on the order by the webhook / verify route.
// Stripe always charges GBP and reports minor units (amountTotal); Paystack charges NGN and
// we store it already converted to naira (amount). display_currency is NOT what was charged.
function getChargedTotal(order: Order): { amount: number; currency: string } {
  const meta = order.payment_metadata
  if (meta && typeof meta === 'object' && !Array.isArray(meta) && typeof meta.currency === 'string') {
    const currency = meta.currency.toUpperCase()
    if (typeof meta.amountTotal === 'number') return { amount: meta.amountTotal / 100, currency }
    if (typeof meta.amount === 'number') return { amount: meta.amount, currency }
  }
  // No gateway record: orders are priced and stored in NGN.
  return { amount: order.total_ngn, currency: 'NGN' }
}

function countryName(country: string): string {
  if (!/^[A-Z]{2}$/.test(country)) return country
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(country) ?? country
  } catch {
    return country
  }
}

export function buildOrderEmailData(order: OrderWithItems, appUrl: string = getAppUrl()): OrderEmailData {
  const charged = getChargedTotal(order)

  // Line prices are stored in NGN. Express them in the charged currency the same way the
  // Stripe route does (kobo / NGN-per-GBP rate, rounded to pence) so they match the receipt.
  const orderRate = Number(order.exchange_rate)
  const ngnPerUnit =
    charged.currency === 'NGN'
      ? 1
      : charged.currency === 'GBP' && orderRate > 0
        ? orderRate
        : order.total_ngn / charged.amount
  const fromNgn = (ngn: number) => Math.round((ngn * 100) / ngnPerUnit) / 100

  const items = order.order_items.map((item) => ({
    name: item.product_name,
    details: [
      item.selected_length ? `${item.selected_length}"` : null,
      // 'UNKNOWN' is the placeholder createOrder writes when a product has no texture
      item.product_texture && item.product_texture !== 'UNKNOWN' ? item.product_texture : null,
    ]
      .filter(Boolean)
      .join(' · '),
    quantity: item.quantity,
    lineTotal: formatPrice(fromNgn(item.unit_price_ngn) * item.quantity, charged.currency),
  }))

  const cityLine = [order.shipping_city, order.shipping_state, order.shipping_postal_code]
    .filter(Boolean)
    .join(', ')

  return {
    orderNumber: order.order_number,
    orderDate: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/London',
    }).format(new Date(order.paid_at ?? order.created_at ?? Date.now())),
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    items,
    totalPaid: formatPrice(charged.amount, charged.currency),
    shippingAddress: [
      order.customer_name,
      order.shipping_address_line1,
      order.shipping_address_line2,
      cityLine,
      countryName(order.shipping_country),
    ].filter((line): line is string => Boolean(line)),
    customerOrderUrl: `${appUrl}/account/orders/${order.id}`,
    adminOrderUrl: `${appUrl}/admin/orders/${order.id}`,
  }
}

// Stand-in order for previews and test sends, so no real customer data is needed.
export function sampleOrderEmailData(appUrl: string = getAppUrl()): OrderEmailData {
  return {
    orderNumber: 'DHV-2026-000000',
    orderDate: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/London',
    }).format(new Date()),
    customerName: 'Sample Customer',
    customerEmail: 'customer@example.com',
    items: [
      { name: 'Sample Raw Bundle', details: '22" · Body Wave', quantity: 2, lineTotal: formatPrice(360, 'GBP') },
      { name: 'Sample HD Lace Closure', details: '18" · Straight', quantity: 1, lineTotal: formatPrice(145, 'GBP') },
    ],
    totalPaid: formatPrice(505, 'GBP'),
    shippingAddress: ['Sample Customer', '1 Sample Street', 'Flat 2', 'London, Greater London, N1 1AA', 'United Kingdom'],
    customerOrderUrl: `${appUrl}/account/orders`,
    adminOrderUrl: `${appUrl}/admin/orders`,
  }
}
