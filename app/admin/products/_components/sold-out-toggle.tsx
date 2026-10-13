'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PackageCheck, PackageX } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { setProductSoldOut } from '@/lib/actions/products'

interface SoldOutToggleProps {
  productId: string
  productName: string
  isSoldOut: boolean
  className?: string
}

export function SoldOutToggle({ productId, productName, isSoldOut, className }: SoldOutToggleProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      const result = await setProductSoldOut(productId, !isSoldOut)

      if (result.success) {
        toast.success(isSoldOut ? `"${productName}" is back in stock` : `"${productName}" marked sold out`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update product')
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={cn('h-auto gap-1.5 rounded-lg px-3 py-1.5 text-xs', className)}
    >
      {isSoldOut ? <PackageCheck className="h-3.5 w-3.5" /> : <PackageX className="h-3.5 w-3.5" />}
      {isPending ? 'Saving...' : isSoldOut ? 'Back in stock' : 'Mark sold out'}
    </Button>
  )
}
