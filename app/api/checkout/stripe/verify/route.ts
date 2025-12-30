import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateOrderStatus, clearCartAfterOrder, getOrderByNumber } from '@/lib/actions/checkout'
import { OrderStatus } from '@/types/database.types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Verify Stripe payment and update order status
 * This is a fallback for when webhooks fail (e.g., in development)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, orderNumber } = body

    if (!sessionId && !orderNumber) {
      return NextResponse.json(
        { error: 'Session ID or order number is required' },
        { status: 400 }
      )
    }

    // If we have a sessionId, retrieve the session from Stripe
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (session.payment_status !== 'paid') {
        return NextResponse.json({
          verified: false,
          status: session.payment_status,
          message: 'Payment was not successful',
        })
      }

      const orderId = session.client_reference_id || session.metadata?.orderId

      if (!orderId) {
        return NextResponse.json(
          { error: 'Could not find associated order', verified: false },
          { status: 400 }
        )
      }

      // Check if order is already confirmed
      const order = await getOrderByNumber(session.metadata?.orderNumber || '')
      if (order && (order.payment_status === 'paid' || order.status === 'CONFIRMED')) {
        return NextResponse.json({
          verified: true,
          alreadyProcessed: true,
          message: 'Order already confirmed',
        })
      }

      // Update order status
      const updateResult = await updateOrderStatus(
        orderId,
        OrderStatus.CONFIRMED,
        'paid',
        session.payment_intent as string,
        {
          stripeSessionId: session.id,
          stripePaymentIntent: session.payment_intent,
          amountTotal: session.amount_total,
          currency: session.currency,
          verifiedViaAPI: true,
        }
      )

      if (updateResult.success) {
        await clearCartAfterOrder(orderId)
        return NextResponse.json({
          verified: true,
          message: 'Payment verified and order confirmed',
        })
      } else {
        return NextResponse.json(
          { error: updateResult.error || 'Failed to update order', verified: false },
          { status: 500 }
        )
      }
    }

    // If no sessionId but we have orderNumber, just verify the order exists
    if (orderNumber) {
      const order = await getOrderByNumber(orderNumber)
      if (order) {
        return NextResponse.json({
          verified: order.payment_status === 'paid',
          status: order.status,
          paymentStatus: order.payment_status,
        })
      }
    }

    return NextResponse.json(
      { error: 'Could not verify payment', verified: false },
      { status: 400 }
    )
  } catch (error) {
    console.error('Stripe verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', verified: false },
      { status: 500 }
    )
  }
}
