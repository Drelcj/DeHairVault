'use client'

import Image from 'next/image'
import type { CartWithItems } from '@/lib/actions/cart'

interface OrderSummaryProps {
  cart: CartWithItems
  shippingCost: number
  tax: number
  discount: number
  displayCurrency: string
  exchangeRate: number
  couponCode?: string
  onRemoveCoupon?: () => void
}

export function OrderSummary({
  cart,
  shippingCost,
  tax,
  discount,
  displayCurrency,
  exchangeRate,
  couponCode,
  onRemoveCoupon,
}: OrderSummaryProps) {
  const subtotal = cart.subtotalNgn
  const total = subtotal + shippingCost + tax - discount
  const totalInDisplayCurrency = total / exchangeRate

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const formatDisplayCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: displayCurrency,
    }).format(amount)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <h2 className="font-[family-name:var(--font-playfair)] text-xl font-medium text-foreground">Order Summary</h2>

      {/* Cart Items */}
      <div className="mt-6 space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border">
              <Image
                src={item.product.thumbnail_url || item.product.images[0] || '/placeholder.png'}
                alt={item.product.name}
                fill
                className="object-cover"
              />
              <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground font-medium">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{item.product.name}</h4>
              <p className="text-sm text-muted-foreground">
                {item.product.texture.replace('_', ' ')} • {item.product.grade.replace('_', ' ')}
              </p>
              {item.selected_length && (
                <p className="text-sm text-muted-foreground">{item.selected_length} inches</p>
              )}
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatNGN(item.unit_price_ngn * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-border" />

      {/* Applied Coupon */}
      {couponCode && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-green-600 dark:text-green-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Coupon: {couponCode}
            </span>
          </div>
          {onRemoveCoupon && (
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Remove
            </button>
          )}
        </div>
      )}

      {/* Summary Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{formatNGN(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-foreground">{formatNGN(shippingCost)}</span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium text-foreground">{formatNGN(tax)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span className="font-medium">-{formatNGN(discount)}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-border" />

      {/* Total */}
      <div className="space-y-2">
        <div className="flex justify-between text-lg font-medium">
          <span className="text-foreground">Total (NGN)</span>
          <span className="text-foreground">{formatNGN(total)}</span>
        </div>
        {displayCurrency !== 'NGN' && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Approx. in {displayCurrency}</span>
            <span>{formatDisplayCurrency(totalInDisplayCurrency)}</span>
          </div>
        )}
      </div>

      {/* Currency Note */}
      <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <p>
          All prices are in Nigerian Naira (NGN). The converted price is an estimate based on
          current exchange rates and may vary slightly at the time of payment.
        </p>
      </div>
    </div>
  )
}
