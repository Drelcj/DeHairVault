'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export type CarouselMode = 'browse' | 'view' | 'origin'

interface ImageCarouselProps {
  images: string[]
  alt: string
  mode?: CarouselMode
  /**
   * For origin cards, pass a unique index to create staggered timing
   */
  staggerIndex?: number
  className?: string
  /**
   * Whether the carousel should be active (e.g., on hover for product cards)
   */
  isActive?: boolean
}

// Staggered intervals for origin cards (creating organic, varied feel)
const ORIGIN_INTERVALS = [1300, 1700, 2200, 2900, 1500, 2400]

/**
 * Calculate the rotation interval based on mode and image count
 */
function getIntervalMs(mode: CarouselMode, imageCount: number, staggerIndex: number = 0): number {
  switch (mode) {
    case 'view':
      // Product detail page: exactly 4 seconds for focused viewing
      return 4000
    
    case 'origin':
      // Origin cards: staggered unique intervals for organic feel
      return ORIGIN_INTERVALS[staggerIndex % ORIGIN_INTERVALS.length]
    
    case 'browse':
    default:
      // Product cards: speed based on image count
      if (imageCount >= 5) {
        // Many images: faster rotation (1-1.5 seconds)
        return 1000 + Math.random() * 500
      } else {
        // Fewer images: slower rotation (2-3 seconds)
        return 2000 + Math.random() * 1000
      }
  }
}

export function ImageCarousel({ 
  images, 
  alt, 
  mode = 'browse',
  staggerIndex = 0,
  className,
  isActive = true
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [intervalMs, setIntervalMs] = useState<number | null>(null)

  // Calculate interval on mount (with stable random seed for browse mode)
  useEffect(() => {
    if (images.length <= 1) return
    setIntervalMs(getIntervalMs(mode, images.length, staggerIndex))
  }, [mode, images.length, staggerIndex])

  // Handle the carousel rotation
  useEffect(() => {
    if (!isActive || images.length <= 1 || intervalMs === null) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      // Wait for fade-out, then switch image
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
        setIsTransitioning(false)
      }, 400) // Fade-out duration
      
    }, intervalMs)

    return () => clearInterval(interval)
  }, [images.length, intervalMs, isActive])

  // Reset to first image when becoming inactive
  useEffect(() => {
    if (!isActive) {
      setCurrentIndex(0)
      setIsTransitioning(false)
    }
  }, [isActive])

  if (images.length === 0) {
    return (
      <div className={cn("absolute inset-0 bg-gradient-to-br from-secondary to-muted", className)} />
    )
  }

  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <Image
        src={images[0]}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }

  // Multiple images - cross-fade carousel
  return (
    <>
      {images.map((image, index) => {
        const isCurrent = index === currentIndex
        const isNext = index === (currentIndex + 1) % images.length
        
        return (
          <Image
            key={`${image}-${index}`}
            src={image}
            alt={`${alt} - Image ${index + 1}`}
            fill
            className={cn(
              'object-cover transition-opacity ease-in-out',
              // Longer transition for view mode (focused viewing)
              mode === 'view' ? 'duration-1000' : 'duration-700',
              // Current image visibility
              isCurrent && !isTransitioning && 'opacity-100',
              isCurrent && isTransitioning && 'opacity-0',
              // Next image fades in during transition
              isNext && isTransitioning && 'opacity-100',
              // All other images hidden
              !isCurrent && !isNext && 'opacity-0',
              !isCurrent && isNext && !isTransitioning && 'opacity-0',
              className
            )}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )
      })}
      
      {/* Image counter indicator (only for view mode) */}
      {mode === 'view' && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(index)
                setIsTransitioning(false)
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/80'
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </>
  )
}

/**
 * Hook for managing image carousel state externally
 */
export function useImageCarousel(imageCount: number, mode: CarouselMode = 'browse') {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % imageCount)
  }, [imageCount])
  
  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + imageCount) % imageCount)
  }, [imageCount])
  
  const goTo = useCallback((index: number) => {
    setCurrentIndex(index % imageCount)
  }, [imageCount])
  
  return { currentIndex, next, prev, goTo }
}
