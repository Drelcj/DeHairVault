'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OrderInsert, OrderItemInsert, OrderType, OrderStatus } from '@/types/database.types'
import { getCart, clearCart } from './cart'

export interface CheckoutFormData {
  // Customer info
  customerName: string
  customerEmail: string
  customerPhone: string
  
  // Shipping address
  shippingAddressLine1: string
  shippingAddressLine2?: string
  shippingCity: string
  shippingState: string
  shippingCountry: string
  shippingPostalCode?: string
  
  // Billing address
  billingSameAsShipping: boolean
  billingAddressLine1?: string
  billingAddressLine2?: string
  billingCity?: string
  billingState?: string
  billingCountry?: string
  billingPostalCode?: string
  
  // Other info
  customerNotes?: string
  paymentMethod: 'stripe' | 'paystack'
  displayCurrency: string
  exchangeRate: number
  
  // Applied coupon
  couponCode?: string
  discountNgn?: number
}

export interface OrderResult {
  success: boolean
  orderId?: string
  orderNumber?: string
  error?: string
}

export interface CouponResult {
  success: boolean
  discountNgn?: number
  discountType?: string
  discountValue?: number
  error?: string
}

// Generate order number in format DHV-YYYY-XXXXXX
function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(100000 + Math.random() * 900000)
  return `DHV-${year}-${random}`
}

// Calculate shipping cost (flat rate for now)
function calculateShippingCost(country: string): number {
  // Flat rate shipping in NGN
  if (country === 'Nigeria') {
    return 5000 // NGN 5,000 for Nigeria
  } else {
    return 15000 // NGN 15,000 for international
  }
}

// Create order from checkout form data
export async function createOrder(
  formData: CheckoutFormData,
  sessionId?: string
): Promise<OrderResult> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get cart
    const cart = await getCart(sessionId)
    if (!cart || cart.items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Check stock availability for all items
    for (const item of cart.items) {
      if (item.product.track_inventory && !item.product.allow_backorder) {
        if (item.product.stock_quantity < item.quantity) {
          return {
            success: false,
            error: `${item.product.name} is out of stock. Only ${item.product.stock_quantity} available.`,
          }
        }
      }
    }

    // Calculate totals
    const subtotalNgn = cart.subtotalNgn
    const shippingCostNgn = calculateShippingCost(formData.shippingCountry)
    const taxNgn = 0 // Tax calculation can be added later
    const discountNgn = formData.discountNgn || 0
    const totalNgn = subtotalNgn + shippingCostNgn + taxNgn - discountNgn
    const totalDisplayCurrency = totalNgn / formData.exchangeRate

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Prepare order data
    const orderData: OrderInsert = {
      order_number: orderNumber,
      user_id: user?.id || null,
      order_type: OrderType.REGULAR,
      status: OrderStatus.PENDING,
      customer_email: formData.customerEmail,
      customer_name: formData.customerName,
      customer_phone: formData.customerPhone,
      shipping_address_line1: formData.shippingAddressLine1,
      shipping_address_line2: formData.shippingAddressLine2 || null,
      shipping_city: formData.shippingCity,
      shipping_state: formData.shippingState,
      shipping_country: formData.shippingCountry,
      shipping_postal_code: formData.shippingPostalCode || null,
      billing_same_as_shipping: formData.billingSameAsShipping,
      billing_address_line1: formData.billingSameAsShipping
        ? formData.shippingAddressLine1
        : formData.billingAddressLine1 || null,
      billing_address_line2: formData.billingSameAsShipping
        ? formData.shippingAddressLine2 || null
        : formData.billingAddressLine2 || null,
      billing_city: formData.billingSameAsShipping
        ? formData.shippingCity
        : formData.billingCity || null,
      billing_state: formData.billingSameAsShipping
        ? formData.shippingState
        : formData.billingState || null,
      billing_country: formData.billingSameAsShipping
        ? formData.shippingCountry
        : formData.billingCountry || null,
      billing_postal_code: formData.billingSameAsShipping
        ? formData.shippingPostalCode || null
        : formData.billingPostalCode || null,
      subtotal_ngn: subtotalNgn,
      shipping_cost_ngn: shippingCostNgn,
      tax_ngn: taxNgn,
      discount_ngn: discountNgn,
      total_ngn: totalNgn,
      display_currency: formData.displayCurrency,
      exchange_rate: formData.exchangeRate,
      total_display_currency: totalDisplayCurrency,
      payment_method: formData.paymentMethod,
      payment_status: 'pending',
      payment_reference: null,
      payment_metadata: null,
      shipping_method: null,
      tracking_number: null,
      tracking_url: null,
      estimated_delivery_date: null,
      is_preorder: false,
      expected_availability_date: null,
      coupon_code: formData.couponCode || null,
      coupon_discount_type: null,
      coupon_discount_value: null,
      customer_notes: formData.customerNotes || null,
      admin_notes: null,
      cancellation_reason: null,
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return { success: false, error: 'Failed to create order' }
    }

    // Insert order items
    const orderItems: OrderItemInsert[] = cart.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product.name,
      product_grade: item.product.grade,
      product_texture: item.product.texture,
      product_origin: item.product.origin,
      selected_length: item.selected_length,
      quantity: item.quantity,
      unit_price_ngn: item.unit_price_ngn,
      total_price_ngn: item.unit_price_ngn * item.quantity,
      fulfilled_quantity: 0,
      product_snapshot: {
        name: item.product.name,
        description: item.product.description,
        images: item.product.images,
        grade: item.product.grade,
        texture: item.product.texture,
        origin: item.product.origin,
      },
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      return { success: false, error: 'Failed to create order items' }
    }

    revalidatePath('/checkout')
    return { success: true, orderId: order.id, orderNumber: order.order_number }
  } catch (error) {
    console.error('Error in createOrder:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get order by ID
export async function getOrder(orderId: string) {
  try {
    const supabase = await createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items:order_items(*)
      `
      )
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return null
    }

    return order
  } catch (error) {
    console.error('Error in getOrder:', error)
    return null
  }
}

// Get order by order number
export async function getOrderByNumber(orderNumber: string) {
  try {
    const supabase = await createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items:order_items(*)
      `
      )
      .eq('order_number', orderNumber)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return null
    }

    return order
  } catch (error) {
    console.error('Error in getOrderByNumber:', error)
    return null
  }
}

// Apply coupon code
export async function applyCoupon(
  code: string,
  cartTotal: number
): Promise<CouponResult> {
  try {
    const supabase = await createClient()

    // Fetch coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      return { success: false, error: 'Invalid coupon code' }
    }

    // Check if coupon is expired
    if (coupon.expires_at) {
      const expiryDate = new Date(coupon.expires_at)
      if (expiryDate < new Date()) {
        return { success: false, error: 'Coupon has expired' }
      }
    }

    // Check if coupon has started
    if (coupon.starts_at) {
      const startDate = new Date(coupon.starts_at)
      if (startDate > new Date()) {
        return { success: false, error: 'Coupon is not yet active' }
      }
    }

    // Check minimum order value
    if (coupon.minimum_order_ngn && cartTotal < coupon.minimum_order_ngn) {
      return {
        success: false,
        error: `Minimum order value is NGN ${coupon.minimum_order_ngn}`,
      }
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { success: false, error: 'Coupon usage limit reached' }
    }

    // Calculate discount
    let discountNgn = 0
    if (coupon.discount_type === 'percentage') {
      discountNgn = (cartTotal * coupon.discount_value) / 100
      
      // Apply maximum discount if set
      if (coupon.maximum_discount_ngn && discountNgn > coupon.maximum_discount_ngn) {
        discountNgn = coupon.maximum_discount_ngn
      }
    } else if (coupon.discount_type === 'fixed') {
      discountNgn = coupon.discount_value
    }

    return {
      success: true,
      discountNgn,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
    }
  } catch (error) {
    console.error('Error applying coupon:', error)
    return { success: false, error: 'Failed to apply coupon' }
  }
}

// Update order status (typically called by webhooks)
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus: string,
  paymentReference?: string,
  paymentMetadata?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const updateData: any = {
      status,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    }

    if (paymentReference) {
      updateData.payment_reference = paymentReference
    }

    if (paymentMetadata) {
      updateData.payment_metadata = paymentMetadata
    }

    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId)

    if (error) {
      console.error('Error updating order status:', error)
      return { success: false, error: error.message }
    }

    // If payment successful, reduce stock for tracked inventory items
    if (paymentStatus === 'paid') {
      // Get order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId)

      if (orderItems) {
        for (const item of orderItems) {
          if (item.product_id) {
            // Get current stock
            const { data: product } = await supabase
              .from('products')
              .select('stock_quantity, track_inventory')
              .eq('id', item.product_id)
              .single()

            if (product && product.track_inventory) {
              // Reduce stock
              const newStock = Math.max(0, product.stock_quantity - item.quantity)
              await supabase
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', item.product_id)
            }
          }
        }
      }
    }

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error) {
    console.error('Error in updateOrderStatus:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

// Clear cart after successful order (called by webhooks)
export async function clearCartAfterOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get order to find user_id or session_id from order metadata
    const { data: order } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single()

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Find and clear the cart
    let cartQuery = supabase.from('carts').select('id')

    if (order.user_id) {
      cartQuery = cartQuery.eq('user_id', order.user_id).is('session_id', null)
    }

    const { data: cart } = await cartQuery.single()

    if (cart) {
      // Delete all cart items
      await supabase.from('cart_items').delete().eq('cart_id', cart.id)
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error clearing cart after order:', error)
    return { success: false, error: 'Failed to clear cart' }
  }
}

// Get active exchange rates
export async function getExchangeRates() {
  try {
    const supabase = await createClient()

    const { data: rates, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching exchange rates:', error)
      return []
    }

    return rates || []
  } catch (error) {
    console.error('Error in getExchangeRates:', error)
    return []
  }
}
