'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { OrderInsert, OrderItemInsert, OrderType, OrderStatus } from '@/types/database.types'
import { getCart, clearCart } from './cart'
import { calculateShippingCost } from '@/lib/services/shipping'

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

// Create order from checkout form data
export async function createOrder(
  formData: CheckoutFormData
): Promise<OrderResult> {
  try {
    // Use regular client to verify user is authenticated
    const supabase = await createClient()

    // Get current user - REQUIRED
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }

    // Get cart for authenticated user (no sessionId needed)
    const cart = await getCart()
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

    // Calculate totals - use cart's pre-calculated NGN values
    // The cart now includes subtotalNgn calculated from the exchange rate
    const subtotalNgn = cart.subtotalNgn
    
    // Validate subtotalNgn is a valid number (not null, undefined, or NaN)
    if (subtotalNgn == null || isNaN(subtotalNgn) || subtotalNgn < 0) {
      console.error('Invalid subtotalNgn from cart:', { subtotalNgn, cartId: cart.id })
      return { 
        success: false, 
        error: 'Unable to calculate order total. Please refresh and try again.' 
      }
    }
    
    // TODO: Uncomment when DHL shipping is integrated
    // const shippingCostNgn = await calculateShippingCost(formData.shippingCountry)
    const shippingCostNgn = 0 // Temporarily disabled for payment testing
    const taxNgn = 0 // Tax calculation can be added later
    const discountNgn = formData.discountNgn || 0
    const totalNgn = subtotalNgn + shippingCostNgn + taxNgn - discountNgn
    
    // Validate totalNgn is valid before proceeding
    if (isNaN(totalNgn) || totalNgn < 0) {
      console.error('Invalid totalNgn calculated:', { subtotalNgn, shippingCostNgn, taxNgn, discountNgn, totalNgn })
      return { 
        success: false, 
        error: 'Unable to calculate order total. Please refresh and try again.' 
      }
    }
    
    // Use the cart's exchange rate for consistency, or fall back to form data
    const exchangeRate = cart.exchangeRate || formData.exchangeRate || 1950
    const totalDisplayCurrency = totalNgn / exchangeRate

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Prepare order data
    const orderData: OrderInsert = {
      order_number: orderNumber,
      user_id: user?.id || null,
      order_type: 'REGULAR' as OrderType,
      status: 'PENDING' as OrderStatus,
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
      exchange_rate: exchangeRate,
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

    // Use the authenticated user's client with RLS policies
    // (Policies allow users to create their own orders)

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData as any)
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', {
        message: orderError?.message,
        code: orderError?.code,
        details: orderError?.details,
        hint: orderError?.hint,
      })
      return { success: false, error: `Failed to create order: ${orderError?.message || 'Unknown error'}` }
    }

    if (!order) {
      return { success: false, error: 'Failed to create order: No data returned' }
    }

    // Insert order items - validate product data exists
    const orderItems: OrderItemInsert[] = []
    for (const item of cart.items) {
      // Ensure product data exists
      if (!item.product) {
        console.error('Missing product data for cart item:', item.id)
        await supabase.from('orders').delete().eq('id', (order as any).id)
        return { success: false, error: 'Product data missing for one or more cart items' }
      }

      orderItems.push({
        order_id: (order as any).id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
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
      })
    }

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems as any)

    if (itemsError) {
      console.error('Error creating order items:', {
        message: itemsError?.message,
        code: itemsError?.code,
        details: itemsError?.details,
        hint: itemsError?.hint,
      })
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', (order as any).id)
      return { success: false, error: `Failed to create order items: ${itemsError?.message || 'Unknown error'}` }
    }

    revalidatePath('/checkout')
    return { success: true, orderId: (order as any).id, orderNumber: (order as any).order_number }
  } catch (error) {
    console.error('Error in createOrder:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get order by ID
// Get order by ID (internal use - requires user verification at call site)
// SECURITY: This function should only be called after verifying user ownership
// For user-facing order retrieval, use getUserOrderById instead
export async function getOrder(orderId: string, userId?: string) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('orders')
      .select(
        `
        *,
        order_items:order_items(*)
      `
      )
      .eq('id', orderId)

    // If userId is provided, enforce ownership check
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: order, error } = await query.single()

    if (error) {
      console.error('Error fetching order:', error)
      return null
    }

    return order as any // Type assertion for joined query
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

    return order as any // Type assertion for joined query
  } catch (error) {
    console.error('Error in getOrderByNumber:', error)
    return null
  }
}

// Get order by ID (for authenticated user only)
export async function getUserOrderById(orderId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items:order_items(*)
      `
      )
      .eq('id', orderId)
      .eq('user_id', user.id) // Ensure user can only view their own orders
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return null
    }

    return order as any
  } catch (error) {
    console.error('Error in getUserOrderById:', error)
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

    // Cast coupon to any to avoid type issues with Supabase SSR client
    const couponData = coupon as any

    // Check if coupon is expired
    if (couponData.expires_at) {
      const expiryDate = new Date(couponData.expires_at)
      if (expiryDate < new Date()) {
        return { success: false, error: 'Coupon has expired' }
      }
    }

    // Check if coupon has started
    if (couponData.starts_at) {
      const startDate = new Date(couponData.starts_at)
      if (startDate > new Date()) {
        return { success: false, error: 'Coupon is not yet active' }
      }
    }

    // Check minimum order value
    if (couponData.minimum_order_ngn && cartTotal < couponData.minimum_order_ngn) {
      return {
        success: false,
        error: `Minimum order value is NGN ${couponData.minimum_order_ngn}`,
      }
    }

    // Check usage limit
    if (couponData.usage_limit && couponData.usage_count >= couponData.usage_limit) {
      return { success: false, error: 'Coupon usage limit reached' }
    }

    // Calculate discount
    let discountNgn = 0
    if (couponData.discount_type === 'percentage') {
      discountNgn = (cartTotal * couponData.discount_value) / 100
      
      // Apply maximum discount if set
      if (couponData.maximum_discount_ngn && discountNgn > couponData.maximum_discount_ngn) {
        discountNgn = couponData.maximum_discount_ngn
      }
    } else if (couponData.discount_type === 'fixed') {
      discountNgn = couponData.discount_value
    }

    return {
      success: true,
      discountNgn,
      discountType: couponData.discount_type,
      discountValue: couponData.discount_value,
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
    // Use service role client for webhook operations (no user session available)
    const serviceSupabase = createServiceClient()

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

    const { error } = await (serviceSupabase as any).from('orders').update(updateData).eq('id', orderId)

    if (error) {
      console.error('Error updating order status:', error)
      return { success: false, error: error.message }
    }

    // If payment successful, reduce stock for tracked inventory items
    if (paymentStatus === 'paid') {
      // Get order items
      const { data: orderItems } = await serviceSupabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId)

      if (orderItems) {
        for (const item of orderItems) {
          const itemData = item as any
          if (itemData.product_id) {
            // Get current stock
            const { data: product } = await serviceSupabase
              .from('products')
              .select('stock_quantity, track_inventory')
              .eq('id', itemData.product_id)
              .single()

            const productData = product as any
            if (productData && productData.track_inventory) {
              // Reduce stock
              const newStock = Math.max(0, productData.stock_quantity - itemData.quantity)
              await (serviceSupabase as any)
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', itemData.product_id)
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
    // Use service role client for webhook operations (no user session available)
    const serviceSupabase = createServiceClient()

    // Get order to find user_id or session_id from order metadata
    const { data: order } = await serviceSupabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single()

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    const orderData = order as any

    // Find and clear the cart
    let cartQuery = serviceSupabase.from('carts').select('id')

    if (orderData.user_id) {
      cartQuery = cartQuery.eq('user_id', orderData.user_id).is('session_id', null)
    }

    const { data: cart } = await cartQuery.single()

    if (cart) {
      // Delete all cart items
      await serviceSupabase.from('cart_items').delete().eq('cart_id', (cart as any).id)
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

// Get orders for the authenticated user
export async function getUserOrders() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated', orders: [] }
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_ngn,
        total_display_currency,
        display_currency,
        created_at,
        shipping_country,
        shipping_city,
        order_items (
          id,
          product_name,
          quantity,
          unit_price_ngn,
          total_price_ngn,
          selected_length
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user orders:', error)
      return { success: false, error: 'Failed to fetch orders', orders: [] }
    }

    return { success: true, orders: orders || [] }
  } catch (error) {
    console.error('Error in getUserOrders:', error)
    return { success: false, error: 'An unexpected error occurred', orders: [] }
  }
}
