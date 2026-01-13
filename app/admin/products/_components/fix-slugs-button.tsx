'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { fixAllProductSlugsAction } from '../actions'

/**
 * Temporary button to fix all product slugs in the database.
 * This normalizes legacy slugs (mixed case, spaces) to URL-safe format.
 * Remove this component after migration is complete.
 */
export function FixSlugsButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleFixSlugs = () => {
    const confirmed = window.confirm(
      'Are you sure you want to normalize all product slugs?\n\n' +
      'This will update your database to convert slugs like:\n' +
      '• "Raw-Indian-curly hair" → "raw-indian-curly-hair"\n' +
      '• "Premium STRAIGHT Hair" → "premium-straight-hair"\n\n' +
      'This action cannot be undone.'
    )

    if (!confirmed) return

    startTransition(async () => {
      try {
        const result = await fixAllProductSlugsAction()
        
        if (result.success) {
          toast.success(result.message || 'All slugs normalized successfully!')
          router.refresh()
        } else {
          toast.error(result.error || 'Failed to fix slugs')
        }
      } catch (error) {
        console.error('Error fixing slugs:', error)
        toast.error('An unexpected error occurred')
      }
    })
  }

  return (
    <button
      onClick={handleFixSlugs}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Normalize all product slugs for URL compatibility"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Fixing...
        </>
      ) : (
        <>
          <Wrench className="h-4 w-4" />
          Fix All Slugs
        </>
      )}
    </button>
  )
}
