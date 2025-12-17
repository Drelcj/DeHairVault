'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCart, type CartWithItems } from '@/lib/actions/cart'

interface CartContextType {
  cart: CartWithItems | null
  isOpen: boolean
  isLoading: boolean
  sessionId: string | null
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

// Generate or retrieve session ID from localStorage
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  const key = 'guest_session_id'
  let sessionId = localStorage.getItem(key)
  
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem(key, sessionId)
  }
  
  return sessionId
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartWithItems | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true)
      const currentSessionId = sessionId || getOrCreateSessionId()
      const cartData = await getCart(currentSessionId)
      setCart(cartData)
    } catch (error) {
      console.error('Error refreshing cart:', error)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  // Initialize session ID and load cart
  useEffect(() => {
    const id = getOrCreateSessionId()
    setSessionId(id)
  }, [])

  // Load cart when sessionId is available
  useEffect(() => {
    if (sessionId) {
      refreshCart()
    }
  }, [sessionId, refreshCart])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), [])

  const value: CartContextType = {
    cart,
    isOpen,
    isLoading,
    sessionId,
    openCart,
    closeCart,
    toggleCart,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
