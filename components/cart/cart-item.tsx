'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { removeFromCart, updateCartItemQuantity } from '@/lib/actions/cart'
import { useCart } from '@/contexts/cart-context'
import { toast } from 'sonner'
import type { CartItemWithProduct } from '@/lib/actions/cart'

interface CartItemProps {
  item: CartItemWithProduct
}

function formatPrice(priceNgn: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(priceNgn)
}

export function CartItem({ item }: CartItemProps) {
  const { cart, updateItemQuantityOptimistic, removeItemOptimistic, revertCart, refreshCart } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || isUpdating) return

    // Save current cart state for potential rollback
    const previousCart = cart
    
    // Optimistically update the UI immediately
    updateItemQuantityOptimistic(item.id, newQuantity)
    
    setIsUpdating(true)
    try {
      const result = await updateCartItemQuantity(item.id, newQuantity)
      if (!result.success) {
        // Revert on error
        revertCart(previousCart)
        toast.error(result.error || 'Failed to update quantity')
      }
      // No need to refresh on success - optimistic update already applied
    } catch (error) {
      // Revert on error
      revertCart(previousCart)
      toast.error('Failed to update quantity')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (isUpdating) return
    
    // Save current cart state for potential rollback
    const previousCart = cart
    
    // Optimistically remove from UI immediately
    removeItemOptimistic(item.id)
    
    setIsUpdating(true)
    try {
      const result = await removeFromCart(item.id)
      if (result.success) {
        toast.success('Item removed from cart')
      } else {
        // Revert on error
        revertCart(previousCart)
        toast.error(result.error || 'Failed to remove item')
      }
    } catch (error) {
      // Revert on error
      revertCart(previousCart)
      toast.error('Failed to remove item')
    } finally {
      setIsUpdating(false)
    }
  }

  const imageUrl = item.product.thumbnail_url || item.product.images?.[0] || '/placeholder.jpg'
  // Use current product price instead of stored price to reflect any price updates
  const currentUnitPrice = item.product.base_price_ngn
  const totalPrice = currentUnitPrice * item.quantity
  const productUrl = item.product.slug ? `/shop/${item.product.slug}` : '#'

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      {/* Product Image - Clickable */}
      <Link 
        href={productUrl}
        className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        <Image
          src={imageUrl}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link href={productUrl} className="hover:text-accent transition-colors">
          <h4 className="font-medium text-sm text-foreground truncate">{item.product.name}</h4>
        </Link>
        {item.selected_length && (
          <p className="text-xs text-muted-foreground mt-1">Length: {item.selected_length}"</p>
        )}
        <p className="text-sm font-medium text-foreground mt-2">{formatPrice(totalPrice)}</p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={isUpdating || item.quantity >= item.product.stock_quantity}
          >
            <Plus className="h-3 w-3" />
          </Button>
          {item.quantity >= item.product.stock_quantity && (
            <span className="text-xs text-muted-foreground">Max</span>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
        onClick={handleRemove}
        disabled={isUpdating}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
