import { NextRequest, NextResponse } from 'next/server'
import { getOrder } from '@/lib/actions/checkout'
import { createClient } from '@/lib/supabase/server'

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
    const amountInKobo = Math.round(order.total_ngn * 100)

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
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order_number=${orderNumber}`,
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
