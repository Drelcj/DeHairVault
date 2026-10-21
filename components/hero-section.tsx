"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  // Below lg the hero is capped to ~one screen (image flexes to fill what the text leaves);
  // from lg up it is the original full-height two-column layout
  return (
    <section className="relative h-[88svh] min-h-[540px] flex flex-col lg:h-auto lg:min-h-screen lg:flex-row lg:items-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-champagne via-background to-secondary dark:from-background dark:via-secondary/20 dark:to-background" />

      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-br from-accent/20 to-gold-muted/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-br from-rose-gold/20 to-accent/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 lg:px-12 pt-20 pb-16 lg:pt-32 lg:pb-20 relative z-10 flex-1 min-h-0 flex flex-col lg:block">
        <div className="flex-1 min-h-0 flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
          {/* Content */}
          <div className="order-2 lg:order-1 shrink-0 text-center lg:text-left">
            <div className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border mb-8">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground tracking-wide">
                Premium Quality Guaranteed
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-tight mb-3 lg:mb-6 text-balance">
              <span className="block">Unlock Your</span>
              <span className="block bg-gradient-to-r from-accent via-rose-gold to-gold bg-clip-text text-transparent">
                Luxury.
              </span>
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light mt-1 lg:mt-2">
                Welcome to the Vault.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-4 lg:mb-10 leading-relaxed">
              Discover our exclusive collection of hand-selected, ethically sourced hair extensions that transform your
              look with unparalleled elegance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="group bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 text-primary-foreground px-6 py-5 text-sm lg:px-8 lg:py-6 lg:text-base font-medium rounded-full shadow-lg shadow-accent/20"
              >
                <Link href="/shop">
                  Shop Collections
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              {/* "View Lookbook" hidden until a lookbook page exists */}
            </div>
          </div>

          {/* Hero Image */}
          <div className="order-1 lg:order-2 relative flex-1 min-h-0">
            <div className="relative h-full max-w-full aspect-[3/4] mx-auto lg:h-auto lg:max-w-lg">
              {/* Image frame with gradient border */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold via-accent to-rose-gold rounded-3xl p-[2px]">
                <div className="w-full h-full bg-background rounded-3xl overflow-hidden">
                  <img
                    src="/elegant-beautiful-woman-with-long-voluminous-flowi.jpg"
                    alt="Model with luxurious hair extensions"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Floating badge */}
              <div className="hidden lg:block absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-accent flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">100% Raw Hair</p>
                    <p className="text-xs text-muted-foreground">Ethically Sourced</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
