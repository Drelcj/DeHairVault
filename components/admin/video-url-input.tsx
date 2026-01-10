'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Play, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/input'
import { Label } from '@/components/label'
import { cn } from '@/lib/utils'
import { getWebCompatibleVideoUrl, isValidVideoUrl } from '@/lib/utils/cloudinary-video'

interface VideoUrlInputProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

/**
 * VideoPreview Component - Handles video preview with loading states
 */
function VideoPreview({ 
  url, 
  index, 
  onRemove, 
  disabled 
}: { 
  url: string
  index: number
  onRemove: () => void
  disabled: boolean 
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Transform URL for web compatibility
  const compatibleUrl = getWebCompatibleVideoUrl(url)

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border bg-secondary aspect-square">
      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary z-10">
          <Loader2 className="h-6 w-6 text-accent animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary z-10">
          <div className="flex flex-col items-center gap-1 text-center px-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Preview unavailable</span>
          </div>
        </div>
      )}

      {/* Video Preview */}
      <video
        src={compatibleUrl}
        muted
        playsInline
        loop
        preload="metadata"
        className={cn(
          "w-full h-full object-contain transition-opacity",
          (isLoading || hasError) ? "opacity-0" : "opacity-100"
        )}
        onLoadedData={() => {
          setIsLoading(false)
          setHasError(false)
        }}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        onMouseEnter={(e) => e.currentTarget.play()}
        onMouseLeave={(e) => {
          e.currentTarget.pause()
          e.currentTarget.currentTime = 0
        }}
      />

      {/* Play Icon Overlay */}
      {!isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="h-5 w-5 text-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={cn(
          'absolute top-2 right-2 w-8 h-8 rounded-full',
          'bg-destructive text-destructive-foreground',
          'flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-destructive/90',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Video Index Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
        Video {index + 1}
      </div>
    </div>
  )
}

export function VideoUrlInput({ value = [], onChange, disabled = false }: VideoUrlInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddVideo = () => {
    const trimmedUrl = inputValue.trim()
    
    if (!trimmedUrl) {
      setError('Please enter a video URL')
      return
    }

    if (!isValidVideoUrl(trimmedUrl)) {
      setError('Please enter a valid video URL (.mp4, .mov, .webm, or Cloudinary video)')
      return
    }

    if (value.includes(trimmedUrl)) {
      setError('This video has already been added')
      return
    }

    onChange([...value, trimmedUrl])
    setInputValue('')
    setError(null)
    inputRef.current?.focus()
  }

  const handleRemoveVideo = (index: number) => {
    const newVideos = value.filter((_, i) => i !== index)
    onChange(newVideos)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddVideo()
    }
  }

  return (
    <div className="space-y-4">
      <Label>Product Videos</Label>
      
      {/* Input Section */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="url"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Paste Cloudinary video URL (.mp4, .mov)"
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAddVideo}
          disabled={disabled || !inputValue.trim()}
          variant="outline"
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Video Preview Gallery */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((videoUrl, index) => (
            <VideoPreview
              key={`${videoUrl}-${index}`}
              url={videoUrl}
              index={index}
              onRemove={() => handleRemoveVideo(index)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground">
          <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No videos added yet</p>
          <p className="text-xs mt-1">Paste a Cloudinary video URL above to add product videos</p>
        </div>
      )}
    </div>
  )
}
