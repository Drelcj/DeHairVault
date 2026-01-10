'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MediaCarouselMode = 'browse' | 'view' | 'origin'

export interface MediaItem {
  type: 'image' | 'video'
  url: string
}

interface MediaCarouselProps {
  images?: string[]
  videos?: string[]
  alt: string
  mode?: MediaCarouselMode
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
 * Check if a URL is a video
 */
function isVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg', '.m4v']
  return videoExtensions.some(ext => url.toLowerCase().includes(ext))
}

/**
 * Get video MIME type from URL
 */
function getVideoMimeType(url: string): string {
  if (url.includes('.mov')) return 'video/quicktime'
  if (url.includes('.webm')) return 'video/webm'
  if (url.includes('.ogg')) return 'video/ogg'
  return 'video/mp4'
}

/**
 * Calculate the rotation interval based on mode and media count
 */
function getIntervalMs(mode: MediaCarouselMode, mediaCount: number, staggerIndex: number = 0): number {
  switch (mode) {
    case 'view':
      // Product detail page: exactly 4 seconds for focused viewing
      return 4000
    
    case 'origin':
      // Origin cards: staggered unique intervals for organic feel
      return ORIGIN_INTERVALS[staggerIndex % ORIGIN_INTERVALS.length]
    
    case 'browse':
    default:
      // Product cards: speed based on media count
      if (mediaCount >= 5) {
        // Many items: faster rotation (1-1.5 seconds)
        return 1000 + Math.random() * 500
      } else {
        // Fewer items: slower rotation (2-3 seconds)
        return 2000 + Math.random() * 1000
      }
  }
}

export function MediaCarousel({ 
  images = [], 
  videos = [],
  alt, 
  mode = 'browse',
  staggerIndex = 0,
  className,
  isActive = true
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [intervalMs, setIntervalMs] = useState<number | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Combine images and videos into a single media array
  // Videos are placed at the beginning for prominence
  const mediaItems: MediaItem[] = [
    ...videos.map(url => ({ type: 'video' as const, url })),
    ...images.map(url => ({ type: 'image' as const, url })),
  ]

  const currentItem = mediaItems[currentIndex]

  // Calculate interval on mount
  useEffect(() => {
    if (mediaItems.length <= 1) return
    setIntervalMs(getIntervalMs(mode, mediaItems.length, staggerIndex))
  }, [mode, mediaItems.length, staggerIndex])

  // Handle video play state
  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true)
    // Clear the auto-rotate interval while video is playing
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const handleVideoEnded = useCallback(() => {
    setIsVideoPlaying(false)
    // Move to next slide after video ends
    if (mode === 'view') {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
        setIsTransitioning(false)
      }, 400)
    }
  }, [mediaItems.length, mode])

  // Handle the carousel rotation
  useEffect(() => {
    if (!isActive || mediaItems.length <= 1 || intervalMs === null) return
    
    // Don't auto-rotate if a video is playing in view mode
    if (mode === 'view' && isVideoPlaying) return

    intervalRef.current = setInterval(() => {
      // Skip rotation if current item is a video that's playing
      if (currentItem?.type === 'video' && isVideoPlaying) return
      
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
        setIsTransitioning(false)
      }, 400)
      
    }, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [mediaItems.length, intervalMs, isActive, mode, isVideoPlaying, currentItem?.type])

  // Reset to first item when becoming inactive
  useEffect(() => {
    if (!isActive) {
      setCurrentIndex(0)
      setIsTransitioning(false)
      setIsVideoPlaying(false)
    }
  }, [isActive])

  // Auto-play video when it becomes current in view mode
  useEffect(() => {
    if (mode === 'view' && currentItem?.type === 'video') {
      const videoEl = videoRefs.current[currentIndex]
      if (videoEl) {
        videoEl.currentTime = 0
        videoEl.play().catch(() => {
          // Autoplay may be blocked - that's okay
        })
      }
    }
  }, [currentIndex, mode, currentItem?.type])

  if (mediaItems.length === 0) {
    return (
      <div className={cn("absolute inset-0 bg-gradient-to-br from-secondary to-muted", className)} />
    )
  }

  // Single item - no carousel needed
  if (mediaItems.length === 1) {
    const item = mediaItems[0]
    
    if (item.type === 'video') {
      return (
        <video
          src={item.url}
          autoPlay
          muted
          loop
          playsInline
          className={cn("w-full h-full object-cover", className)}
        >
          <source src={item.url} type={getVideoMimeType(item.url)} />
        </video>
      )
    }
    
    return (
      <Image
        src={item.url}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }

  // Multiple items - cross-fade carousel
  return (
    <>
      {mediaItems.map((item, index) => {
        const isCurrent = index === currentIndex
        const isNext = index === (currentIndex + 1) % mediaItems.length
        
        if (item.type === 'video') {
          return (
            <video
              key={`video-${item.url}-${index}`}
              ref={(el) => { videoRefs.current[index] = el }}
              src={item.url}
              autoPlay={isCurrent && mode === 'view'}
              muted
              loop={mode !== 'view'} // Loop in browse mode, but not in view mode (so we can advance)
              playsInline
              onPlay={handleVideoPlay}
              onEnded={handleVideoEnded}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out',
                mode === 'view' ? 'duration-1000' : 'duration-700',
                isCurrent && !isTransitioning && 'opacity-100',
                isCurrent && isTransitioning && 'opacity-0',
                isNext && isTransitioning && 'opacity-100',
                !isCurrent && !isNext && 'opacity-0',
                !isCurrent && isNext && !isTransitioning && 'opacity-0',
                className
              )}
            >
              <source src={item.url} type={getVideoMimeType(item.url)} />
            </video>
          )
        }
        
        return (
          <Image
            key={`image-${item.url}-${index}`}
            src={item.url}
            alt={`${alt} - Image ${index + 1}`}
            fill
            className={cn(
              'object-cover transition-opacity ease-in-out',
              mode === 'view' ? 'duration-1000' : 'duration-700',
              isCurrent && !isTransitioning && 'opacity-100',
              isCurrent && isTransitioning && 'opacity-0',
              isNext && isTransitioning && 'opacity-100',
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
      
      {/* Media indicator (only for view mode) */}
      {mode === 'view' && mediaItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(index)
                setIsTransitioning(false)
                setIsVideoPlaying(false)
              }}
              className={cn(
                'h-2 rounded-full transition-all duration-300 flex items-center justify-center',
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/80 w-2',
                item.type === 'video' && index !== currentIndex && 'w-3'
              )}
              aria-label={`Go to ${item.type} ${index + 1}`}
            >
              {item.type === 'video' && index !== currentIndex && (
                <Play className="h-1.5 w-1.5 text-black/50" fill="currentColor" />
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Video playing indicator */}
      {mode === 'view' && currentItem?.type === 'video' && !isVideoPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      )}
    </>
  )
}

export { MediaCarousel as ImageCarousel }
