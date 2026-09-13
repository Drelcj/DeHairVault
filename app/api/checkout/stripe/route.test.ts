import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  getOrder: vi.fn(),
  getExchangeRates: vi.fn(),
  getCatalogPricesGbp: vi.fn(),
  createSession: vi.fn(),
}))

vi.mock('@/lib/actions/checkout', () => ({
  getOrder: mocks.getOrder,
  getExchangeRates: mocks.getExchangeRates,
  getCatalogPricesGbp: mocks.getCatalogPricesGbp,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
  }),
}))

vi.mock('stripe', () => ({
  default: class {
    checkout = { sessions: { create: mocks.createSession } }
  },
}))

import { POST } from './route'

const NGN_RATE = 1941.9534
const WIG_BEE_ID = '55d30bd8-91f4-43c9-984d-5524522af487'

function orderWithLine(unitPriceNgn: number, totalNgn: number) {
  return {
    id: 'order-1',
    total_ngn: totalNgn,
    shipping_cost_ngn: 0,
    customer_email: 'customer@example.com',
    customer_name: 'Customer',
    order_items: [
      {
        product_id: WIG_BEE_ID,
        product_name: 'Wig Bee | 10-inch Single Donor Raw Bob – 2x6 HD Closure (200g Baby Thin Hair)',
        product_texture: 'BONE_STRAIGHT',
        product_grade: 'GRADE_A',
        selected_length: 10,
        quantity: 1,
        unit_price_ngn: unitPriceNgn,
        product_snapshot: { images: [] },
      },
    ],
  }
}

function checkoutRequest() {
  return new Request('http://localhost:3000/api/checkout/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: 'order-1', orderNumber: 'DHV-2026-325844' }),
  }) as unknown as NextRequest
}

describe('POST /api/checkout/stripe price guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    mocks.getExchangeRates.mockResolvedValue([{ currency_code: 'NGN', rate_from_gbp: NGN_RATE }])
    mocks.createSession.mockResolvedValue({ id: 'cs_test_1', url: 'https://checkout.stripe.com/c/pay/cs_test_1' })
  })

  it('rejects the DHV-2026-325844 replay (stale £115 line, £200 catalog) without creating a session', async () => {
    mocks.getOrder.mockResolvedValue(orderWithLine(223324.64, 388390.68))
    mocks.getCatalogPricesGbp.mockResolvedValue({ [WIG_BEE_ID]: 200 })

    const response = await POST(checkoutRequest())

    expect(response.status).toBe(409)
    expect(mocks.createSession).not.toHaveBeenCalled()
  })

  it('charges the catalog price for a line priced by createOrder', async () => {
    const unitPriceNgn = Math.round(240 * NGN_RATE * 100) / 100
    mocks.getOrder.mockResolvedValue(orderWithLine(unitPriceNgn, unitPriceNgn))
    mocks.getCatalogPricesGbp.mockResolvedValue({ [WIG_BEE_ID]: 240 })

    const response = await POST(checkoutRequest())

    expect(response.status).toBe(200)
    expect(mocks.getCatalogPricesGbp).toHaveBeenCalledWith([WIG_BEE_ID])
    expect(mocks.createSession).toHaveBeenCalledTimes(1)
    expect(mocks.createSession.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(24000)
  })

  it('rejects a line whose product is no longer in the catalog', async () => {
    mocks.getOrder.mockResolvedValue(orderWithLine(466068.82, 466068.82))
    mocks.getCatalogPricesGbp.mockResolvedValue({})

    const response = await POST(checkoutRequest())

    expect(response.status).toBe(409)
    expect(mocks.createSession).not.toHaveBeenCalled()
  })

  it('fails closed when catalog prices cannot be loaded', async () => {
    mocks.getOrder.mockResolvedValue(orderWithLine(466068.82, 466068.82))
    mocks.getCatalogPricesGbp.mockResolvedValue(null)

    const response = await POST(checkoutRequest())

    expect(response.status).toBe(503)
    expect(mocks.createSession).not.toHaveBeenCalled()
  })

  it('rejects an order with no line items', async () => {
    mocks.getOrder.mockResolvedValue({ ...orderWithLine(466068.82, 466068.82), order_items: [] })

    const response = await POST(checkoutRequest())

    expect(response.status).toBe(400)
    expect(mocks.createSession).not.toHaveBeenCalled()
  })
})
