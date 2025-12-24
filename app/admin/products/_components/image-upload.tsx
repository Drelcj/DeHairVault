"use client"

import { useCallback, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  label?: string
}

export function ImageUpload({ images, onChange, maxImages = 10, label = 'Product Images' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'products')

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Upload failed')
    }

    return data.url as string
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      setUploading(true)
      setError(null)

      const remainingSlots = maxImages - images.length
      const filesToUpload = Array.from(files).slice(0, remainingSlots)

      try {
        const uploadedUrls = await Promise.all(filesToUpload.map(uploadFile))
        onChange([...images, ...uploadedUrls])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [images, maxImages, onChange, uploadFile]
  )

  const handleAddUrl = useCallback(() => {
    const url = urlInput.trim()
    if (!url) return

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError('Invalid URL format')
      return
    }

    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    onChange([...images, url])
    setUrlInput('')
    setError(null)
  }, [images, maxImages, onChange, urlInput])

  const handleRemove = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index)
      onChange(newImages)
    },
    [images, onChange]
  )

  const handleReorder = useCallback(
    (fromIndex: number, direction: 'up' | 'down') => {
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
      if (toIndex < 0 || toIndex >= images.length) return

      const newImages = [...images]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      onChange(newImages)
    },
    [images, onChange]
  )

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* Upload Section */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileChange}
            disabled={uploading || images.length >= maxImages}
            className="cursor-pointer"
          />
        </div>
        <span className="text-muted-foreground self-center">or</span>
        <div className="flex-1 min-w-[200px] flex gap-2">
          <Input
            type="url"
            placeholder="Paste image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
            disabled={images.length >= maxImages}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddUrl}
            disabled={!urlInput.trim() || images.length >= maxImages}
          >
            Add
          </Button>
        </div>
      </div>

      {uploading && (
        <p className="text-sm text-muted-foreground">Uploading...</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group rounded-lg border overflow-hidden aspect-square bg-muted"
            >
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/placeholder.svg'
                }}
              />
              {index === 0 && (
                <span className="absolute top-1 left-1 text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                  className="h-7 w-7 p-0"
                  title="Move left"
                >
                  ←
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleReorder(index, 'down')}
                  disabled={index === images.length - 1}
                  className="h-7 w-7 p-0"
                  title="Move right"
                >
                  →
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="h-7 w-7 p-0"
                  title="Remove"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} images. First image will be the thumbnail. Max 5MB per image.
      </p>
    </div>
  )
}
