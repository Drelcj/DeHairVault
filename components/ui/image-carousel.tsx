'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export type CarouselMode = 'browse' | 'view' | 'origin' | 'card'

interface ImageCarouselProps {
  images: string[]
  alt: string
  mode?: CarouselMode
  /**
   * For origin/card modes, pass a unique index to create staggered timing
   */
  staggerIndex?: number
  className?: string
  /**
   * Whether the carousel should be active
   * - For 'browse' mode: carousel runs only when isActive=true
   * - For 'card' mode: carousel runs continuously, pauses when isActive=false (hover pause)
   * - For 'view'/'origin' modes: always runs
   */
  isActive?: boolean
}

// Staggered intervals for origin cards (creating organic, varied feel)
const ORIGIN_INTERVALS = [1300, 1700, 2200, 2900, 1500, 2400]

// Staggered start delays for card mode (0-500ms offsets)
const CARD_START_DELAYS = [0, 150, 80, 230, 120, 180, 50, 280, 170, 90]

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
    
    case 'card':
      // Product cards (continuous): density-based timing
      if (imageCount >= 5) {
        // Many images: faster rotation (1.0-1.5s) with slight variation per card
        return 1000 + (staggerIndex % 5) * 100
      } else {
        // Fewer images: slower rotation (2.0-3.0s) with variation
        return 2000 + (staggerIndex % 5) * 200
      }
    
    case 'browse':
    default:
      // Legacy browse mode (hover-activated)
      if (imageCount >= 5) {
        return 1000 + Math.random() * 500
      } else {
        return 2000 + Math.random() * 1000
      }
  }
}

/**
 * Get staggered start delay for natural feel (prevents all cards flipping at once)
 */
function getStartDelay(staggerIndex: number): number {
  return CARD_START_DELAYS[staggerIndex % CARD_START_DELAYS.length]
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
  const [hasStarted, setHasStarted] = useState(false)

  // Calculate interval on mount (with stable values for consistent timing)
  useEffect(() => {
    if (images.length <= 1) return
    setIntervalMs(getIntervalMs(mode, images.length, staggerIndex))
  }, [mode, images.length, staggerIndex])

  // Staggered start delay for 'card' mode (natural, organic feel)
  useEffect(() => {
    if (mode !== 'card' || images.length <= 1) {
      setHasStarted(true)
      return
    }
    
    const startDelay = getStartDelay(staggerIndex)
    const timer = setTimeout(() => setHasStarted(true), startDelay)
    return () => clearTimeout(timer)
  }, [mode, staggerIndex, images.length])

  // Determine if carousel should be running
  const shouldRun = useMemo(() => {
    if (images.length <= 1 || intervalMs === null || !hasStarted) return false
    
    switch (mode) {
      case 'card':
        // Card mode: runs continuously, pauses when NOT hovered (isActive=false means paused)
        // Actually we want: runs always, pauses on hover
        // So isActive=true means "user is hovering" = pause
        // Wait, that's backwards. Let me think...
        // isActive for card mode: true = not hovering (run), false = hovering (pause)
        return isActive
      case 'browse':
        // Browse mode: only runs when hovered (isActive=true)
        return isActive
      case 'view':
      case 'origin':
        // Always runs
        return true
      default:
        return isActive
    }
  }, [mode, isActive, images.length, intervalMs, hasStarted])

  // Handle the carousel rotation
  useEffect(() => {
    if (!shouldRun) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      // Wait for fade-out, then switch image
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
        setIsTransitioning(false)
      }, 400) // Fade-out duration
      
    }, intervalMs!)

    return () => clearInterval(interval)
  }, [images.length, intervalMs, shouldRun])

  // Reset to first image when becoming inactive (only for browse mode)
  useEffect(() => {
    if (mode === 'browse' && !isActive) {
      setCurrentIndex(0)
      setIsTransitioning(false)
    }
  }, [isActive, mode])

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
