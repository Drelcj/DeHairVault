'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, FileVideo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getVideoUploadPresignedUrl, startVideoTranscoding } from '@/lib/actions/video-upload'

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
]

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'error'

interface VideoUploadProps {
  /** Called after MediaConvert job is successfully queued. Receives the HLS output key prefix. */
  onUploadComplete?: (outputKeyPrefix: string) => void
  /** Product ID — required in edit mode so the server action can persist status immediately. */
  productId?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function VideoUpload({ onUploadComplete, productId }: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const resetState = useCallback(() => {
    xhrRef.current?.abort()
    setStatus('idle')
    setProgress(0)
    setSelectedFile(null)
    setErrorMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      setErrorMessage(null)

      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        setErrorMessage('Unsupported file type. Allowed: MP4, MOV, AVI, MKV, WebM.')
        setStatus('error')
        return
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`File is too large (${formatBytes(file.size)}). Maximum size is 500 MB.`)
        setStatus('error')
        return
      }

      setSelectedFile(file)
      setStatus('uploading')
      setProgress(0)

      const result = await getVideoUploadPresignedUrl(file.name, file.type, file.size)

      if (!result.success) {
        setErrorMessage(result.error)
        setStatus('error')
        return
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

        xhr.open('PUT', result.uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      }).then(async () => {
        setProgress(100)
        setStatus('processing')

        const transcodeResult = await startVideoTranscoding(result.s3Key, productId)

        if (!transcodeResult.success) {
          setErrorMessage(`Transcoding could not start: ${transcodeResult.error}`)
          setStatus('error')
          toast.error('Upload succeeded but transcoding failed. Please try again.')
          return
        }

        toast.success('Video uploaded — transcoding job queued.')
        onUploadComplete?.(transcodeResult.outputKeyPrefix)
      }).catch((err: Error) => {
        if (err.message === 'Upload cancelled') {
          setStatus('idle')
        } else {
          setErrorMessage(err.message)
          setStatus('error')
          toast.error('Upload failed. Please try again.')
        }
      })
    },
    [onUploadComplete]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) uploadFile(file)
      e.target.value = ''
    },
    [uploadFile]
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
      const file = e.dataTransfer.files?.[0]
      if (file) uploadFile(file)
    },
    [uploadFile]
  )

  return (
    <div className="space-y-3">
      {/* Drop zone — hidden while uploading or processing */}
      {status === 'idle' || status === 'error' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={[
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
            isDragging
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-accent hover:bg-accent/5',
          ].join(' ')}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_VIDEO_TYPES.join(',')}
            onChange={handleFileChange}
            className="sr-only"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileVideo className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragging ? 'Drop video to upload' : 'Drag & drop a video here'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse · MP4, MOV, AVI, MKV, WebM · max 500 MB
            </p>
          </div>
        </div>
      ) : null}

      {/* Error state */}
      {status === 'error' && errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
          <p className="flex-1 text-xs text-destructive">{errorMessage}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 text-destructive hover:text-destructive"
            onClick={resetState}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload progress */}
      {(status === 'uploading' || status === 'processing') && selectedFile && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <FileVideo className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
            </div>
            {status === 'uploading' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={resetState}
                title="Cancel upload"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {status === 'uploading' && (
            <>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">{progress}%</p>
            </>
          )}

          {status === 'processing' && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent shrink-0" />
              <p className="text-xs font-medium text-muted-foreground">
                Processing… your video is being transcoded for streaming.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
