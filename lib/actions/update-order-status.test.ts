import { beforeEach, describe, expect, it, vi } from 'vitest'

// A paid update that finds the order already paid must not reduce stock or send emails again
const mocks = vi.hoisted(() => ({
  orderUpdateRows: [] as Array<{ id: string }>,
  productUpdates: [] as unknown[],
  orFilters: [] as string[],
  sendOrderPaidEmails: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('./cart', () => ({ getCart: vi.fn(), clearCart: vi.fn() }))
vi.mock('@/lib/services/shipping', () => ({ calculateShippingCost: vi.fn() }))
vi.mock('@/lib/email/send-order-emails', () => ({ sendOrderPaidEmails: mocks.sendOrderPaidEmails }))

function chain(result: unknown) {
  const builder: Record<string, unknown> = {}
  for (const method of ['eq', 'select', 'neq', 'is']) builder[method] = () => builder
  builder.or = (filter: string) => {
    mocks.orFilters.push(filter)
    return builder
  }
  builder.maybeSingle = async () => result
  builder.single = async () => result
  builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve)
  return builder
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: () => ({
    from: (table: string) => ({
      select: () =>
        table === 'orders'
          ? chain({ data: { payment_metadata: { checkoutSessionId: 'cs_live_1' } }, error: null })
          : table === 'order_items'
            ? chain({ data: [{ product_id: 'p1', quantity: 1 }], error: null })
            : chain({ data: { stock_quantity: 5, track_inventory: true }, error: null }),
      update: (payload: unknown) => {
        if (table === 'products') {
          mocks.productUpdates.push(payload)
          return chain({ error: null })
        }
        return chain({ data: mocks.orderUpdateRows, error: null })
      },
    }),
  }),
}))

import { updateOrderStatus } from './checkout'

describe('updateOrderStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.productUpdates = []
    mocks.orFilters = []
  })

  it('reduces stock and sends emails once, on the unpaid -> paid transition', async () => {
    mocks.orderUpdateRows = [{ id: 'order-1' }]
    const result = await updateOrderStatus('order-1', 'CONFIRMED', 'paid', 'pi_1', { amountTotal: 100 })
    expect(result.success).toBe(true)
    expect(mocks.orFilters).toContain('payment_status.is.null,payment_status.neq.paid')
    expect(mocks.productUpdates).toEqual([{ stock_quantity: 4 }])
    expect(mocks.sendOrderPaidEmails).toHaveBeenCalledTimes(1)
  })

  it('does nothing more when another path already recorded the payment', async () => {
    mocks.orderUpdateRows = []
    const result = await updateOrderStatus('order-1', 'CONFIRMED', 'paid', 'pi_1', { amountTotal: 100 })
    expect(result.success).toBe(true)
    expect(mocks.productUpdates).toEqual([])
    expect(mocks.sendOrderPaidEmails).not.toHaveBeenCalled()
  })
})
