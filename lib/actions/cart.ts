'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CartItem, Product } from '@/types/database.types'

// Cart expiration periods
const AUTHENTICATED_CART_EXPIRY_DAYS = 30
const GUEST_CART_EXPIRY_DAYS = 7

export interface CartItemWithProduct extends CartItem {
  product: Product
}

export interface CartWithItems {
  id: string
  items: CartItemWithProduct[]
  itemCount: number
  subtotalNgn: number
}

// Helper to get or create cart for authenticated user
async function getOrCreateUserCart(userId: string) {
  const supabase = await createClient()

  // Try to find existing cart
  const { data: existingCart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .is('session_id', null)
    .single()

  if (existingCart) {
    return existingCart.id
  }

  // Create new cart
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + AUTHENTICATED_CART_EXPIRY_DAYS)

  const { data: newCart, error } = await supabase
    .from('carts')
    .insert({
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create cart: ${error.message}`)
  }

  return newCart.id
}

// Helper to get or create cart for guest
export async function getOrCreateGuestCart(sessionId: string) {
  const supabase = await createClient()

  // Try to find existing cart
  const { data: existingCart } = await supabase
    .from('carts')
    .select('id')
    .eq('session_id', sessionId)
    .is('user_id', null)
    .single()

  if (existingCart) {
    return existingCart.id
  }

  // Create new cart
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + GUEST_CART_EXPIRY_DAYS)

  const { data: newCart, error } = await supabase
    .from('carts')
    .insert({
      session_id: sessionId,
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create guest cart: ${error.message}`)
  }

  return newCart.id
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
  selectedLength: number | null = null,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get or create cart
    let cartId: string
    if (user) {
      cartId = await getOrCreateUserCart(user.id)
    } else if (sessionId) {
      cartId = await getOrCreateGuestCart(sessionId)
    } else {
      return { success: false, error: 'No session ID provided for guest cart' }
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return { success: false, error: 'Product not found' }
    }

    // Calculate price
    let unitPrice = product.base_price_ngn
    if (selectedLength && product.length_price_modifiers) {
      const modifier = product.length_price_modifiers[selectedLength.toString()]
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
      // Update quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    } else {
      // Add new item
      const { error: insertError } = await supabase.from('cart_items').insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
        selected_length: selectedLength,
        unit_price_ngn: unitPrice,
      })

      if (insertError) {
        return { success: false, error: insertError.message }
      }
    }

    // Update cart timestamp
    await supabase
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

    const { error } = await supabase
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

export async function getCart(sessionId?: string): Promise<CartWithItems | null> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Find cart
    let cartQuery = supabase.from('carts').select('id')

    if (user) {
      cartQuery = cartQuery.eq('user_id', user.id).is('session_id', null)
    } else if (sessionId) {
      cartQuery = cartQuery.eq('session_id', sessionId).is('user_id', null)
    } else {
      return null
    }

    const { data: cart } = await cartQuery.single()

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
      .eq('cart_id', cart.id)

    if (itemsError) {
      console.error('Error fetching cart items:', itemsError)
      return null
    }

    const cartItems = (items || []) as unknown as CartItemWithProduct[]

    // Calculate totals
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const subtotalNgn = cartItems.reduce(
      (sum, item) => sum + item.unit_price_ngn * item.quantity,
      0
    )

    return {
      id: cart.id,
      items: cartItems,
      itemCount,
      subtotalNgn,
    }
  } catch (error) {
    console.error('Error fetching cart:', error)
    return null
  }
}

export async function clearCart(sessionId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Find cart
    let cartQuery = supabase.from('carts').select('id')

    if (user) {
      cartQuery = cartQuery.eq('user_id', user.id).is('session_id', null)
    } else if (sessionId) {
      cartQuery = cartQuery.eq('session_id', sessionId).is('user_id', null)
    } else {
      return { success: false, error: 'No cart found' }
    }

    const { data: cart } = await cartQuery.single()

    if (!cart) {
      return { success: false, error: 'Cart not found' }
    }

    // Delete all cart items
    const { error } = await supabase.from('cart_items').delete().eq('cart_id', cart.id)

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

// Merge guest cart with user cart on login
export async function mergeGuestCart(
  guestSessionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get guest cart
    const { data: guestCart } = await supabase
      .from('carts')
      .select('id')
      .eq('session_id', guestSessionId)
      .is('user_id', null)
      .single()

    if (!guestCart) {
      return { success: true } // No guest cart to merge
    }

    // Get or create user cart
    const userCartId = await getOrCreateUserCart(userId)

    // Get guest cart items
    const { data: guestItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', guestCart.id)

    if (guestItems && guestItems.length > 0) {
      // For each guest item, add to user cart or update quantity
      for (const item of guestItems) {
        let existingItemQuery = supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', userCartId)
          .eq('product_id', item.product_id)

        if (item.selected_length !== null) {
          existingItemQuery = existingItemQuery.eq('selected_length', item.selected_length)
        } else {
          existingItemQuery = existingItemQuery.is('selected_length', null)
        }

        const { data: existingItem } = await existingItemQuery.single()

        if (existingItem) {
          // Update quantity
          await supabase
            .from('cart_items')
            .update({
              quantity: existingItem.quantity + item.quantity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingItem.id)
        } else {
          // Insert new item
          await supabase.from('cart_items').insert({
            cart_id: userCartId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            selected_length: item.selected_length,
            unit_price_ngn: item.unit_price_ngn,
          })
        }
      }
    }

    // Delete guest cart and its items
    await supabase.from('cart_items').delete().eq('cart_id', guestCart.id)
    await supabase.from('carts').delete().eq('id', guestCart.id)

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error merging guest cart:', error)
    return { success: false, error: 'Failed to merge cart' }
  }
}
