import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus, clearCartAfterOrder, getOrderByNumber } from '@/lib/actions/checkout'
import { OrderStatus } from '@/types/database.types'

/**
 * Verify Paystack payment and update order status
 * This is a fallback for when webhooks fail (e.g., in development)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, orderNumber } = body

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const verifyData = await verifyResponse.json()

    if (!verifyData.status) {
      console.error('Paystack verification failed:', verifyData)
      return NextResponse.json(
        { error: 'Payment verification failed', verified: false },
        { status: 400 }
      )
    }

    const paymentData = verifyData.data

    // Check if payment was successful
    if (paymentData.status !== 'success') {
      return NextResponse.json({
        verified: false,
        status: paymentData.status,
        message: 'Payment was not successful',
      })
    }

    // Get order ID from metadata
    const orderId = paymentData.metadata?.orderId
    const metaOrderNumber = paymentData.metadata?.orderNumber

    if (!orderId) {
      // Try to get order by order number from the request
      if (orderNumber) {
        const order = await getOrderByNumber(orderNumber)
        if (order) {
          // Check if order is already confirmed
          if (order.payment_status === 'paid' || order.status === 'CONFIRMED') {
            return NextResponse.json({
              verified: true,
              alreadyProcessed: true,
              message: 'Order already confirmed',
            })
          }

          // Update order status
          const updateResult = await updateOrderStatus(
            order.id,
            OrderStatus.CONFIRMED,
            'paid',
            reference,
            {
              paystackReference: reference,
              paystackTransactionId: paymentData.id,
              amount: paymentData.amount / 100,
              currency: paymentData.currency,
              channel: paymentData.channel,
              paidAt: paymentData.paid_at,
              verifiedViaAPI: true,
            }
          )

          if (updateResult.success) {
            await clearCartAfterOrder(order.id)
            return NextResponse.json({
              verified: true,
              message: 'Payment verified and order confirmed',
            })
          }
        }
      }
      
      return NextResponse.json(
        { error: 'Could not find associated order', verified: false },
        { status: 400 }
      )
    }

    // Update order status using orderId from metadata
    const updateResult = await updateOrderStatus(
      orderId,
      OrderStatus.CONFIRMED,
      'paid',
      reference,
      {
        paystackReference: reference,
        paystackTransactionId: paymentData.id,
        amount: paymentData.amount / 100,
        currency: paymentData.currency,
        channel: paymentData.channel,
        paidAt: paymentData.paid_at,
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
  } catch (error) {
    console.error('Paystack verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', verified: false },
      { status: 500 }
    )
  }
}
