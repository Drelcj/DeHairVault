'use client'

import { useCurrency } from '@/contexts/currency-context'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show GBP on server and initial client render to avoid hydration mismatch
  const displayPrice = isMounted 
    ? formatPrice(amountGbp)
    : `£${amountGbp.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <span className={cn(sizeClasses[size], 'font-medium', className)}>
      {displayPrice}
      {isMounted && showOriginal && currency !== 'GBP' && (
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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!compareAtPrice || compareAtPrice <= basePrice) {
    return <PriceDisplay amountGbp={basePrice} className={className} size={size} />
  }

  // Show GBP on server and initial client render to avoid hydration mismatch
  const displayComparePrice = isMounted 
    ? formatPrice(compareAtPrice)
    : `£${compareAtPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className={cn('flex flex-col', className)}>
      <PriceDisplay amountGbp={basePrice} size={size} />
      <span className="text-sm text-muted-foreground line-through">
        {displayComparePrice}
      </span>
    </div>
  )
}
