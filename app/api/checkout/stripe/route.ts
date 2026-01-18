import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getOrder, getExchangeRates } from '@/lib/actions/checkout'
import { createClient } from '@/lib/supabase/server'

// Initialize Stripe with the secret key
// Note: Let Stripe SDK use its default API version for compatibility
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Production fallback URL (hardcoded for safety)
const PRODUCTION_URL = 'https://www.dehairvault.com'

// Get the app URL with validation and fallback
function getAppUrl(request: NextRequest): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const isProduction = process.env.NODE_ENV === 'production'
  
  // If env var is set and valid (not localhost in production), use it
  if (appUrl && !(isProduction && appUrl.includes('localhost'))) {
    return appUrl.replace(/\/$/, '')
  }
  
  // Fallback strategy for production
  if (isProduction) {
    // Try to get origin from request headers
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (origin && !origin.includes('localhost')) {
      console.warn('Using request origin as fallback:', origin)
      return origin.replace(/\/$/, '')
    }
    
    if (host && !host.includes('localhost')) {
      const protocol = request.headers.get('x-forwarded-proto') || 'https'
      const fallbackUrl = `${protocol}://${host}`
      console.warn('Using request host as fallback:', fallbackUrl)
      return fallbackUrl.replace(/\/$/, '')
    }
    
    // Last resort: use hardcoded production URL
    console.warn('Using hardcoded production URL as fallback:', PRODUCTION_URL)
    return PRODUCTION_URL
  }
  
  // Development fallback
  return appUrl?.replace(/\/$/, '') || 'http://localhost:3000'
}

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
    
    // Get APP_URL with fallback strategy
    const appUrl = getAppUrl(request)

    const body = await request.json()
    const { orderId, orderNumber } = body

    if (!orderId || !orderNumber) {
      return NextResponse.json(
        { error: 'Order ID and order number are required' },
        { status: 400 }
      )
    }

    // SECURITY: Verify user owns this order
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch order details with ownership verification
    const order = await getOrder(orderId, user.id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get exchange rate from database for USD
    const exchangeRates = await getExchangeRates()
    const usdRate = exchangeRates.find((rate) => rate.currency_code === 'USD')
    
    if (!usdRate || !usdRate.rate_from_gbp) {
      console.error('USD exchange rate not found or invalid:', usdRate)
      return NextResponse.json(
        { error: 'USD exchange rate not configured' },
        { status: 500 }
      )
    }

    // Validate order total
    if (order.total_ngn == null || isNaN(order.total_ngn) || order.total_ngn <= 0) {
      console.error('Invalid order total for Stripe:', { total_ngn: order.total_ngn, orderId })
      return NextResponse.json(
        { error: 'Invalid order total. Please contact support.' },
        { status: 400 }
      )
    }

    // Convert NGN to USD:
    // rate_from_gbp for USD tells us how many USD = 1 GBP
    // rate_from_gbp for NGN tells us how many NGN = 1 GBP
    // So: USD = NGN * (USD_rate / NGN_rate)
    // We need the NGN rate from the database as well
    const ngnRate = exchangeRates.find((rate) => rate.currency_code === 'NGN')
    const ngnToGbpRate = ngnRate?.rate_from_gbp || 1950 // NGN per 1 GBP (fallback)
    const usdToGbpRate = usdRate.rate_from_gbp // USD per 1 GBP (e.g., 1.27)
    
    // Convert: NGN -> GBP -> USD
    // GBP = NGN / ngnToGbpRate
    // USD = GBP * usdToGbpRate
    const amountInUSD = (order.total_ngn / ngnToGbpRate) * usdToGbpRate
    
    // Validate USD amount
    if (isNaN(amountInUSD) || amountInUSD <= 0) {
      console.error('Invalid USD amount calculated:', { 
        total_ngn: order.total_ngn, 
        ngnToGbpRate, 
        usdToGbpRate, 
        amountInUSD 
      })
      return NextResponse.json(
        { error: 'Failed to calculate payment amount' },
        { status: 400 }
      )
    }

    // Create line items from order items with proper currency conversion
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.order_items?.map((item: any) => {
        // Convert item price: NGN -> GBP -> USD
        const itemPriceUSD = (item.unit_price_ngn / ngnToGbpRate) * usdToGbpRate
        const unitAmountCents = Math.round(itemPriceUSD * 100)
        
        // Ensure amount is valid (fallback to 0 which will show as error)
        const safeUnitAmount = isNaN(unitAmountCents) || unitAmountCents < 0 ? 0 : unitAmountCents
        
        return {
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
            unit_amount: safeUnitAmount,
          },
          quantity: item.quantity,
        }
      }) || []

    // Add shipping as a line item
    if (order.shipping_cost_ngn > 0) {
      const shippingUSD = (order.shipping_cost_ngn / ngnToGbpRate) * usdToGbpRate
      const shippingCents = Math.round(shippingUSD * 100)
      const safeShippingAmount = isNaN(shippingCents) || shippingCents < 0 ? 0 : shippingCents
      
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: `Delivery to ${order.shipping_country}`,
          },
          unit_amount: safeShippingAmount,
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
      success_url: `${appUrl}/checkout/success?order_number=${orderNumber}`,
      cancel_url: `${appUrl}/checkout/cancel?reason=cancelled`,
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
