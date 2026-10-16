import { describe, it, expect } from 'vitest'
import {
  appendAdminNote,
  getChargedAmount,
  getCheckoutValue,
  isClosedUnpaidCheckout,
  getPaymentReference,
  getUnpaidOutcome,
  isTestOrder,
  sumChargedByCurrency,
} from './order-metrics'
import { canMarkDelivered, isHistoricalOrder, isValidTrackingUrl, transitionMovesStock } from './order-transitions'
import { isLowStock, isOutOfStock } from '@/lib/utils/product'

const order = (payment_metadata: Record<string, unknown> | null, payment_reference: string | null = null) => ({
  payment_metadata: payment_metadata as never,
  payment_reference,
})

describe('isTestOrder', () => {
  it('flags Stripe test sessions and livemode false', () => {
    expect(isTestOrder(order({ stripeSessionId: 'cs_test_abc' }))).toBe(true)
    expect(isTestOrder(order({ checkoutSessionId: 'cs_test_abc' }))).toBe(true)
    expect(isTestOrder(order({ stripeSessionId: 'cs_live_abc', livemode: false }))).toBe(true)
  })

  it('flags Paystack test-domain payments', () => {
    expect(isTestOrder(order({ paystackReference: 'DHV-1', paystackDomain: 'test' }))).toBe(true)
  })

  it('flags live-mode payments the team made to test checkout', () => {
    expect(isTestOrder(order({ stripeSessionId: 'cs_live_abc', livemode: true, internalTest: true }))).toBe(true)
  })

  it('treats live and unknown orders as live', () => {
    expect(isTestOrder(order({ stripeSessionId: 'cs_live_abc', livemode: true }))).toBe(false)
    expect(isTestOrder(order({ paystackReference: 'DHV-1' }))).toBe(false)
    expect(isTestOrder(order(null))).toBe(false)
  })
})

describe('getChargedAmount', () => {
  it('reads Stripe minor units and Paystack major units', () => {
    expect(getChargedAmount(order({ amountTotal: 68000, currency: 'gbp' }))).toEqual({ amount: 680, currency: 'GBP' })
    expect(getChargedAmount(order({ amount: 450000, currency: 'NGN' }))).toEqual({ amount: 450000, currency: 'NGN' })
  })

  it('returns null without a provider record instead of falling back to total_ngn', () => {
    expect(getChargedAmount(order(null))).toBeNull()
    expect(getChargedAmount(order({ checkoutSessionId: 'cs_live_1' }))).toBeNull()
  })
})

describe('getCheckoutValue', () => {
  const base = { payment_reference: null, total_ngn: 2586476.61, exchange_rate: 1759.5079 }

  it('rebuilds the GBP amount Stripe would charge, ignoring the mislabelled display total', () => {
    // DHV-2026-305889: stored as "1470 NGN", really £1,470
    expect(getCheckoutValue({ ...base, payment_metadata: null, payment_method: 'stripe' })).toEqual({ amount: 1470, currency: 'GBP' })
  })

  it('uses NGN for Paystack and prefers provider-recorded amounts', () => {
    expect(getCheckoutValue({ ...base, payment_metadata: null, payment_method: 'paystack' })).toEqual({ amount: 2586476.61, currency: 'NGN' })
    expect(
      getCheckoutValue({ ...base, payment_method: 'stripe', payment_metadata: { checkoutAmount: 1469.99, checkoutCurrency: 'gbp' } as never })
    ).toEqual({ amount: 1469.99, currency: 'GBP' })
    expect(
      getCheckoutValue({ ...base, payment_method: 'stripe', payment_metadata: { amountTotal: 147000, currency: 'gbp' } as never })
    ).toEqual({ amount: 1470, currency: 'GBP' })
  })
})

describe('isClosedUnpaidCheckout', () => {
  it('separates closed unpaid checkouts from real cancellations', () => {
    expect(isClosedUnpaidCheckout({ status: 'CANCELLED', payment_status: 'expired' })).toBe(true)
    expect(isClosedUnpaidCheckout({ status: 'CANCELLED', payment_status: 'abandoned' })).toBe(true)
    expect(isClosedUnpaidCheckout({ status: 'CANCELLED', payment_status: 'paid' })).toBe(false)
    expect(isClosedUnpaidCheckout({ status: 'CANCELLED', payment_status: 'pending' })).toBe(false)
    expect(isClosedUnpaidCheckout({ status: 'PENDING', payment_status: 'failed' })).toBe(false)
  })
})

describe('sumChargedByCurrency', () => {
  it('totals per currency and counts orders missing an amount', () => {
    const result = sumChargedByCurrency([
      order({ amountTotal: 68000, currency: 'gbp' }),
      order({ amountTotal: 68000, currency: 'gbp' }),
      order({ amount: 1000, currency: 'NGN' }),
      order(null),
    ])
    expect(result).toEqual({ totals: { GBP: 1360, NGN: 1000 }, missing: 1 })
  })
})

describe('getPaymentReference', () => {
  it('prefers the stored reference, then provider ids', () => {
    expect(getPaymentReference(order({ checkoutSessionId: 'cs_live_1' }, 'pi_123'))).toBe('pi_123')
    expect(getPaymentReference(order({ checkoutSessionId: 'cs_live_1' }))).toBe('cs_live_1')
    expect(getPaymentReference(order(null))).toBeNull()
  })
})

describe('getUnpaidOutcome', () => {
  const now = new Date('2026-10-15T12:00:00Z')
  it('keeps the recorded outcome', () => {
    expect(getUnpaidOutcome({ payment_status: 'failed', created_at: '2026-10-15T11:00:00Z' }, now)).toBe('failed')
    expect(getUnpaidOutcome({ payment_status: 'expired', created_at: '2026-10-01T00:00:00Z' }, now)).toBe('expired')
  })

  it('treats pending checkouts older than 48h as abandoned', () => {
    expect(getUnpaidOutcome({ payment_status: 'pending', created_at: '2026-10-15T00:00:00Z' }, now)).toBe('pending')
    expect(getUnpaidOutcome({ payment_status: 'pending', created_at: '2026-10-13T11:00:00Z' }, now)).toBe('abandoned')
  })
})

describe('appendAdminNote', () => {
  it('appends instead of overwriting', () => {
    const at = new Date('2026-10-15T09:30:00Z')
    const first = appendAdminNote(null, 'Called customer', 'admin@x.com', at)
    expect(first).toBe('[2026-10-15 09:30 UTC · admin@x.com] Called customer')
    const second = appendAdminNote(first, 'Shipped via DHL', 'admin@x.com', at)
    expect(second.split('\n\n')).toHaveLength(2)
    expect(second.startsWith(first)).toBe(true)
  })
})

describe('stock-safe transitions', () => {
  it('knows which moves the stock trigger acts on', () => {
    expect(transitionMovesStock('PENDING', 'CONFIRMED')).toBe(true)
    expect(transitionMovesStock('CONFIRMED', 'CANCELLED')).toBe(true)
    expect(transitionMovesStock('PROCESSING', 'CANCELLED')).toBe(true)
    expect(transitionMovesStock('PENDING', 'CANCELLED')).toBe(false)
    expect(transitionMovesStock('PENDING', 'DELIVERED')).toBe(false)
    expect(transitionMovesStock('SHIPPED', 'DELIVERED')).toBe(false)
  })

  it('treats orders before reconciliation as historical', () => {
    expect(isHistoricalOrder('2026-01-20T10:00:00Z')).toBe(true)
    expect(isHistoricalOrder('2026-10-15T10:00:00Z')).toBe(false)
  })
})

describe('isLowStock', () => {
  it("uses each product's own threshold", () => {
    expect(isLowStock({ stock_quantity: 8, low_stock_threshold: 10 })).toBe(true)
    expect(isLowStock({ stock_quantity: 8, low_stock_threshold: 3 })).toBe(false)
  })

  it('falls back to the default threshold and ignores untracked or empty stock', () => {
    expect(isLowStock({ stock_quantity: 5, low_stock_threshold: null })).toBe(true)
    expect(isLowStock({ stock_quantity: 6, low_stock_threshold: null })).toBe(false)
    expect(isLowStock({ stock_quantity: 0, low_stock_threshold: 10 })).toBe(false)
    expect(isLowStock({ stock_quantity: 2, low_stock_threshold: 10, track_inventory: false })).toBe(false)
    expect(isOutOfStock({ stock_quantity: 0, low_stock_threshold: 10 })).toBe(true)
  })
})

describe('canMarkDelivered', () => {
  it('allows paid Confirmed, Processing and Shipped orders, and nothing else', () => {
    for (const status of ['CONFIRMED', 'PROCESSING', 'SHIPPED']) {
      expect(canMarkDelivered({ status, payment_status: 'paid' })).toBe(true)
      expect(transitionMovesStock(status, 'DELIVERED')).toBe(false)
    }
    for (const status of ['PENDING', 'DELIVERED', 'CANCELLED', 'REFUNDED', null]) {
      expect(canMarkDelivered({ status, payment_status: 'paid' })).toBe(false)
    }
    expect(canMarkDelivered({ status: 'CONFIRMED', payment_status: 'pending' })).toBe(false)
  })
})

describe('isValidTrackingUrl', () => {
  it('accepts http(s) links only', () => {
    expect(isValidTrackingUrl('https://www.dhl.com/track?id=1')).toBe(true)
    expect(isValidTrackingUrl('http://example.com')).toBe(true)
    expect(isValidTrackingUrl('javascript:alert(1)')).toBe(false)
    expect(isValidTrackingUrl('www.dhl.com')).toBe(false)
  })
})
