import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroCarousel } from "@/components/hero-carousel"
import { HeroSection } from "@/components/hero-section"
import { PriceDisplay } from "@/components/price-display"
import { getFeaturedProducts } from "@/lib/actions/products"
import { isSoldOut } from "@/lib/utils/product"
import type { Product } from "@/types/app.types"

// Upper bound on featured slides, so the hero stays a short rotation
const MAX_PRODUCT_SLIDES = 8

function ProductSlide({ product, priority }: { product: Product; priority: boolean }) {
  const imageUrl = product.thumbnail_url || product.images?.[0] || "/placeholder.svg"

  return (
    // Below lg the slide is capped to ~one screen (image flexes to fill what the text leaves);
    // from lg up it is the original full-height two-column layout
    <div className="relative h-[88svh] min-h-[540px] flex flex-col lg:h-auto lg:min-h-screen lg:flex-row lg:items-center overflow-hidden">
      {/* Same backdrop as the brand hero so slides blend into each other */}
      <div className="absolute inset-0 bg-gradient-to-br from-champagne via-background to-secondary dark:from-background dark:via-secondary/20 dark:to-background" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-br from-accent/20 to-gold-muted/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-br from-rose-gold/20 to-accent/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 lg:px-12 pt-20 pb-16 lg:pt-32 lg:pb-28 relative z-10 flex-1 min-h-0 flex flex-col lg:block">
        <div className="flex-1 min-h-0 flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
          <div className="order-2 lg:order-1 shrink-0 text-center lg:text-left">
            <div className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border mb-8">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground tracking-wide">Featured in the Vault</span>
            </div>

            <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-2 lg:mb-6 text-balance line-clamp-2 lg:line-clamp-none">
              {product.name}
            </h2>

            <p className="text-xl lg:text-3xl text-foreground mb-4 lg:mb-10">
              <PriceDisplay amountGbp={product.base_price_gbp} size="xl" className="text-xl lg:text-3xl" />
            </p>

            <div className="flex flex-row gap-3 lg:gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="group bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 text-primary-foreground px-5 py-5 text-sm lg:px-8 lg:py-6 lg:text-base font-medium rounded-full shadow-lg shadow-accent/20"
              >
                <Link href={`/shop/${product.slug}`}>
                  Shop now
                  <span className="sr-only">: {product.name}</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-5 py-5 text-sm lg:px-8 lg:py-6 lg:text-base font-medium rounded-full border-2 hover:bg-secondary bg-transparent"
              >
                <Link href="/shop">View more</Link>
              </Button>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative flex-1 min-h-0">
            <div className="relative h-full max-w-full aspect-[3/4] mx-auto lg:h-auto lg:max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-gold via-accent to-rose-gold rounded-3xl p-[2px]">
                <div className="relative w-full h-full bg-background rounded-3xl overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    priority={priority}
                    sizes="(min-width: 1024px) 512px, 90vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

/**
 * Homepage hero: one slide per in-stock featured product, then the brand hero.
 */
export async function HeroSlider() {
  const featured = await getFeaturedProducts(MAX_PRODUCT_SLIDES)
  const products = featured.filter((product) => !isSoldOut(product))

  return (
    <HeroCarousel slideLabels={[...products.map((p) => p.name), "Welcome to the Vault"]}>
      {products.map((product, i) => (
        <ProductSlide key={product.id} product={product} priority={i === 0} />
      ))}
      <HeroSection />
    </HeroCarousel>
  )
}
