import { NextRequest, NextResponse } from 'next/server'
import { getOrder } from '@/lib/actions/checkout'
import { createClient } from '@/lib/supabase/server'

// Get the app URL with validation
function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  
  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured')
  }
  
  // In production, ensure we're not using localhost
  if (process.env.NODE_ENV === 'production' && appUrl.includes('localhost')) {
    throw new Error('NEXT_PUBLIC_APP_URL cannot be localhost in production')
  }
  
  // Remove trailing slash if present
  return appUrl.replace(/\/$/, '')
}

export async function POST(request: NextRequest) {
  try {
    // Validate APP_URL is configured
    const appUrl = getAppUrl()
    
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

    // Paystack accepts amount in kobo (multiply by 100)
    // Validate amount is a valid number
    if (order.total_ngn == null || isNaN(order.total_ngn) || order.total_ngn <= 0) {
      console.error('Invalid order total for Paystack:', { total_ngn: order.total_ngn, orderId })
      return NextResponse.json(
        { error: 'Invalid order total. Please contact support.' },
        { status: 400 }
      )
    }
    
    const amountInKobo = Math.round(order.total_ngn * 100)
    
    // Final validation to prevent NaN
    if (isNaN(amountInKobo) || amountInKobo <= 0) {
      console.error('Calculated amount is invalid:', { amountInKobo, total_ngn: order.total_ngn })
      return NextResponse.json(
        { error: 'Failed to calculate payment amount' },
        { status: 400 }
      )
    }

    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: order.customer_email,
        amount: amountInKobo,
        currency: 'NGN',
        reference: `${orderNumber}-${Date.now()}`,
        callback_url: `${appUrl}/checkout/success?order_number=${orderNumber}`,
        metadata: {
          orderId,
          orderNumber,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
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
