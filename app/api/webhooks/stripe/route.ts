import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateOrderStatus, clearCartAfterOrder } from '@/lib/actions/checkout'
import { OrderStatus } from '@/types/database.types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const orderId = session.client_reference_id || session.metadata?.orderId

        if (!orderId) {
          console.error('No order ID found in session')
          return NextResponse.json(
            { error: 'No order ID found' },
            { status: 400 }
          )
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
            paymentStatus: session.payment_status,
          }
        )

        if (updateResult.success) {
          // Clear the cart
          await clearCartAfterOrder(orderId)
          console.log(`Order ${orderId} confirmed and cart cleared`)
        } else {
          console.error(`Failed to update order ${orderId}:`, updateResult.error)
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.client_reference_id || session.metadata?.orderId

        if (orderId) {
          // Optionally update order as expired/cancelled
          console.log(`Checkout session expired for order ${orderId}`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        // Handle payment failure if needed
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
