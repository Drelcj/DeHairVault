import { NextRequest, NextResponse } from 'next/server'
import { getOrder } from '@/lib/actions/checkout'
import { createClient } from '@/lib/supabase/server'

// Get the app URL with validation and dynamic fallback (no hardcoded URLs)
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
    // Get APP_URL with fallback strategy
    const appUrl = getAppUrl(request)
    
    const body = await request?.json()
    const { orderId, orderNumber } = body ?? {}

    if (!orderId || !orderNumber) {
      return NextResponse.json(
        { error: 'Order ID and order number are required' },
        { status: 400 }
      )
    }

    // SECURITY: Verify user owns this order
    const supabase = await createClient()
    const { data: { user } } = await supabase?.auth?.getUser() ?? { data: { user: null } }
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch order details with ownership verification
    const order = await getOrder(orderId, user?.id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate order total
    if (order?.total_ngn == null || isNaN(order.total_ngn) || order.total_ngn <= 0) {
      console.error('[Paystack] Invalid order total:', { total_ngn: order?.total_ngn, orderId })
      return NextResponse.json(
        { error: 'Invalid order total. Please contact support.' },
        { status: 400 }
      )
    }
    
    // Paystack accepts amount in kobo - use INTEGER MATH to avoid rounding errors
    // Convert NGN to kobo (smallest unit) directly
    const amountInKobo = Math.round(order.total_ngn * 100)
    
    // Final validation to prevent NaN
    if (isNaN(amountInKobo) || amountInKobo <= 0) {
      console.error('[Paystack] Calculated amount is invalid:', { amountInKobo, total_ngn: order.total_ngn })
      return NextResponse.json(
        { error: 'Failed to calculate payment amount' },
        { status: 400 }
      )
    }
    
    // Log for Vercel verification
    console.log(`[Paystack] Order ${orderNumber} payment:`, {
      total_ngn: order.total_ngn,
      amountInKobo,
      amountDisplay: `₦${(amountInKobo / 100).toFixed(2)}`
    })

    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: order?.customer_email,
        amount: amountInKobo,
        currency: 'NGN',
        reference: `${orderNumber}-${Date.now()}`,
        callback_url: `${appUrl}/checkout/success?order_number=${orderNumber}`,
        metadata: {
          orderId,
          orderNumber,
          customerName: order?.customer_name,
          customerPhone: order?.customer_phone,
          custom_fields: [
            {
              display_name: 'Order Number',
              variable_name: 'order_number',
              value: orderNumber,
            },
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: order.customer_name,
            },
          ],
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      }),
    })

    const data = await response.json()

    if (!data.status) {
      console.error('Paystack initialization failed:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to initialize payment' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error('Paystack checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
