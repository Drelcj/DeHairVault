'use client'

import { useCurrency } from '@/contexts/currency-context'
import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  amountGbp: number
  showOriginal?: boolean
  className?: string
  originalClassName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

export function PriceDisplay({
  amountGbp,
  showOriginal = false,
  className,
  originalClassName,
  size = 'md',
}: PriceDisplayProps) {
  const { formatPrice, currency } = useCurrency()

  return (
    <span className={cn(sizeClasses[size], 'font-medium', className)}>
      {formatPrice(amountGbp)}
      {showOriginal && currency !== 'GBP' && (
        <span className={cn('text-muted-foreground text-sm ml-1', originalClassName)}>
          (£{amountGbp.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
        </span>
      )}
    </span>
  )
}

interface CompareAtPriceProps {
  basePrice: number
  compareAtPrice: number | null
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function CompareAtPrice({
  basePrice,
  compareAtPrice,
  className,
  size = 'md',
}: CompareAtPriceProps) {
  const { formatPrice } = useCurrency()

  if (!compareAtPrice || compareAtPrice <= basePrice) {
    return <PriceDisplay amountGbp={basePrice} className={className} size={size} />
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <PriceDisplay amountGbp={basePrice} size={size} />
      <span className="text-sm text-muted-foreground line-through">
        {formatPrice(compareAtPrice)}
      </span>
    </div>
  )
}
