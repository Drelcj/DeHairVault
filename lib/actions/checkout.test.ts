import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getCart: vi.fn(),
  inserted: {} as Record<string, unknown>,
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('./cart', () => ({ getCart: mocks.getCart, clearCart: vi.fn() }))
vi.mock('@/lib/services/shipping', () => ({ calculateShippingCost: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(),
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
    from: (table: string) => ({
      insert: (payload: unknown) => {
        mocks.inserted[table] = payload
        if (table === 'orders') {
          return {
            select: () => ({
              single: async () => ({ data: { id: 'order-1', order_number: 'DHV-TEST-1' }, error: null }),
            }),
          }
        }
        return Promise.resolve({ error: null })
      },
      delete: () => ({ eq: async () => ({ error: null }) }),
    }),
  }),
}))

import { createOrder, type CheckoutFormData } from './checkout'

const NGN_RATE = 1941.9534

const form: CheckoutFormData = {
  customerName: 'Customer',
  customerEmail: 'customer@example.com',
  customerPhone: '07000000000',
  shippingAddressLine1: '1 Test Street',
  shippingCity: 'London',
  shippingState: 'London',
  shippingCountry: 'GB',
  billingSameAsShipping: true,
  paymentMethod: 'stripe',
  displayCurrency: 'GBP',
  exchangeRate: 1,
}

describe('createOrder', () => {
  beforeEach(() => {
    mocks.inserted = {}
  })

  it('prices order lines from the live catalog, not the stale cart snapshot (DHV-2026-325844)', async () => {
    mocks.getCart.mockResolvedValue({
      id: 'cart-1',
      itemCount: 1,
      subtotalGbp: 240,
      subtotalNgn: Math.round(240 * NGN_RATE * 100) / 100,
      exchangeRate: NGN_RATE,
      items: [
        {
          id: 'cart-item-1',
          cart_id: 'cart-1',
          product_id: '55d30bd8-91f4-43c9-984d-5524522af487',
          variant_id: null,
          quantity: 1,
          selected_length: 10,
          unit_price_ngn: 223324.64, // frozen when added to the cart while the product was £115
          created_at: null,
          updated_at: null,
          product: {
            name: 'Wig Bee',
            description: null,
            images: [],
            grade: 'GRADE_A',
            texture: 'BONE_STRAIGHT',
            origin: 'VIETNAM',
            base_price_gbp: 240,
            track_inventory: true,
            allow_backorder: false,
            stock_quantity: 4,
          },
        },
      ],
    })

    const result = await createOrder(form)

    expect(result).toEqual({ success: true, orderId: 'order-1', orderNumber: 'DHV-TEST-1' })
    const [line] = mocks.inserted.order_items as Array<{ unit_price_ngn: number; total_price_ngn: number }>
    expect(line.unit_price_ngn).toBe(466068.82)
    expect(line.total_price_ngn).toBe(466068.82)
    expect((mocks.inserted.orders as { subtotal_ngn: number }).subtotal_ngn).toBe(466068.82)
  })
})
