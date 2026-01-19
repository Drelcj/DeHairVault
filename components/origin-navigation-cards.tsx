'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ImageCarousel } from '@/components/ui/image-carousel'

interface OriginCard {
  origin: string
  label: string
  slug: string
  description: string
}

const originCards: OriginCard[] = [
  {
    origin: 'CHINA',
    label: 'Chinese',
    slug: 'china',
    description: 'Silky & Versatile',
  },
  {
    origin: 'VIETNAM',
    label: 'Vietnamese',
    slug: 'vietnam',
    description: 'Thick & Lustrous',
  },
  {
    origin: 'CAMBODIA',
    label: 'Cambodian',
    slug: 'cambodia',
    description: 'Natural & Soft',
  },
  {
    origin: 'BURMA',
    label: 'Burmese',
    slug: 'burma',
    description: 'Raw & Premium',
  },
  {
    origin: 'PHILIPPINES',
    label: 'Filipino',
    slug: 'philippines',
    description: 'Smooth & Durable',
  },
  {
    origin: 'INDIA',
    label: 'Indian',
    slug: 'india',
    description: 'Classic & Reliable',
  },
]

// Export for use in other components
export { originCards }
export type { OriginCard }

interface OriginNavigationCardsProps {
  originImages?: Record<string, string[]>
  currentOrigin?: string | null
  showTitle?: boolean
  compact?: boolean
}

export function OriginNavigationCards({ 
  originImages = {} as Record<HairOrigin, string[]>,
  currentOrigin = null,
  showTitle = true,
  compact = false
}: OriginNavigationCardsProps) {
  // Filter out the current origin if provided (for "Other Origins" view)
  const cardsToShow = currentOrigin 
    ? originCards.filter(card => card.origin !== currentOrigin)
    : originCards

  return (
    <div className={cn('mb-12', compact && 'mb-8')}>
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-medium text-foreground mb-2">
            {currentOrigin ? 'Explore Other Origins' : 'Shop by Origin'}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {currentOrigin 
              ? 'Discover premium hair from other regions'
              : 'Discover premium hair from around the world'
            }
          </p>
        </div>
      )}
      
      <div className={cn(
        'grid gap-4',
        compact 
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' 
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
      )}>
        {cardsToShow.map((card, index) => {
          const images = originImages[card.origin] || []
          
          return (
            <Link
              key={card.origin}
              href={`/shop/origin/${card.slug}`}
              className={cn(
                'group relative rounded-xl overflow-hidden transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                'hover:shadow-xl hover:-translate-y-1',
                compact ? 'aspect-[4/5]' : 'aspect-[3/4]'
              )}
            >
              {/* Background Image with Carousel - Origin mode for staggered timing */}
              <div className="absolute inset-0 bg-secondary">
                <ImageCarousel 
                  images={images} 
                  alt={card.label} 
                  mode="origin"
                  staggerIndex={index}
                />
                
                {/* Fallback gradient if no images */}
                {images.length === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/30" />
                )}
                
                {/* Zoom effect overlay */}
                <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110" />
                
                {/* Gradient Overlay */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent',
                  'transition-opacity duration-300',
                  'opacity-70 group-hover:opacity-85'
                )} />
              </div>
              
              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-4">
                <h3 className={cn(
                  'font-[family-name:var(--font-playfair)] font-semibold text-white',
                  'transition-transform duration-300',
                  'group-hover:-translate-y-1',
                  compact ? 'text-base md:text-lg' : 'text-lg md:text-xl'
                )}>
                  {card.label}
                </h3>
                <p className={cn(
                  'text-white/80 mt-1',
                  'transition-all duration-300',
                  'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0',
                  compact ? 'text-xs' : 'text-xs md:text-sm'
                )}>
                  {card.description}
                </p>
              </div>

              {/* Arrow indicator */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
