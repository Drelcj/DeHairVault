import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getOrder } from '@/lib/actions/checkout'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, orderNumber } = body

    if (!orderId || !orderNumber) {
      return NextResponse.json(
        { error: 'Order ID and order number are required' },
        { status: 400 }
      )
    }

    // Fetch order details
    const order = await getOrder(orderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Convert NGN to USD (or other display currency)
    // For Stripe, we'll use USD conversion
    const usdExchangeRate = 1650 // NGN to USD (this should come from exchange_rates table)
    const amountInUSD = order.total_ngn / usdExchangeRate

    // Create line items from order items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.order_items?.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product_name,
            description: `${item.product_texture} • ${item.product_grade}${
              item.selected_length ? ` • ${item.selected_length}"` : ''
            }`,
            images: item.product_snapshot?.images?.[0]
              ? [item.product_snapshot.images[0]]
              : [],
          },
          unit_amount: Math.round((item.unit_price_ngn / usdExchangeRate) * 100),
        },
        quantity: item.quantity,
      })) || []

    // Add shipping as a line item
    if (order.shipping_cost_ngn > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: `Delivery to ${order.shipping_country}`,
          },
          unit_amount: Math.round((order.shipping_cost_ngn / usdExchangeRate) * 100),
        },
        quantity: 1,
      })
    }

    // Add discount as a line item (if applicable)
    if (order.discount_ngn > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Discount',
            description: order.coupon_code ? `Coupon: ${order.coupon_code}` : 'Discount',
          },
          unit_amount: -Math.round((order.discount_ngn / usdExchangeRate) * 100),
        },
        quantity: 1,
      })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order_number=${orderNumber}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?reason=cancelled`,
      customer_email: order.customer_email,
      client_reference_id: orderId,
      metadata: {
        orderId,
        orderNumber,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
