"use client"

import { Children, useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { motion, useReducedMotion, type PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AUTOPLAY_MS = 7000
const SWIPE_THRESHOLD_PX = 60

interface HeroCarouselProps {
  children: ReactNode
  /** Accessible name for each slide, in the same order as children */
  slideLabels: string[]
}

/**
 * Homepage hero carousel. Every slide is rendered (so all hero content is in
 * the server HTML) and stacked in one grid cell; only the active one is
 * visible and reachable — the rest are `inert`.
 *
 * Follows the WAI-ARIA carousel pattern: rotation pauses on hover / keyboard
 * focus, has a persistent pause button, and never starts for visitors who
 * prefer reduced motion.
 */
export function HeroCarousel({ children, slideLabels }: HeroCarouselProps) {
  const slides = Children.toArray(children)
  const count = slides.length
  const prefersReducedMotion = useReducedMotion()

  const [index, setIndex] = useState(0)
  // Persistent pause, set by the pause button (or reduced-motion preference)
  const [userPaused, setUserPaused] = useState(false)
  // Temporary pause while the pointer is over the hero or focus is inside it
  const [hoverPaused, setHoverPaused] = useState(false)
  const [focusPaused, setFocusPaused] = useState(false)
  const draggedRef = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion) setUserPaused(true)
  }, [prefersReducedMotion])

  const goTo = useCallback((next: number) => setIndex(((next % count) + count) % count), [count])
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count])
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count])

  const playing = !userPaused && !hoverPaused && !focusPaused

  useEffect(() => {
    if (!playing || count < 2) return
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") next()
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [playing, count, next, index])

  if (count === 0) return null
  if (count === 1) return <>{slides[0]}</>

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      next()
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      prev()
    }
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_THRESHOLD_PX) next()
    else if (info.offset.x >= SWIPE_THRESHOLD_PX) prev()
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setFocusPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusPaused(false)
      }}
    >
      <motion.div
        // aria-live is off while rotating so screen readers aren't interrupted
        aria-live={playing ? "off" : "polite"}
        className="grid touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        dragSnapToOrigin
        onDragStart={() => {
          draggedRef.current = true
        }}
        onDragEnd={handleDragEnd}
        onClickCapture={(e) => {
          // A swipe that ends on a link must not also follow it
          if (draggedRef.current) {
            e.preventDefault()
            e.stopPropagation()
            draggedRef.current = false
          }
        }}
        onPointerDown={() => {
          draggedRef.current = false
        }}
      >
        {slides.map((slide, i) => {
          const active = i === index
          return (
            <motion.div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${slideLabels[i] ?? ""}`}
              aria-hidden={!active}
              inert={!active}
              className={cn("col-start-1 row-start-1", !active && "pointer-events-none")}
              initial={false}
              animate={{ opacity: active ? 1 : 0, zIndex: active ? 1 : 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: "easeInOut" }}
            >
              {slide}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Controls */}
      <div className="absolute bottom-4 lg:bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-3 px-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? "Start slide rotation" : "Pause slide rotation"}
          className="h-9 w-9 rounded-full bg-background/70 backdrop-blur-sm"
        >
          {userPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={prev}
          aria-label="Previous slide"
          className="h-9 w-9 rounded-full bg-background/70 backdrop-blur-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {slides.map((_, i) => (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}: ${slideLabels[i] ?? ""}`}
              aria-current={i === index ? "true" : undefined}
              className="group h-8 w-8 rounded-full hover:bg-transparent"
            >
              <span
                className={cn(
                  "block h-2 rounded-full transition-all duration-300",
                  i === index ? "w-6 bg-accent" : "w-2 bg-foreground/30 group-hover:bg-foreground/60",
                )}
              />
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={next}
          aria-label="Next slide"
          className="h-9 w-9 rounded-full bg-background/70 backdrop-blur-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}
