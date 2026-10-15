import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  event: null as unknown,
  updateOrderStatus: vi.fn(),
  clearCartAfterOrder: vi.fn(),
  recordPaymentFailed: vi.fn(),
  closeUnpaidCheckout: vi.fn(),
  listSessions: vi.fn(),
}))

vi.mock('@/lib/actions/checkout', () => ({
  updateOrderStatus: mocks.updateOrderStatus,
  clearCartAfterOrder: mocks.clearCartAfterOrder,
}))

vi.mock('@/lib/orders/payment-outcomes', () => ({
  recordPaymentFailed: mocks.recordPaymentFailed,
  closeUnpaidCheckout: mocks.closeUnpaidCheckout,
}))

vi.mock('stripe', () => ({
  default: class {
    webhooks = { constructEvent: () => mocks.event }
    checkout = { sessions: { list: mocks.listSessions } }
  },
}))

import { POST } from './route'

function webhookRequest() {
  return new Request('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig' },
    body: '{}',
  }) as unknown as NextRequest
}

describe('Stripe webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.updateOrderStatus.mockResolvedValue({ success: true })
    mocks.recordPaymentFailed.mockResolvedValue({ success: true, updated: true })
    mocks.closeUnpaidCheckout.mockResolvedValue({ success: true, updated: true })
  })

  it('records livemode on a completed payment', async () => {
    mocks.event = {
      type: 'checkout.session.completed',
      livemode: true,
      data: { object: { id: 'cs_live_1', client_reference_id: 'order-1', payment_intent: 'pi_1', payment_status: 'paid', amount_total: 68000, currency: 'gbp' } },
    }
    await POST(webhookRequest())
    expect(mocks.updateOrderStatus).toHaveBeenCalledWith(
      'order-1',
      'CONFIRMED',
      'paid',
      'pi_1',
      expect.objectContaining({ livemode: true, amountTotal: 68000, currency: 'gbp' })
    )
  })

  it('closes the order as expired when the session expires', async () => {
    mocks.event = {
      type: 'checkout.session.expired',
      livemode: true,
      data: { object: { id: 'cs_live_1', client_reference_id: 'order-1' } },
    }
    await POST(webhookRequest())
    expect(mocks.closeUnpaidCheckout).toHaveBeenCalledWith('order-1', 'expired', expect.any(String), expect.objectContaining({ checkoutSessionId: 'cs_live_1' }))
    expect(mocks.updateOrderStatus).not.toHaveBeenCalled()
  })

  it('marks a failed payment using the order id on the payment intent', async () => {
    mocks.event = {
      type: 'payment_intent.payment_failed',
      livemode: true,
      data: { object: { id: 'pi_1', metadata: { orderId: 'order-1' }, last_payment_error: { code: 'card_declined', message: 'Declined' } } },
    }
    await POST(webhookRequest())
    expect(mocks.recordPaymentFailed).toHaveBeenCalledWith('order-1', expect.objectContaining({ failureCode: 'card_declined' }))
    expect(mocks.listSessions).not.toHaveBeenCalled()
  })

  it('finds the order through the checkout session for older payment intents', async () => {
    mocks.listSessions.mockResolvedValue({ data: [{ client_reference_id: 'order-2' }] })
    mocks.event = {
      type: 'payment_intent.canceled',
      livemode: true,
      data: { object: { id: 'pi_2', metadata: {} } },
    }
    await POST(webhookRequest())
    expect(mocks.listSessions).toHaveBeenCalledWith({ payment_intent: 'pi_2', limit: 1 })
    expect(mocks.closeUnpaidCheckout).toHaveBeenCalledWith('order-2', 'expired', expect.any(String), expect.any(Object))
  })
})
