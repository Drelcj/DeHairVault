import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Product } from '@/types/app.types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductImageSources(product: Product): string[] {
  if (!product) {
    return []
  }

  const candidates: string[] = []

  if (product.thumbnail_url && product.thumbnail_url.trim() !== '') {
    candidates.push(product.thumbnail_url.trim())
  }

  if (Array.isArray(product.images)) {
    product.images.forEach((image) => {
      if (image && image.trim() !== '') {
        const normalized = image.trim()
        if (!candidates.includes(normalized)) {
          candidates.push(normalized)
        }
      }
    })
  }

  return candidates
}

