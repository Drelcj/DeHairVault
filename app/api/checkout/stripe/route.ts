import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getOrder, getExchangeRates } from '@/lib/actions/checkout'
import { createClient } from '@/lib/supabase/server'

// Initialize Stripe with the secret key
// Note: Let Stripe SDK use its default API version for compatibility
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// ============================================================================
// DYNAMIC EXCHANGE RATE WITH CACHING
// ============================================================================

// Cache for exchange rate (1 hour TTL)
interface CachedRate {
  rate: number
  timestamp: number
}

let cachedGbpToUsd: CachedRate | null = null
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour in milliseconds

interface ExchangeRateResult {
  success: true
  rate: number
  source: 'api' | 'cache'
} | {
  success: false
  error: string
}

/**
 * Fetches live GBP to USD exchange rate with 1-hour caching
 * Returns error if API fails - no hardcoded fallbacks
 */
async function getLiveGbpToUsdRate(): Promise<ExchangeRateResult> {
  const now = Date.now()
  
  // Check if we have a valid cached rate
  if (cachedGbpToUsd && (now - cachedGbpToUsd.timestamp) < CACHE_TTL_MS) {
    console.log(`[ExchangeRate] Using cached GBP→USD rate: ${cachedGbpToUsd.rate}`)
    return { success: true, rate: cachedGbpToUsd.rate, source: 'cache' }
  }
  
  try {
    // Use Frankfurter API (free, no API key required)
    const response = await fetch(
      'https://api.frankfurter.app/latest?from=GBP&to=USD',
      { 
        next: { revalidate: 3600 }, // Next.js cache for 1 hour
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    )
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response?.statusText}`)
    }
    
    const data = await response?.json()
    const rate = data?.rates?.USD
    
    if (typeof rate !== 'number' || isNaN(rate) || rate <= 0) {
      throw new Error(`Invalid rate received: ${rate}`)
    }
    
    // Update cache
    cachedGbpToUsd = { rate, timestamp: now }
    console.log(`[ExchangeRate] Fetched live GBP→USD rate: ${rate}`)
    
    return { success: true, rate, source: 'api' }
  } catch (error) {
    console.error('[ExchangeRate] Failed to fetch live rate:', error)
    
    // If we have an expired cache, use it as emergency fallback
    if (cachedGbpToUsd) {
      console.warn('[ExchangeRate] Using expired cache as emergency fallback')
      return { success: true, rate: cachedGbpToUsd.rate, source: 'cache' }
    }
    
    // No cache available - return error
    return { 
      success: false, 
      error: 'Exchange rate service is temporarily unavailable. Please try again in a few moments.' 
    }
  }
}

// ============================================================================
// APP URL HELPER
// ============================================================================

// Get the app URL with validation and dynamic fallback
function getAppUrl(request: NextRequest): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const productionUrl = process.env.PRODUCTION_URL // Dynamic from env
  const isProduction = process.env.NODE_ENV === 'production'
  
  // If env var is set and valid (not localhost in production), use it
  if (appUrl && !(isProduction && appUrl.includes('localhost'))) {
    return appUrl.replace(/\/$/, '')
  }
  
  // Fallback strategy for production
  if (isProduction) {
    // Try to get origin from request headers
    const origin = request?.headers?.get('origin')
    const host = request?.headers?.get('host')
    
    if (origin && !origin.includes('localhost')) {
      console.warn('[AppUrl] Using request origin as fallback:', origin)
      return origin.replace(/\/$/, '')
    }
    
    if (host && !host.includes('localhost')) {
      const protocol = request?.headers?.get('x-forwarded-proto') || 'https'
      const fallbackUrl = `${protocol}://${host}`
      console.warn('[AppUrl] Using request host as fallback:', fallbackUrl)
      return fallbackUrl.replace(/\/$/, '')
    }
    
    // Use PRODUCTION_URL from env if available
    if (productionUrl) {
      console.warn('[AppUrl] Using PRODUCTION_URL env var:', productionUrl)
      return productionUrl.replace(/\/$/, '')
    }
    
    // Cannot determine URL - this will cause an error
    throw new Error('Unable to determine application URL. Please set NEXT_PUBLIC_APP_URL environment variable.')
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

    // Validate order total
    if (order?.total_ngn == null || isNaN(order.total_ngn) || order.total_ngn <= 0) {
      console.error('Invalid order total for Stripe:', { total_ngn: order?.total_ngn, orderId })
      return NextResponse.json(
        { error: 'Invalid order total. Please contact support.' },
        { status: 400 }
      )
    }

    // ========================================================================
    // CURRENCY CONVERSION: NGN -> GBP -> USD (with live rate, integer math)
    // ========================================================================
    
    // Get NGN to GBP rate from database (with optional chaining)
    const exchangeRates = await getExchangeRates()
    const ngnRate = exchangeRates?.find((rate) => rate?.currency_code === 'NGN')
    
    if (!ngnRate?.rate_from_gbp) {
      console.error('[Stripe] NGN exchange rate not found in database')
      return NextResponse.json(
        { error: 'Currency configuration error. Please contact support.' },
        { status: 500 }
      )
    }
    
    const ngnToGbpRate = ngnRate.rate_from_gbp
    
    // Get LIVE GBP to USD rate (cached for 1 hour) - NO HARDCODED FALLBACK
    const rateResult = await getLiveGbpToUsdRate()
    
    if (!rateResult.success) {
      console.error('[Stripe] Exchange rate API unavailable:', rateResult.error)
      return NextResponse.json(
        { error: rateResult.error },
        { status: 503 } // Service Unavailable
      )
    }
    
    const gbpToUsdRate = rateResult.rate
    
    // Convert using INTEGER MATH to avoid floating point errors
    // Work in smallest units: kobo (NGN) -> pence (GBP) -> cents (USD)
    const totalKobo = Math.round(order.total_ngn * 100) // Convert NGN to kobo
    const totalPence = Math.round(totalKobo / ngnToGbpRate) // Convert kobo to pence
    const totalCents = Math.round(totalPence * gbpToUsdRate) // Convert pence to cents
    
    // For display/logging only
    const amountInGBP = totalPence / 100
    const amountInUSD = totalCents / 100
    
    // Log for Vercel verification
    console.log(`[Stripe] Order ${orderNumber} conversion:`, {
      total_ngn: order.total_ngn,
      totalKobo,
      ngnToGbpRate,
      totalPence,
      amountInGBP: amountInGBP.toFixed(2),
      gbpToUsdRate,
      rateSource: rateResult.source,
      totalCents,
      amountInUSD: amountInUSD.toFixed(2)
    })
    console.log(`[Stripe] Stripe Charge (USD): $${amountInUSD.toFixed(2)}`)
    
    // Validate amounts
    if (totalCents <= 0 || isNaN(totalCents)) {
      console.error('[Stripe] Invalid USD amount calculated:', { 
        total_ngn: order.total_ngn, 
        totalKobo,
        ngnToGbpRate, 
        gbpToUsdRate,
        totalCents
      })
      return NextResponse.json(
        { error: 'Failed to calculate payment amount' },
        { status: 400 }
      )
    }

    // Create line items from order items with INTEGER MATH to avoid rounding errors
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order?.order_items?.map((item: any) => {
        // Convert item price: kobo -> pence -> cents (integer math)
        const itemKobo = Math.round((item?.unit_price_ngn ?? 0) * 100)
        const itemPence = Math.round(itemKobo / ngnToGbpRate)
        const itemCents = Math.round(itemPence * gbpToUsdRate)
        
        // Ensure amount is valid
        const safeUnitAmount = isNaN(itemCents) || itemCents < 0 ? 0 : itemCents
        
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item?.product_name ?? 'Product',
              description: `${item?.product_texture ?? ''} • ${item?.product_grade ?? ''}${
                item?.selected_length ? ` • ${item.selected_length}"` : ''
              }`.trim(),
              images: item?.product_snapshot?.images?.[0]
                ? [item.product_snapshot.images[0]]
                : [],
            },
            unit_amount: safeUnitAmount,
          },
          quantity: item?.quantity ?? 1,
        }
      }) || []

    // Add shipping as a line item (integer math)
    if ((order?.shipping_cost_ngn ?? 0) > 0) {
      const shippingKobo = Math.round(order.shipping_cost_ngn * 100)
      const shippingPence = Math.round(shippingKobo / ngnToGbpRate)
      const shippingCents = Math.round(shippingPence * gbpToUsdRate)
      const safeShippingAmount = isNaN(shippingCents) || shippingCents < 0 ? 0 : shippingCents
      
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: `Delivery to ${order?.shipping_country ?? 'destination'}`,
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
