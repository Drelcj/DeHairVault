'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/database.types'

interface ProductDetailClientProps {
  product: Product
}

// Helper function to format price in Nigerian Naira
function formatPrice(priceNgn: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(priceNgn)
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

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedLength, setSelectedLength] = useState<number | null>(
    product.available_lengths[0] || null
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const images = product.images.length > 0 ? product.images : [product.thumbnail_url || '']
  const currentImage = images[selectedImageIndex] || ''

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
              src={currentImage || `/.jpg?height=800&width=600&query=${encodeURIComponent(product.name)}`}
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
                    src={image || `/.jpg?height=200&width=200&query=${encodeURIComponent(product.name)}`}
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
              <p className="text-3xl font-medium text-foreground">{formatPrice(product.base_price_ngn)}</p>
              {product.compare_at_price_ngn && product.compare_at_price_ngn > product.base_price_ngn && (
                <p className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price_ngn)}
                </p>
              )}
            </div>
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-muted-foreground leading-relaxed">{product.short_description}</p>
          )}

          {/* Length Selection */}
          {product.available_lengths.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Select Length
              </label>
              <div className="flex flex-wrap gap-3">
                {product.available_lengths.map((length) => (
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
              <span className="text-sm text-muted-foreground ml-2">
                {product.stock_quantity} available
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-accent-foreground font-medium gap-2"
              disabled={product.stock_quantity === 0}
            >
              <ShoppingBag className="h-5 w-5" />
              {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
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

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Truck className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground">Free Shipping</span>
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

          {/* Full Description */}
          {product.description && (
            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-medium text-foreground mb-3">Product Details</h3>
              <div className="prose prose-sm text-muted-foreground">
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
                <span className="font-medium">{product.grade}</span>
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
        </div>
      </div>
    </div>
  )
}
