'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'

// TODO: Replace with actual shipping calculation based on location and weight
const ESTIMATED_SHIPPING_NGN = 2000

function formatPrice(priceNgn: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(priceNgn)
}

export function CartSummary() {
  const { cart, closeCart } = useCart()

  if (!cart || cart.items.length === 0) {
    return null
  }

  const subtotal = cart.subtotalNgn
  const estimatedShipping = ESTIMATED_SHIPPING_NGN
  const total = subtotal + estimatedShipping

  return (
    <div className="border-t border-border pt-4 space-y-4">
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Shipping (estimated)</span>
        <span className="font-medium text-foreground">{formatPrice(estimatedShipping)}</span>
      </div>

      {/* Total */}
      <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
        <span className="text-foreground">Total</span>
        <span className="text-foreground">{formatPrice(total)}</span>
      </div>

      {/* Checkout Button */}
      <Button
        asChild
        className="w-full h-12 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-accent-foreground font-medium"
      >
        <Link href="/checkout" onClick={closeCart}>
          Proceed to Checkout
        </Link>
      </Button>

      {/* Continue Shopping */}
      <Button
        variant="outline"
        className="w-full h-10"
        onClick={closeCart}
      >
        Continue Shopping
      </Button>
    </div>
  )
}
