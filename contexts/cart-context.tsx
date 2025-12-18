'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCart, type CartWithItems } from '@/lib/actions/cart'

interface CartContextType {
  cart: CartWithItems | null
  isOpen: boolean
  isLoading: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  refreshCart: () => Promise<void>
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
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
