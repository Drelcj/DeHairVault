'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SITE_URL } from '@/lib/seo/metadata'

interface ShareButtonProps {
  /** Path on the canonical origin, e.g. `/shop/brazilian-body-wave`. */
  path: string
  title: string
  className?: string
}

// Opens the native share sheet where the browser has one (iOS, Android, most
// desktop Chrome/Edge/Safari), otherwise copies the link. The URL is always
// built from the canonical www origin so shared links match og:url and don't
// point at a preview deployment or localhost.
export function ShareButton({ path, title, className }: ShareButtonProps) {
  const url = `${SITE_URL}${path}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy the link')
    }
  }

  const handleShare = async () => {
    const shareData = { title, url }

    if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData)
        return
      } catch (error) {
        // The user closed the share sheet; nothing to report.
        if (error instanceof DOMException && error.name === 'AbortError') return
        // Any other failure (e.g. share blocked by the browser) falls back to copying.
      }
    }

    await copyLink()
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn('h-12 w-12', className)}
      aria-label="Share"
      onClick={handleShare}
    >
      <Share2 className="h-5 w-5" />
    </Button>
  )
}
