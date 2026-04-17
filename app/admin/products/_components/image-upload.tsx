"use client"

import { useCallback, useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, ArrowLeft, ArrowRight, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface UploadingFile {
  id: string
  name: string
  preview: string
  status: 'uploading' | 'done' | 'error'
  error?: string
}

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  label?: string
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  label = 'Product Images',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'products')

    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data.url as string
  }, [])

  const processFiles = useCallback(
    async (files: File[]) => {
      const remainingSlots = maxImages - images.length
      if (remainingSlots <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`)
        return
      }

      const toUpload = files
        .filter(f => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type))
        .slice(0, remainingSlots)

      if (toUpload.length === 0) {
        toast.error('No valid image files selected (JPEG, PNG, WEBP, GIF)')
        return
      }

      // Build progress entries with blob preview URLs
      const entries: UploadingFile[] = toUpload.map(f => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        preview: URL.createObjectURL(f),
        status: 'uploading' as const,
      }))

      setUploading(prev => [...prev, ...entries])

      const results = await Promise.allSettled(toUpload.map(f => uploadFile(f)))

      // Compute outcomes OUTSIDE any state updater to avoid StrictMode double-invocation side effects
      const outcomes = entries.map((entry, i) => {
        const result = results[i]
        return result.status === 'fulfilled'
          ? { entry, url: result.value, error: undefined }
          : { entry, url: undefined, error: (result.reason as Error)?.message || 'Upload failed' }
      })

      const newUrls = outcomes.filter(o => o.url != null).map(o => o.url as string)
      const doneIds = new Set(outcomes.filter(o => o.url != null).map(o => o.entry.id))

      // Pure state updater — no side effects
      setUploading(prev =>
        prev.map(entry => {
          const outcome = outcomes.find(o => o.entry.id === entry.id)
          if (!outcome) return entry
          if (outcome.url) return { ...entry, status: 'done' as const }
          return { ...entry, status: 'error' as const, error: outcome.error }
        })
      )

      // Propagate new URLs to the parent form
      if (newUrls.length > 0) {
        onChange([...images, ...newUrls])
      }

      // Revoke blob preview URLs and remove done entries from the progress list
      setTimeout(() => {
        setUploading(prev => {
          prev.filter(e => doneIds.has(e.id)).forEach(e => URL.revokeObjectURL(e.preview))
          return prev.filter(e => !doneIds.has(e.id))
        })
      }, 1500)
    },
    [images, maxImages, onChange, uploadFile]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return
      processFiles(Array.from(files))
      e.target.value = ''
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      processFiles(files)
    },
    [processFiles]
  )

  const handleAddUrl = useCallback(() => {
    const url = urlInput.trim()
    if (!url) return

    try {
      new URL(url)
    } catch {
      toast.error('Invalid URL')
      return
    }

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    onChange([...images, url])
    setUrlInput('')
  }, [images, maxImages, onChange, urlInput])

  const handleRemove = useCallback(
    (index: number) => onChange(images.filter((_, i) => i !== index)),
    [images, onChange]
  )

  const handleReorder = useCallback(
    (fromIndex: number, direction: 'up' | 'down') => {
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
      if (toIndex < 0 || toIndex >= images.length) return
      const next = [...images]
      const [item] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, item)
      onChange(next)
    },
    [images, onChange]
  )

  const isFull = images.length >= maxImages
  const isUploading = uploading.some(u => u.status === 'uploading')

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isFull && fileInputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          isFull
            ? 'cursor-not-allowed border-border opacity-50'
            : 'cursor-pointer border-border hover:border-accent hover:bg-accent/5',
          isDragging && !isFull ? 'border-accent bg-accent/10' : '',
        ].join(' ')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          disabled={isFull || isUploading}
          className="sr-only"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragging ? 'Drop to upload' : 'Drag & drop images here'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse · JPEG, PNG, WEBP, GIF · max 10MB each
          </p>
        </div>
        {isFull && (
          <p className="text-xs text-muted-foreground">Maximum images reached</p>
        )}
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Paste an image URL instead..."
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
            disabled={isFull}
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || isFull}
        >
          Add URL
        </Button>
      </div>

      {/* In-progress uploads */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map(entry => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
            >
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                <img src={entry.preview} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{entry.name}</p>
                {entry.status === 'uploading' && (
                  <p className="text-xs text-muted-foreground">Uploading to Cloudinary…</p>
                )}
                {entry.status === 'done' && (
                  <p className="text-xs text-green-600 dark:text-green-400">Uploaded</p>
                )}
                {entry.status === 'error' && (
                  <p className="text-xs text-destructive">{entry.error}</p>
                )}
              </div>
              {entry.status === 'uploading' && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent flex-shrink-0" />
              )}
              {entry.status === 'error' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() =>
                    setUploading(prev => prev.filter(e => e.id !== entry.id))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                className="object-cover"
                onError={e => {
                  ;(e.target as HTMLImageElement).src = '/placeholder.svg'
                }}
              />
              {index === 0 && (
                <span className="absolute top-1 left-1 rounded bg-accent px-1.5 py-0.5 text-xs font-medium text-accent-foreground">
                  Main
                </span>
              )}
              {/* Hover controls */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                  title="Move left"
                >
                  <ArrowLeft className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleReorder(index, 'down')}
                  disabled={index === images.length - 1}
                  title="Move right"
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemove(index)}
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} images · First image is the main thumbnail
      </p>
    </div>
  )
}
