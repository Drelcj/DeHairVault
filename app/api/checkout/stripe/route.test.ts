import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  getOrder: vi.fn(),
  getExchangeRates: vi.fn(),
  getCatalogPricesGbp: vi.fn(),
  createSession: vi.fn(),
  retrieveConfig: vi.fn(),
}))

vi.mock('@/lib/actions/checkout', () => ({
  getOrder: mocks.getOrder,
  getExchangeRates: mocks.getExchangeRates,
  getCatalogPricesGbp: mocks.getCatalogPricesGbp,
}))

vi.mock('@/lib/orders/payment-outcomes', () => ({ recordCheckoutStarted: vi.fn().mockResolvedValue({ success: true, updated: true }) }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
  }),
}))

vi.mock('stripe', () => ({
  default: class {
    checkout = { sessions: { create: mocks.createSession } }
    paymentMethodConfigurations = { retrieve: mocks.retrieveConfig }
  },
}))

import { POST } from './route'
import { resetPaymentMethodCache } from './payment-methods'

const PMC_ID = 'pmc_test_card_klarna'

function methodConfig(availableMethods: string[], active = true) {
  const entry = (on: boolean) => ({
    available: on,
    display_preference: { overridable: null, preference: on ? 'on' : 'off', value: on ? 'on' : 'off' },
  })
  const config: Record<string, unknown> = { id: PMC_ID, object: 'payment_method_configuration', active }
  for (const key of ['card', 'klarna', 'apple_pay', 'google_pay', 'link', 'bacs_debit', 'sepa_debit']) {
    config[key] = entry(availableMethods.includes(key))
  }
  return config
}

const NGN_RATE = 1941.9534
const WIG_BEE_ID = '55d30bd8-91f4-43c9-984d-5524522af487'

function orderWithLine(unitPriceNgn: number, totalNgn: number) {
  return {
    id: 'order-1',
    total_ngn: totalNgn,
    shipping_cost_ngn: 0,
    customer_email: 'customer@example.com',
    customer_name: 'Customer',
    customer_phone: '+447700900000',
    shipping_address_line1: '10 New Burlington Street',
    shipping_address_line2: null,
    shipping_city: 'London',
    shipping_state: 'London',
    shipping_postal_code: 'W1S 3BE',
    shipping_country: 'United Kingdom',
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
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    delete process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION_ID
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

  describe('payment methods', () => {
    const unitPriceNgn = Math.round(240 * NGN_RATE * 100) / 100

    beforeEach(() => {
      resetPaymentMethodCache()
      process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION_ID = PMC_ID
      mocks.getOrder.mockResolvedValue(orderWithLine(unitPriceNgn, unitPriceNgn))
      mocks.getCatalogPricesGbp.mockResolvedValue({ [WIG_BEE_ID]: 240 })
    })

    it('uses the configuration when it only enables card, wallets and Klarna', async () => {
      mocks.retrieveConfig.mockResolvedValue(methodConfig(['card', 'klarna', 'apple_pay', 'google_pay']))

      await POST(checkoutRequest())

      const params = mocks.createSession.mock.calls[0][0]
      expect(mocks.retrieveConfig).toHaveBeenCalledWith(PMC_ID)
      expect(params.payment_method_configuration).toBe(PMC_ID)
      expect(params.payment_method_types).toBeUndefined()
      expect(params.line_items.every((li: { price_data: { currency: string } }) => li.price_data.currency === 'gbp')).toBe(true)
    })

    it.each([
      ['a delayed method is enabled', methodConfig(['card', 'klarna', 'bacs_debit'])],
      ['Link is enabled', methodConfig(['card', 'klarna', 'link'])],
      ['the configuration is inactive', methodConfig(['card', 'klarna'], false)],
    ])('falls back to card only when %s', async (_label, config) => {
      mocks.retrieveConfig.mockResolvedValue(config)

      await POST(checkoutRequest())

      const params = mocks.createSession.mock.calls[0][0]
      expect(params.payment_method_types).toEqual(['card'])
      expect(params.payment_method_configuration).toBeUndefined()
    })

    it('falls back to card only when the configuration cannot be retrieved', async () => {
      mocks.retrieveConfig.mockRejectedValue(new Error('No such payment_method_configuration'))

      await POST(checkoutRequest())

      expect(mocks.createSession.mock.calls[0][0].payment_method_types).toEqual(['card'])
    })

    it('falls back to card only when no configuration id is set', async () => {
      delete process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION_ID

      await POST(checkoutRequest())

      expect(mocks.retrieveConfig).not.toHaveBeenCalled()
      expect(mocks.createSession.mock.calls[0][0].payment_method_types).toEqual(['card'])
    })

    it('passes the ISO shipping country and requires billing address collection', async () => {
      mocks.retrieveConfig.mockResolvedValue(methodConfig(['card', 'klarna']))

      await POST(checkoutRequest())

      const params = mocks.createSession.mock.calls[0][0]
      expect(params.billing_address_collection).toBe('required')
      expect(params.payment_intent_data.shipping.address.country).toBe('GB')
      expect(params.payment_intent_data.shipping.name).toBe('Customer')
      expect(params.payment_intent_data.metadata).toEqual({ orderId: 'order-1', orderNumber: 'DHV-2026-325844' })
    })

    it('omits shipping when the country cannot be resolved', async () => {
      mocks.retrieveConfig.mockResolvedValue(methodConfig(['card', 'klarna']))
      mocks.getOrder.mockResolvedValue({ ...orderWithLine(unitPriceNgn, unitPriceNgn), shipping_country: 'Atlantis' })

      await POST(checkoutRequest())

      const params = mocks.createSession.mock.calls[0][0]
      expect(params.payment_intent_data.shipping).toBeUndefined()
      expect(params.payment_intent_data.metadata).toBeDefined()
      expect(params.billing_address_collection).toBe('required')
    })

    it('retries once with card only when session creation fails with the configuration', async () => {
      mocks.retrieveConfig.mockResolvedValue(methodConfig(['card', 'klarna']))
      mocks.createSession.mockRejectedValueOnce(new Error('Invalid payment_method_configuration'))

      const response = await POST(checkoutRequest())

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ url: 'https://checkout.stripe.com/c/pay/cs_test_1' })
      expect(mocks.createSession).toHaveBeenCalledTimes(2)
      const [first, retry] = mocks.createSession.mock.calls.map((call) => call[0])
      expect(first.payment_method_configuration).toBe(PMC_ID)
      expect(retry.payment_method_types).toEqual(['card'])
      expect(retry.payment_method_configuration).toBeUndefined()
      expect(retry.payment_intent_data).toEqual(first.payment_intent_data)
      expect(retry.line_items).toEqual(first.line_items)
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[Stripe][PaymentMethods]'),
        expect.any(Error)
      )
    })

    it('does not retry when the card-only session itself fails', async () => {
      delete process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION_ID
      mocks.createSession.mockRejectedValueOnce(new Error('Stripe is down'))

      const response = await POST(checkoutRequest())

      expect(mocks.createSession).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(500)
    })
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
