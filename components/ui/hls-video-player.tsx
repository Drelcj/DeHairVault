'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, PictureInPicture2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlayerState = 'loading' | 'ready' | 'playing' | 'paused' | 'error'

// Vendor-prefixed fullscreen APIs: Safari on iPad/macOS (webkit*Fullscreen on
// elements) and iPhone, which can only fullscreen the <video> element itself.
interface WebkitDocument extends Document {
  webkitFullscreenElement?: Element | null
  webkitFullscreenEnabled?: boolean
  webkitExitFullscreen?: () => void
}

interface WebkitElement extends HTMLElement {
  webkitRequestFullscreen?: () => void
}

interface WebkitVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void
}

interface HlsVideoPlayerProps {
  /** Full CloudFront .m3u8 URL of a single rendition, e.g. .../hls/{basename}-1080p.m3u8 */
  src: string
  /** Image shown before playback starts */
  poster?: string
  /** Shown in aria labels and error messages */
  title?: string
  /** Auto-play when 50 %+ of the player is in the viewport (desktop only) */
  autoplayOnScroll?: boolean
  /** Start muted — required for autoplay to work in most browsers */
  muted?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HlsVideoPlayer({
  src,
  poster,
  title = 'Product video',
  autoplayOnScroll = true,
  muted: initialMuted = true,
  className,
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hlsRef = useRef<any>(null)
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playerState, setPlayerState] = useState<PlayerState>('loading')
  const [isMuted, setIsMuted] = useState(initialMuted)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isPiP, setIsPiP] = useState(false)
  const [isPiPSupported, setIsPiPSupported] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  // Width / height of the actual video frames; 16:9 until metadata arrives
  const [aspectRatio, setAspectRatio] = useState(16 / 9)

  // ── HLS initialisation ───────────────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    let destroyed = false

    async function initPlayer() {
      // Dynamic import keeps hls.js out of the SSR bundle
      const HlsModule = await import('hls.js')
      const Hls = HlsModule.default

      if (destroyed) return

      if (Hls.isSupported()) {
        // Chrome, Firefox, Edge, Android — use hls.js
        const hls = new Hls({
          // Start on the lowest quality to load fast, let ABR climb
          startLevel: -1,
          // Keep the buffer small on mobile / slow connections
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          // Aggressive ABR: switch up when bandwidth allows
          abrEwmaFastLive: 3,
          abrEwmaSlowLive: 9,
          abrBandWidthFactor: 0.95,
        })

        hls.loadSource(src)
        hls.attachMedia(video!)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setPlayerState('ready')
        })

        hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal: boolean; type: string; details: string }) => {
          if (data.fatal) {
            setPlayerState('error')
            setErrorMessage('Video failed to load. Please refresh the page.')
          }
        })

        hlsRef.current = hls
      } else if (video!.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari — native HLS support
        video!.src = src
        video!.addEventListener('loadedmetadata', () => setPlayerState('ready'), { once: true })
      } else {
        setPlayerState('error')
        setErrorMessage('Your browser does not support HLS video.')
      }
    }

    initPlayer()

    return () => {
      destroyed = true
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [src])

  // ── PiP support detection ────────────────────────────────────────────────

  useEffect(() => {
    setIsPiPSupported(
      typeof document !== 'undefined' &&
        'pictureInPictureEnabled' in document &&
        document.pictureInPictureEnabled
    )
  }, [])

  // ── Viewport-based autoplay (desktop only) ───────────────────────────────

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container || !autoplayOnScroll || playerState === 'loading') return

    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    if (!isDesktop) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.muted = true
            setIsMuted(true)
            video.play().catch(() => {
              // Autoplay blocked — user must interact first
            })
          } else if (!isPiP) {
            video.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [autoplayOnScroll, playerState, isPiP])

  // ── PiP event listeners ──────────────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const enter = () => setIsPiP(true)
    const leave = () => setIsPiP(false)

    video.addEventListener('enterpictureinpicture', enter)
    video.addEventListener('leavepictureinpicture', leave)
    return () => {
      video.removeEventListener('enterpictureinpicture', enter)
      video.removeEventListener('leavepictureinpicture', leave)
    }
  }, [])

  // ── Fullscreen event listeners ───────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    const doc = document as WebkitDocument
    const syncElementFullscreen = () => {
      const el = doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null
      setIsFullscreen(el === container || el === video)
    }
    // iPhone: native video fullscreen fires its own events
    const enterNative = () => setIsFullscreen(true)
    const leaveNative = () => setIsFullscreen(false)

    document.addEventListener('fullscreenchange', syncElementFullscreen)
    document.addEventListener('webkitfullscreenchange', syncElementFullscreen)
    video.addEventListener('webkitbeginfullscreen', enterNative)
    video.addEventListener('webkitendfullscreen', leaveNative)
    return () => {
      document.removeEventListener('fullscreenchange', syncElementFullscreen)
      document.removeEventListener('webkitfullscreenchange', syncElementFullscreen)
      video.removeEventListener('webkitbeginfullscreen', enterNative)
      video.removeEventListener('webkitendfullscreen', leaveNative)
    }
  }, [])

  // ── Video event handlers ─────────────────────────────────────────────────

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(video.currentTime)

    // Calculate buffered end
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1))
    }
  }, [])

  // Fires on loadedmetadata and whenever an ABR switch changes the frame size
  const handleResize = useCallback(() => {
    const video = videoRef.current
    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      setAspectRatio(video.videoWidth / video.videoHeight)
    }
  }, [])

  const handleDurationChange = useCallback(() => {
    const video = videoRef.current
    if (video) setDuration(video.duration)
  }, [])

  const handlePlay = useCallback(() => setPlayerState('playing'), [])
  const handlePause = useCallback(() => setPlayerState('paused'), [])
  const handleVolumeChange = useCallback(() => {
    const video = videoRef.current
    if (video) {
      setIsMuted(video.muted)
      setVolume(video.volume)
    }
  }, [])

  // ── Control actions ──────────────────────────────────────────────────────

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.paused ? video.play() : video.pause()
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Number(e.target.value)
  }, [])

  const handleVolumeSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const val = Number(e.target.value)
    video.volume = val
    video.muted = val === 0
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current as WebkitElement | null
    const video = videoRef.current as WebkitVideoElement | null
    if (!container || !video) return
    const doc = document as WebkitDocument

    try {
      if (doc.fullscreenElement) {
        await doc.exitFullscreen()
      } else if (doc.webkitFullscreenElement) {
        doc.webkitExitFullscreen?.()
      } else if (doc.fullscreenEnabled && container.requestFullscreen) {
        // Desktop + Android: fullscreen the container so our controls come along
        await container.requestFullscreen()
      } else if (doc.webkitFullscreenEnabled && container.webkitRequestFullscreen) {
        // Older Safari / iPad
        container.webkitRequestFullscreen()
      } else if (video.webkitEnterFullscreen) {
        // iPhone: only the <video> element can go fullscreen (native controls)
        video.webkitEnterFullscreen()
      }
    } catch {
      // Fullscreen rejected — browser may require a user gesture
    }
  }, [])

  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video || !isPiPSupported) return
    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture()
      } else {
        await video.requestPictureInPicture()
      }
    } catch {
      // PiP rejected — browser may require user gesture or secure context
    }
  }, [isPiPSupported])

  // ── Auto-hide controls ───────────────────────────────────────────────────

  const revealControls = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = setTimeout(() => {
      if (playerState === 'playing') setShowControls(false)
    }, 2500)
  }, [playerState])

  // Keep controls visible while paused
  useEffect(() => {
    if (playerState !== 'playing') {
      setShowControls(true)
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    }
  }, [playerState])

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    }
  }, [])

  // ── Derived values ───────────────────────────────────────────────────────

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      onMouseMove={revealControls}
      onMouseLeave={() => playerState === 'playing' && setShowControls(false)}
      onTouchStart={revealControls}
      onClick={() => {
        if (playerState === 'ready' || playerState === 'paused' || playerState === 'playing') {
          togglePlay()
        }
      }}
      className={cn(
        // Sized to the video's own aspect ratio: full column width, but never
        // taller than 80% (mobile) / 70% (desktop) of the viewport, so vertical
        // videos stay vertical and uncropped. Fullscreen UA styles override this.
        'group @container relative mx-auto overflow-hidden rounded-xl bg-black select-none',
        'w-[min(100%,calc(80svh*var(--video-ratio)))] lg:w-[min(100%,calc(70vh*var(--video-ratio)))]',
        className
      )}
      style={{ aspectRatio, '--video-ratio': aspectRatio } as React.CSSProperties}
    >
      {/* ── Video element ─────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        playsInline
        muted={initialMuted}
        preload="metadata"
        poster={poster}
        aria-label={title}
        onLoadedMetadata={handleResize}
        onResize={handleResize}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onPlay={handlePlay}
        onPause={handlePause}
        onVolumeChange={handleVolumeChange}
        onWaiting={() => setPlayerState('loading')}
        onCanPlay={() =>
          setPlayerState((prev) => (prev === 'loading' ? 'ready' : prev))
        }
      />

      {/* ── Loading spinner ────────────────────────────────────────────── */}
      {playerState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        </div>
      )}

      {/* ── Error state ────────────────────────────────────────────────── */}
      {playerState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
          <Play className="h-10 w-10 text-white/40" />
          <p className="text-sm text-white/70">{errorMessage}</p>
        </div>
      )}

      {/* ── Centre play/pause indicator (brief flash) ──────────────────── */}
      {playerState === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay() }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110"
            aria-label="Play"
          >
            <Play className="h-7 w-7 translate-x-0.5 text-white" fill="white" />
          </button>
        </div>
      )}

      {/* ── Controls overlay ───────────────────────────────────────────── */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 @sm:px-4',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Seek bar */}
        <div className="relative mb-2 h-1 w-full">
          {/* Buffered track */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/25"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Progress track */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Seek"
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-accent shadow"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Bottom row */}
        <div className="flex min-w-0 items-center gap-1 @sm:gap-2">
          {/* Play / pause */}
          <button
            onClick={togglePlay}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label={playerState === 'playing' ? 'Pause' : 'Play'}
          >
            {playerState === 'playing' ? (
              <Pause className="h-4 w-4" fill="white" />
            ) : (
              <Play className="h-4 w-4 translate-x-px" fill="white" />
            )}
          </button>

          {/* Volume */}
          <button
            onClick={toggleMute}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeSlider}
            onClick={(e) => e.stopPropagation()}
            className="w-16 cursor-pointer accent-accent pointer-coarse:hidden @max-sm:hidden"
            aria-label="Volume"
          />

          {/* Timestamp */}
          <span className="ml-1 min-w-0 truncate text-xs tabular-nums text-white/70">
            {formatTime(currentTime)}
            <span className="text-white/40"> / </span>
            {formatTime(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* PiP */}
          {isPiPSupported && (
            <button
              onClick={(e) => { e.stopPropagation(); togglePiP() }}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors @max-sm:hidden',
                isPiP && 'text-accent'
              )}
              aria-label={isPiP ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'}
            >
              <PictureInPicture2 className="h-4 w-4" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
