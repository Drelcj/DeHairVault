import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getOrder, getExchangeRates } from '@/lib/actions/checkout'

// Initialize Stripe with the secret key
// Note: Let Stripe SDK use its default API version for compatibility
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

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

    // Get exchange rate from database for USD
    const exchangeRates = await getExchangeRates()
    const usdRate = exchangeRates.find((rate) => rate.currency_code === 'USD')
    
    if (!usdRate) {
      return NextResponse.json(
        { error: 'USD exchange rate not configured' },
        { status: 500 }
      )
    }

    // Convert NGN to USD using the exchange rate
    const usdExchangeRate = usdRate.rate_to_ngn
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

    // Note: Discounts in Stripe must be applied via Stripe Coupons, not negative line items
    // For now, we apply the discount by reducing the product prices proportionally
    // or the discount is already reflected in the order total
    // TODO: Implement Stripe Coupon integration for proper discount display

    console.log('Creating Stripe session for order:', orderNumber, 'Amount USD:', amountInUSD.toFixed(2))

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

    console.log('Stripe session created:', session.id)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error?.message || error)
    console.error('Stripe error details:', JSON.stringify(error, null, 2))
    
    // Return more specific error messages
    if (error?.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'Invalid Stripe API key. Please check your configuration.' },
        { status: 500 }
      )
    }
    
    if (error?.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: `Stripe error: ${error?.message}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
