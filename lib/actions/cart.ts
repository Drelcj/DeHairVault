'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CartItem, Product } from '@/types/database.types'

// Cart expiration period (authenticated users only)
const CART_EXPIRY_DAYS = 30

export interface CartItemWithProduct extends CartItem {
  product: Product
}

export interface CartWithItems {
  id: string
  items: CartItemWithProduct[]
  itemCount: number
  subtotalGbp: number
}

// Helper to get or create cart for authenticated user
async function getOrCreateUserCart(userId: string) {
  const supabase = await createClient()

  // Try to find existing cart
  const { data: existingCart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existingCart) {
    return (existingCart as any).id
  }

  // Create new cart
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + CART_EXPIRY_DAYS)

  const { data: newCart, error } = await supabase
    .from('carts')
    .insert({
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    } as any)
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create cart: ${error.message}`)
  }

  return (newCart as any).id
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
  selectedLength: number | null = null
): Promise<{ success: boolean; error?: string; requiresAuth?: boolean }> {
  try {
    const supabase = await createClient()

    // Get current user - authentication required
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please log in to add items to your cart', requiresAuth: true }
    }

    // Get or create cart for authenticated user
    const cartId = await getOrCreateUserCart(user.id)

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return { success: false, error: 'Product not found' }
    }

    // Calculate price (in GBP)
    let unitPrice = (product as any).base_price_gbp
    if (selectedLength && (product as any).length_price_modifiers) {
      const modifier = (product as any).length_price_modifiers[selectedLength.toString()]
      if (modifier) {
        unitPrice = modifier
      }
    }

    // Check if item already exists in cart
    let existingItemQuery = supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)

    if (selectedLength !== null) {
      existingItemQuery = existingItemQuery.eq('selected_length', selectedLength)
    } else {
      existingItemQuery = existingItemQuery.is('selected_length', null)
    }

    const { data: existingItem } = await existingItemQuery.single()

    if (existingItem) {
      // Check if new total quantity exceeds stock
      const newTotalQuantity = (existingItem as any).quantity + quantity
      if (newTotalQuantity > (product as any).stock_quantity) {
        const currentInCart = (existingItem as any).quantity
        const canAdd = (product as any).stock_quantity - currentInCart
        if (canAdd <= 0) {
          return { success: false, error: `You already have the maximum available quantity in your cart` }
        }
        return { success: false, error: `Only ${canAdd} more can be added. You have ${currentInCart} in cart, ${(product as any).stock_quantity} available total.` }
      }

      // Update quantity
      const { error: updateError } = await (supabase as any)
        .from('cart_items')
        .update({
          quantity: newTotalQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (existingItem as any).id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    } else {
      // Check if quantity exceeds stock
      if (quantity > (product as any).stock_quantity) {
        return { success: false, error: `Only ${(product as any).stock_quantity} items available in stock` }
      }

      // Add new item
      const { error: insertError } = await supabase.from('cart_items').insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
        selected_length: selectedLength,
        unit_price_ngn: unitPrice,
      } as any)

      if (insertError) {
        return { success: false, error: insertError.message }
      }
    }

    // Update cart timestamp
    await (supabase as any)
      .from('carts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', cartId)

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return { success: false, error: 'Failed to add item to cart' }
  }
}

export async function removeFromCart(
  cartItemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return { success: false, error: 'Failed to remove item from cart' }
  }
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    if (quantity <= 0) {
      return removeFromCart(cartItemId)
    }

    // Get cart item with product to check stock
    const { data: cartItem, error: fetchError } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('id', cartItemId)
      .single()

    if (fetchError || !cartItem) {
      return { success: false, error: 'Cart item not found' }
    }

    // Check stock quantity
    const product = (cartItem as any).product
    if (product && quantity > product.stock_quantity) {
      return { 
        success: false, 
        error: `Only ${product.stock_quantity} items available in stock` 
      }
    }

    const { error } = await (supabase as any)
      .from('cart_items')
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cartItemId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error updating cart item:', error)
    return { success: false, error: 'Failed to update cart item' }
  }
}

export async function getCart(): Promise<CartWithItems | null> {
  try {
    const supabase = await createClient()

    // Get current user - authentication required
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null // User not authenticated
    }

    // Find cart for authenticated user
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cart) {
      return null
    }

    // Get cart items with product details
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(
        `
        *,
        product:products(*)
      `
      )
      .eq('cart_id', (cart as any).id)

    if (itemsError) {
      console.error('Error fetching cart items:', itemsError)
      return null
    }

    // Filter out items without valid product data (e.g., if product was deleted)
    const validItems = (items || []).filter((item: any) => item.product !== null)
    const cartItems = validItems as unknown as CartItemWithProduct[]

    // Calculate totals using current product prices (not stored prices at time of adding)
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const subtotalGbp = cartItems.reduce(
      (sum, item) => sum + (item.product.base_price_gbp * item.quantity),
      0
    )

    return {
      id: (cart as any).id,
      items: cartItems,
      itemCount,
      subtotalGbp,
    }
  } catch (error) {
    console.error('Error fetching cart:', error)
    return null
  }
}

export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user - authentication required
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please log in to manage your cart' }
    }

    // Find cart for authenticated user
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cart) {
      return { success: false, error: 'Cart not found' }
    }

    // Delete all cart items
    const { error } = await supabase.from('cart_items').delete().eq('cart_id', (cart as any).id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return { success: false, error: 'Failed to clear cart' }
  }
}

// Note: Guest carts are not supported - all users must be authenticated to use cart
