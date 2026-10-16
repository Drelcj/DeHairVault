import { beforeEach, describe, expect, it, vi } from 'vitest'

type Query = { table: string; action: 'select' | 'update' | 'insert'; payload?: Record<string, unknown>; filters: Record<string, unknown> }

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  order: {} as Record<string, unknown>,
  // Lets a test change the order between the route's read and its update (a concurrent save)
  beforeUpdate: null as null | (() => void),
}))

// In-memory orders table that honours the route's .eq('status', ...) guard
function runQuery(q: Query) {
  if (q.table === 'users') return { data: { role: 'ADMIN' }, error: null }
  if (q.table === 'admin_activity_log') return { data: null, error: null }
  if (q.action === 'update') {
    mocks.beforeUpdate?.()
    mocks.beforeUpdate = null
    if ('status' in q.filters && q.filters.status !== mocks.order.status) return { data: [], error: null }
    Object.assign(mocks.order, q.payload)
    return { data: [{ id: mocks.order.id }], error: null }
  }
  return { data: { ...mocks.order, order_items: [{ product_name: 'Raw Bundle', product_texture: 'Body Wave', selected_length: 22, quantity: 1, unit_price_ngn: 360_000 }] }, error: null }
}

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mocks.send }
  },
}))
vi.mock('@/lib/supabase/server', () => {
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'admin-1', email: 'admin@example.com' } } }) },
    from: (table: string) => {
      const q: Query = { table, action: 'select', filters: {} }
      const builder = {
        select: () => builder,
        insert: () => {
          q.action = 'insert'
          return builder
        },
        update: (payload: Record<string, unknown>) => {
          q.action = 'update'
          q.payload = payload
          return builder
        },
        eq: (column: string, value: unknown) => {
          q.filters[column] = value
          return builder
        },
        is: (column: string, value: unknown) => {
          q.filters[column] = value
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

import { POST } from './route'

function post(body: Record<string, unknown>) {
  const req = new Request('http://localhost/api/admin/orders/order-1/status', { method: 'POST', body: JSON.stringify(body) })
  return POST(req, { params: Promise.resolve({ id: 'order-1' }) })
}

beforeEach(() => {
  process.env.RESEND_API_KEY = 're_test'
  mocks.send.mockReset().mockResolvedValue({ data: { id: 'email-1' }, error: null })
  mocks.beforeUpdate = null
  mocks.order = {
    id: 'order-1',
    order_number: 'DHV-2026-123456',
    status: 'PROCESSING',
    payment_status: 'paid',
    payment_metadata: { stripeSessionId: 'cs_1', amountTotal: 18000, currency: 'gbp' },
    exchange_rate: 2000,
    total_ngn: 360_000,
    customer_name: 'Ada Obi',
    customer_email: 'ada@example.com',
    created_at: '2026-10-16T10:00:00Z',
    paid_at: '2026-10-16T10:05:00Z',
    shipped_at: null,
    delivered_at: null,
    tracking_number: null,
    tracking_url: null,
    admin_notes: null,
    shipping_address_line1: '1 Test Street',
    shipping_address_line2: null,
    shipping_city: 'London',
    shipping_state: null,
    shipping_postal_code: 'N1 1AA',
    shipping_country: 'GB',
  }
})

describe('marking an order Shipped', () => {
  it('emails the customer once, from orders@ with the tracking details', async () => {
    const res = await post({ status: 'SHIPPED', tracking_number: 'DHL123', tracking_url: 'https://track.example.com/DHL123' })

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ success: true, shippedEmail: { sent: true } })
    expect(mocks.order.status).toBe('SHIPPED')
    expect(mocks.order.shipped_at).toBeTruthy()
    expect(mocks.send).toHaveBeenCalledTimes(1)
    const [message, options] = mocks.send.mock.calls[0]
    expect(message).toMatchObject({ from: 'Dehair Vault <orders@dehairvault.com>', to: 'ada@example.com', replyTo: 'orders@dehairvault.com' })
    expect(message.subject).toContain('has shipped')
    expect(message.html).toContain('DHL123')
    expect(message.html).toContain('https://track.example.com/DHL123')
    expect(options).toEqual({ idempotencyKey: 'order-shipped/order-1' })
  })

  it('still sends without tracking, just without the tracking section', async () => {
    await post({ status: 'SHIPPED' })

    expect(mocks.send).toHaveBeenCalledTimes(1)
    expect(mocks.send.mock.calls[0][0].html).not.toContain('Tracking number')
  })

  it('does not email again when the status is saved a second time', async () => {
    await post({ status: 'SHIPPED' })
    const second = await post({ status: 'SHIPPED' })

    expect(second.status).toBe(400)
    expect(mocks.send).toHaveBeenCalledTimes(1)
  })

  it('does not email twice when two saves race', async () => {
    // Another save moves the order to SHIPPED after this request read it as PROCESSING
    mocks.beforeUpdate = () => {
      mocks.order.status = 'SHIPPED'
    }
    const res = await post({ status: 'SHIPPED' })

    expect(res.status).toBe(409)
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('rejects a tracking link that is not a web address', async () => {
    const res = await post({ status: 'SHIPPED', tracking_url: 'javascript:alert(1)' })

    expect(res.status).toBe(400)
    expect(mocks.order.status).toBe('PROCESSING')
    expect(mocks.send).not.toHaveBeenCalled()
  })
})

describe('Mark as delivered shortcut', () => {
  it.each(['CONFIRMED', 'PROCESSING', 'SHIPPED'])('moves a paid %s order straight to Delivered without emailing', async (status) => {
    mocks.order.status = status
    const res = await post({ mark_delivered: true })

    expect(res.status).toBe(200)
    expect(mocks.order.status).toBe('DELIVERED')
    expect(mocks.order.delivered_at).toBeTruthy()
    expect(mocks.order.shipped_at).toBeTruthy()
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('keeps an existing ship date and saves optional tracking', async () => {
    mocks.order.status = 'SHIPPED'
    mocks.order.shipped_at = '2026-10-10T09:00:00Z'
    await post({ mark_delivered: true, tracking_number: 'RM123', tracking_url: '' })

    expect(mocks.order.shipped_at).toBe('2026-10-10T09:00:00Z')
    expect(mocks.order.tracking_number).toBe('RM123')
    expect(mocks.order.tracking_url).toBeNull()
  })

  it('refuses unpaid or unshippable orders', async () => {
    mocks.order.status = 'PENDING'
    mocks.order.payment_status = 'pending'
    expect((await post({ mark_delivered: true })).status).toBe(400)

    mocks.order.status = 'CANCELLED'
    mocks.order.payment_status = 'paid'
    expect((await post({ mark_delivered: true })).status).toBe(400)
    expect(mocks.order.delivered_at).toBeNull()
  })
})
