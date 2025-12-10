"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const collections = [
  {
    name: "Signature Bundles",
    description: "Our most coveted virgin hair bundles",
    image: "/luxury-virgin-hair-bundles-silk-texture.jpg",
  },
  {
    name: "Closure & Frontals",
    description: "Seamless, undetectable perfection",
    image: "/lace-closure-frontal-hair-piece-luxury.jpg",
  },
  {
    name: "Wigs Collection",
    description: "Ready-to-wear luxury transformations",
    image: "/luxury-lace-wig-mannequin-elegant.jpg",
  },
]

export function FeaturedCollections() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent tracking-widest uppercase">Explore</span>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-medium mt-4 text-foreground">
            Our Collections
          </h2>
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <div key={collection.name} className="group relative cursor-pointer">
              {/* Card with gradient border on hover */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-gold/50 via-accent/50 to-rose-gold/50 p-[1px] transition-all duration-500 group-hover:from-gold group-hover:via-accent group-hover:to-rose-gold">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-card">
                  <img
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-foreground mb-2">
                      {collection.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">{collection.description}</p>
                    <div className="flex items-center text-accent font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Shop Now</span>
                      <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-base font-medium rounded-full border-2 hover:bg-secondary group bg-transparent"
          >
            View All Collections
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}
