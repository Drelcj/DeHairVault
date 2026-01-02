'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCart, type CartWithItems, type CartItemWithProduct } from '@/lib/actions/cart'

interface CartContextType {
  cart: CartWithItems | null
  isOpen: boolean
  isLoading: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  refreshCart: () => Promise<void>
  updateItemQuantityOptimistic: (itemId: string, newQuantity: number) => void
  removeItemOptimistic: (itemId: string) => void
  revertCart: (previousCart: CartWithItems | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartWithItems | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true)
      // No sessionId needed - getCart checks authentication on server
      const cartData = await getCart()
      setCart(cartData)
    } catch (error) {
      console.error('Error refreshing cart:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Optimistic update for quantity changes - updates UI immediately
  const updateItemQuantityOptimistic = useCallback((itemId: string, newQuantity: number) => {
    setCart((prevCart) => {
      if (!prevCart) return null
      
      const updatedItems = prevCart.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
      
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      const subtotalGbp = updatedItems.reduce(
        (sum, item) => sum + (item.product.base_price_gbp * item.quantity),
        0
      )
      
      return {
        ...prevCart,
        items: updatedItems,
        itemCount,
        subtotalGbp,
      }
    })
  }, [])

  // Optimistic remove - updates UI immediately
  const removeItemOptimistic = useCallback((itemId: string) => {
    setCart((prevCart) => {
      if (!prevCart) return null
      
      const updatedItems = prevCart.items.filter((item) => item.id !== itemId)
      
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      const subtotalGbp = updatedItems.reduce(
        (sum, item) => sum + (item.product.base_price_gbp * item.quantity),
        0
      )
      
      return {
        ...prevCart,
        items: updatedItems,
        itemCount,
        subtotalGbp,
      }
    })
  }, [])

  // Revert cart to previous state (used when server update fails)
  const revertCart = useCallback((previousCart: CartWithItems | null) => {
    setCart(previousCart)
  }, [])

  // Load cart on mount
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), [])

  const value: CartContextType = {
    cart,
    isOpen,
    isLoading,
    openCart,
    closeCart,
    toggleCart,
    refreshCart,
    updateItemQuantityOptimistic,
    removeItemOptimistic,
    revertCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
