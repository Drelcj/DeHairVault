'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Truck, Info } from 'lucide-react'
import { useCurrency } from '@/contexts/currency-context'
import { formatNGN, formatGBP } from '@/lib/utils/currency'
import { getProductImageSources } from '@/lib/utils'
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

function CartProductImage({ product, quantity }: { product: CartWithItems['items'][0]['product']; quantity: number }) {
  const sources = getProductImageSources(product)
  const [imageIndex, setImageIndex] = useState(0)
  const currentImage = sources[imageIndex] ?? ''

  return (
    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border">
      {currentImage ? (
        <Image
          src={currentImage}
          alt={product.name}
          fill
          className="object-cover"
          onError={() => {
            setImageIndex((prev) => Math.min(prev + 1, sources.length - 1))
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          No image
        </div>
      )}
      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground font-medium">
        {quantity}
      </div>
    </div>
  )
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
  const { formatPrice, currency } = useCurrency()
  
  // Calculate subtotal using current product prices
  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.product.base_price_gbp * item.quantity),
    0
  )
  const total = subtotal + shippingCost + tax - discount

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <h2 className="font-[family-name:var(--font-playfair)] text-xl font-medium text-foreground">Order Summary</h2>

      {/* Cart Items */}
      <div className="mt-6 space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <CartProductImage product={item.product} quantity={item.quantity} />
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{item.product.name}</h4>
              {(item.product.texture != null || item.product.grade != null) && (
                <p className="text-sm text-muted-foreground">
                  {[item.product.texture, item.product.grade]
                    .filter((v): v is string => v != null)
                    .map(v => v.replace(/_/g, ' '))
                    .join(' • ')}
                </p>
              )}
              {item.selected_length && (
                <p className="text-sm text-muted-foreground">{item.selected_length} inches</p>
              )}
              <p className="text-sm text-muted-foreground">
                Qty: {item.quantity} × {formatPrice(item.product.base_price_gbp)}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatPrice(item.product.base_price_gbp * item.quantity)}
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
          <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
        </div>
        {/* Shipping Notice - calculated separately until DHL integration */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
          <Truck className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <span className="text-amber-800 dark:text-amber-200 font-medium">Shipping calculated separately</span>
            <p className="text-amber-700 dark:text-amber-300">Our team will contact you with shipping costs after your order is placed.</p>
          </div>
        </div>
        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium text-foreground">{formatPrice(tax)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span className="font-medium">-{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-border" />

      {/* Total */}
      <div className="space-y-2">
        <div className="flex justify-between text-lg font-medium">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatPrice(total)}</span>
        </div>
        {currency !== 'NGN' && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Original (NGN)</span>
            <span>{formatNGN(total)}</span>
          </div>
        )}
      </div>

      {/* Currency Note */}
      {currency !== 'NGN' && (
        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            Prices shown in {currency} are estimates based on current exchange rates. 
            Your payment will be processed and the final amount may vary slightly.
          </p>
        </div>
      )}
    </div>
  )
}
