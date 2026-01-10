'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Home, ShoppingBag } from 'lucide-react'

// Luxury hair product images for background watermark
const luxuryHairImages = [
  '/placeholder.jpg', // Fallback
  // Add actual origin images if available
]

export default function NotFound() {
  const [randomImage, setRandomImage] = useState(luxuryHairImages[0])

  useEffect(() => {
    // Select a random image on mount
    const randomIndex = Math.floor(Math.random() * luxuryHairImages.length)
    setRandomImage(luxuryHairImages[randomIndex])
  }, [])

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background watermark image */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src={randomImage}
            alt="Luxury Hair Background"
            fill
            className="object-cover opacity-[0.03] dark:opacity-[0.02]"
            priority
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 404 Heading - Fade in and Scale in animation */}
          <div className="space-y-4 animate-scale-in">
            <h1 className="font-[family-name:var(--font-playfair)] font-semibold text-foreground text-8xl md:text-9xl tracking-tight">
              404
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto rounded-full opacity-60" />
          </div>

          {/* Error Message - Fade in up animation with delay */}
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="font-[family-name:var(--font-playfair)] font-semibold text-foreground text-3xl md:text-4xl">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              We couldn't find the page you're looking for. It may have been moved, deleted, or never existed.
            </p>
          </div>

          {/* Navigation Buttons - Fade in up animation with delay */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Primary Button - Return to Shop */}
            <Link href="/shop">
              <Button
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-accent-foreground font-medium gap-2 shadow-lg"
              >
                <ShoppingBag className="h-5 w-5" />
                Return to Shop
              </Button>
            </Link>

            {/* Secondary Link - Go to Home */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium group"
              >
                <Home className="h-4 w-4 transition-transform group-hover:-translate-x-1 duration-200" />
                Go to Home
              </Link>
            </div>
          </div>

          {/* Additional Help - Fade in animation with delay */}
          <div className="pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-sm text-muted-foreground">
              Need help?{' '}
              <Link
                href="/contact"
                className="text-accent hover:underline font-medium"
              >
                Contact our support team
              </Link>
            </p>
          </div>

          {/* Decorative Element */}
          <div className="flex items-center justify-center gap-2 pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-border" />
            <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">DeHairVault</span>
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-border" />
          </div>
        </div>
      </div>

      {/* Optional: Floating decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
    </div>
  )
}
