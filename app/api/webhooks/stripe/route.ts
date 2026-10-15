import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateOrderStatus, clearCartAfterOrder } from '@/lib/actions/checkout'
import { OrderStatus } from '@/types/app.types'
import { closeUnpaidCheckout, recordPaymentFailed } from '@/lib/orders/payment-outcomes'

// Initialize Stripe - let SDK use its default API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// New sessions copy the order id onto the payment intent. Older ones only have it on the
// Checkout Session, so look that up by payment intent.
async function findOrderIdForPaymentIntent(paymentIntent: Stripe.PaymentIntent): Promise<string | null> {
  if (paymentIntent.metadata?.orderId) return paymentIntent.metadata.orderId
  try {
    const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent.id, limit: 1 })
    const session = sessions.data[0]
    return session?.client_reference_id || session?.metadata?.orderId || null
  } catch (error) {
    console.error('Could not look up checkout session for payment intent:', paymentIntent.id, error)
    return null
  }
}

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

        // Card payments complete as 'paid'; anything else is settled by a later event
        if (session.payment_status === 'unpaid') {
          console.log(`Checkout completed unpaid for order ${orderId}; waiting for payment`)
          break
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
            livemode: event.livemode,
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
          // Kept as an abandoned checkout; never touches a paid order
          const result = await closeUnpaidCheckout(orderId, 'expired', 'Stripe checkout session expired', {
            checkoutSessionId: session.id,
            livemode: event.livemode,
          })
          console.log(`Checkout session expired for order ${orderId}`, result)
        }
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.client_reference_id || session.metadata?.orderId

        if (orderId) {
          const details = { checkoutSessionId: session.id, livemode: event.livemode }
          await recordPaymentFailed(orderId, details)
          const result = await closeUnpaidCheckout(orderId, 'expired', 'Stripe payment failed', details)
          console.log(`Async payment failed for order ${orderId}`, result)
        }
        break
      }

      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = await findOrderIdForPaymentIntent(paymentIntent)

        if (!orderId) {
          console.log(`No order found for ${event.type}:`, paymentIntent.id)
          break
        }

        const details = {
          failedPaymentIntent: paymentIntent.id,
          failureCode: paymentIntent.last_payment_error?.code ?? null,
          failureMessage: paymentIntent.last_payment_error?.message ?? null,
          livemode: event.livemode,
        }

        // A failed attempt stays retryable in the same checkout; a canceled intent is final
        const result =
          event.type === 'payment_intent.payment_failed'
            ? await recordPaymentFailed(orderId, details)
            : await closeUnpaidCheckout(orderId, 'expired', 'Stripe payment canceled', details)
        console.log(`${event.type} for order ${orderId}:`, paymentIntent.id, result)
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
