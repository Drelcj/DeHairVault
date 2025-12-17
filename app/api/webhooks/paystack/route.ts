import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { updateOrderStatus, clearCartAfterOrder } from '@/lib/actions/checkout'
import { OrderStatus } from '@/types/database.types'

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-paystack-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.error('Invalid Paystack webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    // Handle the event
    switch (event.event) {
      case 'charge.success': {
        const data = event.data

        const orderId = data.metadata?.orderId
        const orderNumber = data.metadata?.orderNumber

        if (!orderId) {
          console.error('No order ID found in Paystack webhook')
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
          data.reference,
          {
            paystackReference: data.reference,
            paystackTransactionId: data.id,
            amount: data.amount / 100, // Convert from kobo to naira
            currency: data.currency,
            channel: data.channel,
            paidAt: data.paid_at,
            authorizationCode: data.authorization?.authorization_code,
          }
        )

        if (updateResult.success) {
          // Clear the cart
          await clearCartAfterOrder(orderId)
          console.log(`Order ${orderId} (${orderNumber}) confirmed and cart cleared`)
        } else {
          console.error(`Failed to update order ${orderId}:`, updateResult.error)
        }

        break
      }

      case 'charge.failed': {
        const data = event.data
        const orderId = data.metadata?.orderId

        if (orderId) {
          console.log(`Payment failed for order ${orderId}`)
          // Optionally update order status to failed
        }
        break
      }

      default:
        console.log(`Unhandled Paystack event type: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Paystack webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
