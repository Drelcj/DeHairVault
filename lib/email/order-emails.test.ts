import { beforeEach, describe, expect, it, vi } from 'vitest'

type Query = { table: string; action: 'select' | 'update'; payload?: Record<string, unknown>; filters: string[] }

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  order: {} as Record<string, unknown>,
}))

// Minimal in-memory stand-in for the orders table, including the atomic paid_at claim
function runQuery(q: Query) {
  if (q.table === 'order_items') return { data: [], error: null }
  if (q.action === 'update') {
    // updateOrderStatus only records a payment on an order that isn't paid yet
    if (q.filters.includes('or(payment_status.is.null,payment_status.neq.paid)')) {
      if (mocks.order.payment_status === 'paid') return { data: [], error: null }
      Object.assign(mocks.order, q.payload)
      return { data: [{ id: mocks.order.id }], error: null }
    }
    if (q.filters.includes('paid_at is null')) {
      if (mocks.order.paid_at !== null) return { data: [], error: null }
      Object.assign(mocks.order, q.payload)
      return { data: [{ id: mocks.order.id }], error: null }
    }
    Object.assign(mocks.order, q.payload)
    return { data: null, error: null }
  }
  return { data: { ...mocks.order }, error: null }
}

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/actions/cart', () => ({ getCart: vi.fn(), clearCart: vi.fn() }))
vi.mock('@/lib/services/shipping', () => ({ calculateShippingCost: vi.fn() }))
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mocks.send }
  },
}))
vi.mock('@/lib/supabase/server', () => {
  const client = {
    from: (table: string) => {
      const q: Query = { table, action: 'select', filters: [] }
      const builder = {
        select: () => builder,
        update: (payload: Record<string, unknown>) => {
          q.action = 'update'
          q.payload = payload
          return builder
        },
        eq: (column: string, value: unknown) => {
          q.filters.push(`${column}=${value}`)
          return builder
        },
        is: (column: string, value: unknown) => {
          q.filters.push(`${column} is ${value}`)
          return builder
        },
        or: (filter: string) => {
          q.filters.push(`or(${filter})`)
          return builder
        },
        single: async () => runQuery(q),
        maybeSingle: async () => runQuery(q),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(runQuery(q)).then(resolve),
      }
      return builder
    },
  }
  return { createServiceClient: () => client, createClient: async () => client }
})

import { updateOrderStatus } from '@/lib/actions/checkout'
import { buildOrderEmailData, type OrderWithItems } from './order-email-data'
import { renderNewOrderAlertEmail, renderOrderConfirmationEmail, renderOrderShippedEmail } from './order-email-templates'

const NGN_RATE = 2000

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    order_number: 'DHV-2026-123456',
    customer_name: 'Ada <b>Obi</b>',
    customer_email: 'ada@example.com',
    created_at: '2026-10-13T10:00:00Z',
    paid_at: null,
    payment_status: 'pending',
    payment_method: 'stripe',
    payment_metadata: null,
    display_currency: 'NGN',
    exchange_rate: NGN_RATE,
    total_ngn: 1_010_000,
    shipping_address_line1: '1 Test Street',
    shipping_address_line2: null,
    shipping_city: 'London',
    shipping_state: 'Greater London',
    shipping_postal_code: 'N1 1AA',
    shipping_country: 'GB',
    order_items: [
      { product_name: 'Raw Bundle', product_texture: 'Body Wave', selected_length: 22, quantity: 2, unit_price_ngn: 360_000 },
      { product_name: 'Closure', product_texture: 'UNKNOWN', selected_length: null, quantity: 1, unit_price_ngn: 290_000 },
    ],
    ...overrides,
  }
}

const stripeMeta = { stripeSessionId: 'cs_1', amountTotal: 50500, currency: 'gbp' }

describe('buildOrderEmailData', () => {
  it('shows a Stripe order in the GBP actually charged, even when it was browsed in NGN', () => {
    const data = buildOrderEmailData(
      makeOrder({ payment_metadata: stripeMeta }) as unknown as OrderWithItems,
      'https://www.dehairvault.com'
    )

    expect(data.totalPaid).toBe('£505.00')
    expect(data.items).toEqual([
      { name: 'Raw Bundle', details: '22" · Body Wave', quantity: 2, lineTotal: '£360.00' },
      { name: 'Closure', details: '', quantity: 1, lineTotal: '£145.00' },
    ])
    expect(data.shippingAddress).toEqual([
      'Ada <b>Obi</b>',
      '1 Test Street',
      'London, Greater London, N1 1AA',
      'United Kingdom',
    ])
    expect(data.adminOrderUrl).toBe('https://www.dehairvault.com/admin/orders/order-1')
  })

  it('shows a Paystack order in NGN', () => {
    const data = buildOrderEmailData(
      makeOrder({
        payment_method: 'paystack',
        payment_metadata: { paystackReference: 'ref', amount: 1_010_000, currency: 'NGN' },
      }) as unknown as OrderWithItems
    )

    expect(data.totalPaid).toBe('₦1,010,000.00')
    expect(data.items[0].lineTotal).toBe('₦720,000.00')
  })
})

describe('order email templates', () => {
  const data = buildOrderEmailData(
    makeOrder({ payment_metadata: stripeMeta }) as unknown as OrderWithItems,
    'https://www.dehairvault.com'
  )

  it('renders everything the customer needs and escapes customer-supplied text', () => {
    const email = renderOrderConfirmationEmail(data)

    expect(email.subject).toBe('Your Dehair Vault order DHV-2026-123456 is confirmed')
    for (const expected of ['DHV-2026-123456', '13 October 2026', 'Raw Bundle', 'Qty 2', '£505.00', '1 Test Street', 'tracking details']) {
      expect(email.html).toContain(expected)
      expect(email.text).toContain(expected === 'Qty 2' ? 'x 2' : expected)
    }
    expect(email.html).toContain('Ada &lt;b&gt;Obi&lt;/b&gt;')
    expect(email.html).not.toContain('<b>Obi</b>')
  })

  it('gives the team alert a clearly different subject and the admin link', () => {
    const email = renderNewOrderAlertEmail(data)

    expect(email.subject).toMatch(/^New order: DHV-2026-123456/)
    expect(email.html).toContain('https://www.dehairvault.com/admin/orders/order-1')
    expect(email.html).toContain('mailto:ada@example.com')
  })

  it('shows the tracking number and link in the shipped email, without prices', () => {
    const email = renderOrderShippedEmail(data, { number: 'DHL<123>', url: 'https://track.example.com/?id=1&x=2' })

    expect(email.subject).toBe('Your Dehair Vault order DHV-2026-123456 has shipped')
    for (const expected of ['DHV-2026-123456', 'Raw Bundle', 'Qty 2', '1 Test Street', 'Tracking number', 'Track your parcel']) {
      expect(email.html).toContain(expected)
    }
    expect(email.html).toContain('DHL&lt;123&gt;')
    expect(email.html).toContain('href="https://track.example.com/?id=1&amp;x=2"')
    expect(email.text).toContain('Tracking number: DHL<123>')
    expect(email.text).toContain('Track your parcel: https://track.example.com/?id=1&x=2')
    expect(email.html).not.toContain('£360.00')
  })

  it('leaves the tracking section out of the shipped email when there is no tracking', () => {
    const email = renderOrderShippedEmail(data, { number: null, url: null })

    expect(email.html).toContain('Your order is on its way')
    expect(email.html).not.toContain('Tracking number')
    expect(email.html).not.toContain('Track your parcel')
    expect(email.text).not.toContain('Tracking')
  })
})

describe('order paid emails', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 're_test'
    delete process.env.ORDER_ALERT_RECIPIENTS
    mocks.order = makeOrder()
    mocks.send.mockReset()
    mocks.send.mockResolvedValue({ data: { id: 'email-1' }, error: null })
  })

  it('sends one confirmation and one team alert when the webhook and verify route race', async () => {
    const results = await Promise.all([
      updateOrderStatus('order-1', 'CONFIRMED', 'paid', 'pi_1', stripeMeta),
      updateOrderStatus('order-1', 'CONFIRMED', 'paid', 'pi_1', stripeMeta),
    ])

    expect(results).toEqual([{ success: true }, { success: true }])
    expect(mocks.send).toHaveBeenCalledTimes(2)

    const [confirmation, alert] = mocks.send.mock.calls
    expect(confirmation[0]).toMatchObject({
      from: 'Dehair Vault <orders@dehairvault.com>',
      to: 'ada@example.com',
      replyTo: 'orders@dehairvault.com',
    })
    expect(confirmation[1]).toEqual({ idempotencyKey: 'order-confirmation/order-1' })
    expect(alert[0]).toMatchObject({
      from: 'Dehair Vault <orders@dehairvault.com>',
      to: ['orders@dehairvault.com', 'onyinyechi@dehairvault.com', 'emmanuelc@techmandrel.com'],
    })
    expect(alert[1]).toEqual({ idempotencyKey: 'order-alert/order-1' })
    expect(mocks.order.paid_at).not.toBeNull()
  })

  it('sends the team alert to ORDER_ALERT_RECIPIENTS when it is set', async () => {
    process.env.ORDER_ALERT_RECIPIENTS = ' ops@dehairvault.com, ,ceo@dehairvault.com '

    await updateOrderStatus('order-1', 'CONFIRMED', 'paid', 'pi_1', stripeMeta)

    const alert = mocks.send.mock.calls.find(([, options]) => options?.idempotencyKey === 'order-alert/order-1')
    expect(alert?.[0].to).toEqual(['ops@dehairvault.com', 'ceo@dehairvault.com'])
  })

  it('falls back to the default team alert recipients when ORDER_ALERT_RECIPIENTS is blank', async () => {
    process.env.ORDER_ALERT_RECIPIENTS = ' , '

    await updateOrderStatus('order-1', 'CONFIRMED', 'paid', 'pi_1', stripeMeta)

    const alert = mocks.send.mock.calls.find(([, options]) => options?.idempotencyKey === 'order-alert/order-1')
    expect(alert?.[0].to).toEqual(['orders@dehairvault.com', 'onyinyechi@dehairvault.com', 'emmanuelc@techmandrel.com'])
  })

  it('does not email again when an already-paid order is confirmed a second time', async () => {
    await updateOrderStatus('order-1', 'CONFIRMED', 'paid', 'pi_1', stripeMeta)
    await updateOrderStatus('order-1', 'CONFIRMED', 'paid', 'pi_1', stripeMeta)

    expect(mocks.send).toHaveBeenCalledTimes(2)
  })

  it('does not email for orders that were paid before this feature existed', async () => {
    mocks.order = makeOrder({ payment_status: 'paid', paid_at: null })

    await updateOrderStatus('order-1', 'CONFIRMED', 'paid', 'pi_1', stripeMeta)

    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('still confirms the order when Resend rejects or throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.send
      .mockResolvedValueOnce({ data: null, error: { name: 'validation_error', message: 'domain is not verified' } })
      .mockRejectedValueOnce(new Error('network down'))

    const result = await updateOrderStatus('order-1', 'CONFIRMED', 'paid', 'pi_1', stripeMeta)

    expect(result).toEqual({ success: true })
    expect(mocks.order.payment_status).toBe('paid')
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('FAILED: validation_error: domain is not verified'))
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('FAILED: network down'))
    consoleError.mockRestore()
  })
})
