'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { Truck, X, Info } from 'lucide-react'

function formatPrice(priceNgn: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(priceNgn)
}

export function CartSummary() {
  const { cart, closeCart } = useCart()
  const router = useRouter()
  const [showShippingModal, setShowShippingModal] = useState(false)

  if (!cart || cart.items.length === 0) {
    return null
  }

  // Calculate subtotal using current product prices (not stored prices)
  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.product.base_price_ngn * item.quantity),
    0
  )

  const handleProceedToCheckout = () => {
    setShowShippingModal(true)
  }

  const handleConfirmCheckout = () => {
    setShowShippingModal(false)
    closeCart()
    router.push('/checkout')
  }

  return (
    <>
      <div className="border-t border-border pt-4 space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
        </div>

        {/* Shipping Notice */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <Truck className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Shipping will be calculated separately based on your location</span>
        </div>

        {/* Total */}
        <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={handleProceedToCheckout}
          className="w-full h-12 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-accent-foreground font-medium"
        >
          Proceed to Checkout
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

      {/* Shipping Info Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowShippingModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowShippingModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Truck className="h-8 w-8 text-accent" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-center text-foreground mb-2">
              Shipping Information
            </h3>

            {/* Message */}
            <div className="text-center text-muted-foreground space-y-3 mb-6">
              <p>
                Shipping fees are <span className="font-medium text-foreground">not included</span> in your order total.
              </p>
              <p>
                After you complete your order, our team will calculate shipping costs based on your delivery location and contact you with the final shipping fee.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-lg p-3 mt-4">
                <Info className="h-4 w-4 flex-shrink-0" />
                <span>You will only be charged for shipping after confirmation</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleConfirmCheckout}
                className="w-full h-12 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-accent-foreground font-medium"
              >
                I Understand, Continue to Checkout
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowShippingModal(false)}
                className="w-full h-10"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
