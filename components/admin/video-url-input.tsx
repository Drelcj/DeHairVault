'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Play, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/input'
import { Label } from '@/components/label'
import { cn } from '@/lib/utils'

interface VideoUrlInputProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

/**
 * Check if a URL is a valid video URL (Cloudinary or direct video file)
 */
function isValidVideoUrl(url: string): boolean {
  if (!url) return false
  
  // Check for common video file extensions
  const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg', '.avi', '.m4v']
  const hasVideoExtension = videoExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  )
  
  // Check for Cloudinary video URLs
  const isCloudinaryVideo = url.includes('cloudinary.com') && 
    (url.includes('/video/') || hasVideoExtension)
  
  return hasVideoExtension || isCloudinaryVideo
}

/**
 * Get video MIME type from URL
 */
function getVideoMimeType(url: string): string {
  if (url.includes('.mov')) return 'video/quicktime'
  if (url.includes('.webm')) return 'video/webm'
  if (url.includes('.ogg')) return 'video/ogg'
  return 'video/mp4' // Default to mp4
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
            <div
              key={`${videoUrl}-${index}`}
              className="relative group rounded-lg overflow-hidden border border-border bg-secondary aspect-video"
            >
              {/* Video Preview */}
              <video
                src={videoUrl}
                muted
                playsInline
                loop
                className="w-full h-full object-cover"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause()
                  e.currentTarget.currentTime = 0
                }}
              >
                <source src={videoUrl} type={getVideoMimeType(videoUrl)} />
                Your browser does not support the video tag.
              </video>

              {/* Play Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-5 w-5 text-foreground ml-0.5" fill="currentColor" />
                </div>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveVideo(index)}
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
