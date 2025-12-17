'use client'

import { CartProvider as CartContextProvider } from '@/contexts/cart-context'

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <CartContextProvider>{children}</CartContextProvider>
}
