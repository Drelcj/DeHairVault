"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageCarousel } from "@/components/ui/image-carousel"
import { cn } from "@/lib/utils"
import { addToCart } from "@/lib/actions/cart"
import { useCart } from "@/contexts/cart-context"
import { useCurrency } from "@/contexts/currency-context"
import { toast } from "sonner"
import type { Product } from "@/types/database.types"

interface ProductCardProps {
  product: Product
}

// Helper function to format texture for display
function formatTexture(texture: string): string {
  return texture
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { refreshCart, openCart } = useCart()
  const { formatPrice } = useCurrency()
  const router = useRouter()

  // Defensive: ensure arrays are never null/undefined
  const productImages = product.images ?? []
  const availableLengths = product.available_lengths ?? []

  // Get the display image (thumbnail or first image)
  const imageUrl = product.thumbnail_url || productImages[0] || ''
  const fallbackImage = '/placeholder.jpg'
  
  // Format length range for display
  const lengthDisplay = availableLengths.length > 0
    ? availableLengths.length === 1
      ? `${availableLengths[0]}"`
      : `${Math.min(...availableLengths)}" - ${Math.max(...availableLengths)}"`
    : 'Various'

  // Get default length for cart (smallest available)
  const defaultLength = availableLengths.length > 0 
    ? Math.min(...availableLengths) 
    : null

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAddingToCart(true)
    try {
      const result = await addToCart(product.id, 1, defaultLength)
      
      if (result.success) {
        await refreshCart()
        toast.success(`${product.name} added to cart!`)
        // Open cart to show the added item
        openCart()
      } else if (result.requiresAuth) {
        toast.info('Please log in to add items to your cart')
        router.push('/login?redirect=' + encodeURIComponent('/shop'))
      } else {
        toast.error(result.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Debug: log if slug is missing
  if (!product.slug) {
    console.error('[ProductCard] Product is missing slug:', product.name, product.id)
  }

  // If no slug, don't link anywhere (just show the card without navigation)
  const productUrl = product.slug ? `/shop/${product.slug}` : '#'

  return (
    <Link href={productUrl} className="block" onClick={(e) => {
      if (!product.slug) {
        e.preventDefault()
        console.error('[ProductCard] Cannot navigate - product has no slug:', product.name)
      }
    }}>
      <div className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {/* Card Container */}
        <div className="relative bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all duration-500 hover:shadow-xl hover:shadow-accent/5">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-secondary via-muted to-secondary">
            {/* Image Carousel - activates on hover for products with multiple images */}
            {productImages.length > 1 ? (
              <ImageCarousel
                images={productImages}
                alt={product.name}
                mode="browse"
                isActive={isHovered}
                className={cn(
                  "transition-transform duration-700",
                  isHovered ? "scale-110" : "scale-100"
                )}
              />
            ) : (
              <Image
                src={imageUrl || fallbackImage}
                alt={product.name}
                fill
                className={cn("object-cover transition-transform duration-700", isHovered ? "scale-110" : "scale-100")}
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Featured Badge */}
            {product.is_featured && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium uppercase tracking-wider rounded-full">
                Featured
              </div>
            )}

            {/* New Arrival Badge */}
            {product.is_new_arrival && !product.is_featured && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium uppercase tracking-wider rounded-full">
                New
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsWishlisted(!isWishlisted)
              }}
              className={cn(
                "absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                isWishlisted
                  ? "bg-accent text-accent-foreground"
                  : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            </button>

            {/* Quick Add Button */}
            <div
              className={cn(
                "absolute bottom-4 left-4 right-4 transition-all duration-500 z-10",
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-lg font-medium"
              >
                <ShoppingBag className="h-4 w-4" />
                {isAddingToCart ? 'Adding...' : 'Add to Bag'}
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-5">
            {/* Texture & Length */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {formatTexture(product.texture)}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{lengthDisplay}</span>
            </div>

            {/* Product Name */}
            <h3 className="font-serif text-lg font-medium text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-xl font-medium text-foreground">{formatPrice(product.base_price_gbp)}</p>
                {product.compare_at_price_gbp && product.compare_at_price_gbp > product.base_price_gbp && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price_gbp)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Corner Accent */}
        <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-gradient-to-tl from-accent/20 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </Link>
  )
}
