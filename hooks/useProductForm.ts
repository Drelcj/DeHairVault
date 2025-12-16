// Hook for handling product form logic (create and edit)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, HairGrade, HairTexture, HairOrigin, HairCategory, DrawType } from '@/types/database.types';

export interface ProductFormData {
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  grade: HairGrade;
  origin: HairOrigin;
  texture: HairTexture;
  category: HairCategory;
  draw_type: DrawType | null;
  available_lengths: number[];
  base_price_ngn: number;
  compare_at_price_ngn: number | null;
  cost_price_ngn: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  images: string[];
  thumbnail_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_preorder_only: boolean;
}

export interface VariantFormData {
  length: number;
  sku: string;
  price_override_ngn: number | null;
  stock_quantity: number;
  weight_grams: number | null;
}

export function useProductForm(initialProduct?: Product) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ProductFormData, variants: VariantFormData[]) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = initialProduct 
        ? `/api/admin/products/${initialProduct.id}`
        : '/api/admin/products';
      
      const method = initialProduct ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: data,
          variants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      const result = await response.json();
      
      // Redirect to product list on success
      router.push('/admin/products');
      router.refresh();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return {
    handleSubmit,
    generateSlug,
    loading,
    error,
  };
}
