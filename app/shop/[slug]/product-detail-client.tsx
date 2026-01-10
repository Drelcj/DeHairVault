'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { addToCart } from '@/lib/actions/cart'
import { useCart } from '@/contexts/cart-context'
import { useCurrency } from '@/contexts/currency-context'
import { toast } from 'sonner'
import type { Product } from '@/types/database.types'

interface ProductDetailClientProps {
  product: Product
}

// Debug: Log when component mounts
if (typeof window !== 'undefined') {
  console.log('[ProductDetailClient] Module loaded')
}

// Helper function to format texture for display
function formatTexture(texture: string): string {
  return texture
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

// Helper function to format category for display
function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

// Helper function to extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Just the video ID
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Debug: Log when component renders
  console.log('[ProductDetailClient] Rendering with product:', product?.name, product?.slug)
  
  // Defensive: ensure arrays are never null/undefined
  const availableLengths = product.available_lengths ?? []
  const productImages = product.images ?? []
  
  const [selectedLength, setSelectedLength] = useState<number | null>(
    availableLengths[0] ?? null
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  const { refreshCart, openCart } = useCart()
  const { formatPrice } = useCurrency()
  const router = useRouter()
  
  // Debug: Log on mount
  useEffect(() => {
    console.log('[ProductDetailClient] Component mounted for:', product?.name)
    return () => {
      console.log('[ProductDetailClient] Component unmounting for:', product?.name)
    }
  }, [product?.name])

  const images = productImages.length > 0 ? productImages : [product.thumbnail_url || '']
  const currentImage = images[selectedImageIndex] || ''
  const fallbackImage = '/placeholder.jpg'

  // Handle Add to Cart
  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      const result = await addToCart(product.id, quantity, selectedLength)
      
      if (result.success) {
        await refreshCart()
        toast.success(`${product.name} added to cart!`)
        openCart()
      } else if (result.requiresAuth) {
        toast.info('Please log in to add items to your cart')
        router.push('/login?redirect=' + encodeURIComponent(`/shop/${product.slug}`))
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

  return (
    <div className="container mx-auto px-6 lg:px-12 py-12">
      {/* Back Button */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary">
            <Image
              src={currentImage || fallbackImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.is_featured && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium uppercase tracking-wider rounded-full">
                Featured
              </div>
            )}
            {product.is_new_arrival && !product.is_featured && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium uppercase tracking-wider rounded-full">
                New Arrival
              </div>
            )}
            {product.is_bestseller && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-foreground text-background text-xs font-medium uppercase tracking-wider rounded-full">
                Bestseller
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                    selectedImageIndex === index
                      ? 'border-accent'
                      : 'border-transparent hover:border-border'
                  )}
                >
                  <Image
                    src={image || fallbackImage}
                    alt={`${product.name} - View ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Product Name & Meta */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {formatCategory(product.category)}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {formatTexture(product.texture)}
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-medium text-foreground mb-4">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-medium text-foreground">{formatPrice(product.base_price_gbp)}</p>
              {product.compare_at_price_gbp && product.compare_at_price_gbp > product.base_price_gbp && (
                <p className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price_gbp)}
                </p>
              )}
            </div>
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-muted-foreground leading-relaxed">{product.short_description}</p>
          )}

          {/* Length Selection */}
          {availableLengths.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Select Length
              </label>
              <div className="flex flex-wrap gap-3">
                {availableLengths.map((length) => (
                  <button
                    key={length}
                    onClick={() => setSelectedLength(length)}
                    className={cn(
                      'px-6 py-3 rounded-lg border-2 font-medium transition-all',
                      selectedLength === length
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border hover:border-accent/50'
                    )}
                  >
                    {length}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="text-lg font-medium w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock_quantity}
              >
                +
              </Button>
              {quantity >= product.stock_quantity ? (
                <span className="text-sm text-amber-600 ml-2 font-medium">
                  Max quantity ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="text-sm text-muted-foreground ml-2">
                  {product.stock_quantity} available
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-accent-foreground font-medium gap-2"
              disabled={product.stock_quantity === 0 || isAddingToCart}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {isAddingToCart ? 'Adding...' : product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current text-accent')} />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Truck className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground">Subsidized Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground">Quality Guarantee</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <RotateCcw className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground">Easy Returns</span>
            </div>
          </div>

          {/* Product Features */}
          {product.features && product.features.length > 0 && (
            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-medium text-foreground mb-4">Key Features</h3>
              <ul className="space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-foreground leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Description */}
          {product.description && (
            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-medium text-foreground mb-4">Product Details</h3>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          {/* Product Specifications */}
          <div className="pt-6 border-t border-border space-y-3">
            <h3 className="text-lg font-medium text-foreground mb-3">Specifications</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Origin:</span>
                <span className="font-medium">{product.origin}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Grade:</span>
                <span className="font-medium">{product.grade || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Texture:</span>
                <span className="font-medium">{formatTexture(product.texture)}</span>
              </div>
              {product.draw_type && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Draw Type:</span>
                  <span className="font-medium">{product.draw_type.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Video */}
          {product.video_url && getYouTubeVideoId(product.video_url) && (
            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-medium text-foreground mb-3">Product Video</h3>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(product.video_url)}`}
                  title={`${product.name} - Product Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
