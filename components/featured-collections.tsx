import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFeaturedProducts } from "@/lib/actions/products"
import type { Product } from "@/types/database.types"

// Fallback images for when products don't have images
const fallbackImages = [
  "/luxury-virgin-hair-bundles-silk-texture.jpg",
  "/lace-closure-frontal-hair-piece-luxury.jpg",
  "/luxury-lace-wig-mannequin-elegant.jpg",
]

// Format texture for display
function formatTexture(texture: string): string {
  return texture
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

// Format price in Nigerian Naira
function formatPrice(priceNgn: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(priceNgn)
}

export async function FeaturedCollections() {
  const featuredProducts = await getFeaturedProducts(3)
  
  // If no featured products, show a message or fallback
  if (featuredProducts.length === 0) {
    return (
      <section className="py-24 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-accent tracking-widest uppercase">Explore</span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-medium mt-4 text-foreground">
              Featured Products
            </h2>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">No featured products yet. Check out our full collection!</p>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-base font-medium rounded-full border-2 hover:bg-secondary group bg-transparent">
              <Link href="/shop">
                Browse Shop
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent tracking-widest uppercase">Explore</span>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-medium mt-4 text-foreground">
            Featured Products
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {featuredProducts.map((product, index) => {
            const imageUrl = product.thumbnail_url || product.images?.[0] || fallbackImages[index % fallbackImages.length]
            
            return (
              <Link 
                key={product.id} 
                href={`/shop/${product.slug}`}
                className="group relative cursor-pointer block"
              >
                {/* Card with gradient border on hover */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-gold/50 via-accent/50 to-rose-gold/50 p-[1px] transition-all duration-500 group-hover:from-gold group-hover:via-accent group-hover:to-rose-gold">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-card relative">
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-accent font-medium uppercase tracking-wider">
                          {product.category?.replace('_', ' ')}
                        </span>
                        {product.is_new_arrival && (
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-medium text-foreground mb-1">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {formatTexture(product.texture)} • {product.origin?.replace('_', ' ')}
                      </p>
                      <p className="text-foreground font-semibold mb-3">
                        {formatPrice(product.base_price_ngn)}
                      </p>
                      <div className="flex items-center text-accent font-medium text-sm group-hover:gap-2 transition-all">
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8 py-6 text-base font-medium rounded-full border-2 hover:bg-secondary group bg-transparent"
          >
            <Link href="/shop">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
