"use client"

import { useCallback, useMemo, useState } from 'react'
import { generateProductSlug } from '@/lib/utils/product'
import type { ProductFormValues, ProductVariantInput } from '@/types/admin'
import { HairCategory } from '@/types/database.types'

const defaultValues: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  features: [],  // Product features/highlights
  grade: null,  // N/A by default
  origin: 'VIETNAM', // String value for dynamic support
  texture: 'STRAIGHT',  // String value for dynamic support
  category: HairCategory.BUNDLES,
  draw_type: null,
  available_lengths: [14, 16, 18],
  base_price_gbp: 0,
  compare_at_price_gbp: null,
  cost_price_gbp: null,
  length_price_modifiers: null,
  stock_quantity: 0,
  low_stock_threshold: 5,
  track_inventory: true,
  allow_backorder: false,
  images: [],
  thumbnail_url: null,
  video_url: null,
  video_urls: [],
  is_active: true,
  is_featured: false,
  is_new_arrival: false,
  is_preorder_only: false,
  variants: [],
}

export function useProductForm(initial?: Partial<ProductFormValues>) {
  const mergedInitial = useMemo(() => ({
    ...defaultValues,
    ...initial,
    available_lengths: initial?.available_lengths?.length
      ? initial.available_lengths
      : defaultValues.available_lengths,
    variants: initial?.variants ?? defaultValues.variants,
  }), [initial])

  const [values, setValues] = useState<ProductFormValues>(mergedInitial)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const updateField = useCallback(<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((prev) => {
      if (key === 'name' && !prev.slug) {
        return { ...prev, name: value as string, slug: generateProductSlug(String(value)) }
      }
      return { ...prev, [key]: value }
    })
  }, [])

  const setAvailableLengthsFromString = useCallback((input: string) => {
    const lengths = input
      .split(',')
      .map((l) => Number(l.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0)
    setValues((prev) => ({ ...prev, available_lengths: lengths }))
  }, [])

  const setLengthModifiersFromJson = useCallback((input: string) => {
    if (!input.trim()) {
      setValues((prev) => ({ ...prev, length_price_modifiers: null }))
      return
    }

    try {
      const parsed = JSON.parse(input)
      setValues((prev) => ({ ...prev, length_price_modifiers: parsed }))
      setError(null)
    } catch (err) {
      setError('Length price modifiers must be valid JSON')
    }
  }, [])

  const addVariant = useCallback(() => {
    const newVariant: ProductVariantInput = {
      length: 14,
      sku: '',
      price_override_gbp: null,
      stock_quantity: 0,
      weight_grams: null,
    }
    setValues((prev) => ({ ...prev, variants: [...prev.variants, newVariant] }))
  }, [])

  const updateVariant = useCallback((index: number, patch: Partial<ProductVariantInput>) => {
    setValues((prev) => {
      const next = [...prev.variants]
      next[index] = { ...next[index], ...patch }
      return { ...prev, variants: next }
    })
  }, [])

  const removeVariant = useCallback((index: number) => {
    setValues((prev) => {
      const next = [...prev.variants]
      next.splice(index, 1)
      return { ...prev, variants: next }
    })
  }, [])

  const resetMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  return {
    values,
    error,
    successMessage,
    setSuccessMessage,
    setError,
    updateField,
    setAvailableLengthsFromString,
    setLengthModifiersFromJson,
    addVariant,
    updateVariant,
    removeVariant,
    resetMessages,
  }
}

export type { ProductFormValues, ProductVariantInput }
export const defaultProductFormValues = defaultValues
