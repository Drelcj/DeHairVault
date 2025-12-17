'use client'

import { ShoppingBag } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/sheet'
import { useCart } from '@/contexts/cart-context'
import { CartItem } from './cart-item'
import { CartSummary } from './cart-summary'
import { ScrollArea } from '@/components/ui/scroll-area'

export function CartSheet() {
  const { cart, isOpen, closeCart, isLoading } = useCart()

  const itemCount = cart?.itemCount || 0
  const hasItems = itemCount > 0

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Bag ({itemCount})
          </SheetTitle>
          <SheetDescription>
            {hasItems
              ? 'Review your items before checkout'
              : 'Your shopping bag is empty'}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Loading cart...</p>
          </div>
        ) : hasItems ? (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-0">
                {cart?.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="-mx-6 px-6">
              <CartSummary />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Your bag is empty</h3>
              <p className="text-sm text-muted-foreground">
                Add items to get started
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
