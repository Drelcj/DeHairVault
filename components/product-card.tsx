"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Product {
  id: number
  name: string
  price: number
  texture: string
  length: string
  image: string
  featured: boolean
  createdAt: Date
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <div className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Card Container */}
      <div className="relative bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all duration-500 hover:shadow-xl hover:shadow-accent/5">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-secondary via-muted to-secondary">
          <Image
            src={`/.jpg?height=500&width=375&query=${encodeURIComponent(product.image)}`}
            alt={product.name}
            fill
            className={cn("object-cover transition-transform duration-700", isHovered ? "scale-110" : "scale-100")}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium uppercase tracking-wider rounded-full">
              Featured
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={cn(
              "absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
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
              "absolute bottom-4 left-4 right-4 transition-all duration-500",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-lg font-medium">
              <ShoppingBag className="h-4 w-4" />
              Add to Bag
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5">
          {/* Texture & Length */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{product.texture}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{product.length}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-lg font-medium text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between">
            <p className="text-xl font-medium text-foreground">${product.price.toFixed(2)}</p>
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
  )
}
