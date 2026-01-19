'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OriginCard {
  origin: string
  label: string
  image: string
  description: string
}

const originCards: OriginCard[] = [
  {
    origin: 'CHINA',
    label: 'Chinese',
    image: '/origins/china.jpg',
    description: 'Silky & Versatile',
  },
  {
    origin: 'VIETNAM',
    label: 'Vietnamese',
    image: '/origins/vietnam.jpg',
    description: 'Thick & Lustrous',
  },
  {
    origin: 'CAMBODIA',
    label: 'Cambodian',
    image: '/origins/cambodia.jpg',
    description: 'Natural & Soft',
  },
  {
    origin: 'BURMA',
    label: 'Burmese',
    image: '/origins/burma.jpg',
    description: 'Raw & Premium',
  },
  {
    origin: 'PHILIPPINES',
    label: 'Filipino',
    image: '/origins/philippines.jpg',
    description: 'Smooth & Durable',
  },
  {
    origin: 'INDIA',
    label: 'Indian',
    image: '/origins/india.jpg',
    description: 'Classic & Reliable',
  },
]

interface OriginFilterCardsProps {
  selectedOrigin: string | null
  onOriginChange: (origin: string | null) => void
}

export function OriginFilterCards({ selectedOrigin, onOriginChange }: OriginFilterCardsProps) {
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-medium text-foreground mb-2">
          Shop by Origin
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Discover premium hair from around the world
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {originCards.map((card) => {
          const isSelected = selectedOrigin === card.origin
          
          return (
            <button
              key={card.origin}
              onClick={() => onOriginChange(isSelected ? null : card.origin)}
              className={cn(
                'group relative aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                isSelected 
                  ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' 
                  : 'hover:shadow-xl'
              )}
            >
              {/* Background Image with Zoom Effect */}
              <div className="absolute inset-0 bg-secondary">
                <Image
                  src={card.image}
                  alt={card.label}
                  fill
                  className={cn(
                    'object-cover transition-transform duration-500 ease-out',
                    'group-hover:scale-110',
                    isSelected && 'scale-105'
                  )}
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
                {/* Gradient Overlay */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent',
                  'transition-opacity duration-300',
                  isSelected ? 'opacity-90' : 'opacity-70 group-hover:opacity-80'
                )} />
              </div>
              
              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-4">
                <h3 className={cn(
                  'font-[family-name:var(--font-playfair)] text-lg md:text-xl font-semibold text-white',
                  'transition-transform duration-300',
                  'group-hover:-translate-y-1'
                )}>
                  {card.label}
                </h3>
                <p className={cn(
                  'text-xs md:text-sm text-white/80 mt-1',
                  'transition-all duration-300',
                  'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0',
                  isSelected && 'opacity-100 translate-y-0'
                )}>
                  {card.description}
                </p>
                
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
      
      {/* Clear Filter Button */}
      {selectedOrigin && (
        <div className="mt-6 text-center">
          <button
            onClick={() => onOriginChange(null)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear origin filter
          </button>
        </div>
      )}
    </div>
  )
}
