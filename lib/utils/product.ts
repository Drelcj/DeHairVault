// Product Utilities
// Functions for product-related calculations and formatting

import type { Product, HairGrade } from '@/types/database.types';

// Price filter constants (in NGN)
export const MIN_PRICE_NGN = 0;
export const MAX_PRICE_NGN = 1000000;

// Map texture enum values to simplified display categories for filtering
export const textureFilterMap: Record<string, string> = {
  STRAIGHT: "Straight",
  BODY_WAVE: "Wavy",
  LOOSE_WAVE: "Wavy",
  DEEP_WAVE: "Wavy",
  WATER_WAVE: "Wavy",
  KINKY_CURLY: "Curly",
  JERRY_CURL: "Curly",
  LOOSE_DEEP: "Wavy",
  NATURAL_WAVE: "Wavy",
};

// Map texture enum values to full display names
export const textureDisplayMap: Record<string, string> = {
  STRAIGHT: "Straight",
  BODY_WAVE: "Body Wave",
  LOOSE_WAVE: "Loose Wave",
  DEEP_WAVE: "Deep Wave",
  WATER_WAVE: "Water Wave",
  KINKY_CURLY: "Kinky Curly",
  JERRY_CURL: "Jerry Curl",
  LOOSE_DEEP: "Loose Deep",
  NATURAL_WAVE: "Natural Wave",
};

/**
 * Get display length range from array of available lengths
 * @param lengths - Array of available lengths in inches
 * @returns Formatted length range string (e.g., "12\"-24\"")
 */
export function formatLengthRange(lengths: number[]): string {
  if (!lengths || lengths.length === 0) return '';
  const sorted = [...lengths].sort((a, b) => a - b);
  if (sorted.length === 1) return `${sorted[0]}"`;
  return `${sorted[0]}"-${sorted[sorted.length - 1]}"`;
}

/**
 * Calculate product price with length modifier
 * @param product - Product object
 * @param length - Selected length in inches
 * @returns Final price in NGN
 */
export function calculateProductPrice(product: Product, length: number): number {
  const basePrice = Number(product.base_price_ngn);
  
  // Check if length is available
  if (!product.available_lengths.includes(length)) {
    throw new Error(`Length ${length}" is not available for this product`);
  }

  // Get length modifier
  const modifiers = product.length_price_modifiers as Record<string, number> | null;
  const modifier = modifiers?.[length.toString()] || 0;

  return basePrice + modifier;
}

/**
 * Get human-readable grade name
 * @param grade - Hair grade enum value
 * @returns Display name for the grade
 */
export function getGradeDisplayName(grade: HairGrade): string {
  const gradeNames: Record<HairGrade, string> = {
    GRADE_A: 'Raw Baby Hair',
    GRADE_B: 'Single Donor',
    GRADE_C: 'VIP Virgin',
    GRADE_D: 'Virgin Remy',
  };

  return gradeNames[grade] || grade;
}

/**
 * Get grade description
 * @param grade - Hair grade enum value
 * @returns Description of the grade
 */
export function getGradeDescription(grade: HairGrade): string {
  const descriptions: Record<HairGrade, string> = {
    GRADE_A:
      'Ultra-premium raw baby hair from 1-2 children donors. Unprocessed, natural, and lasts up to 10 years. Limited stock.',
    GRADE_B:
      'Premium single donor hair from one healthy donor. Consistent quality, bleachable to 613, lasts up to 9 years.',
    GRADE_C:
      'High-quality VIP virgin hair from 2-3 donors. Bleachable to honey blonde, available in multiple draw types, lasts 6 years.',
    GRADE_D:
      'Budget-friendly virgin remy hair from 4+ donors. Cuticle-aligned, bleachable to #27, lasts 3 years.',
  };

  return descriptions[grade] || '';
}

/**
 * Get grade badge color (for UI styling)
 * @param grade - Hair grade enum value
 * @returns Tailwind color class
 */
export function getGradeBadgeColor(grade: HairGrade): string {
  const colors: Record<HairGrade, string> = {
    GRADE_A: 'bg-purple-100 text-purple-800 border-purple-300',
    GRADE_B: 'bg-blue-100 text-blue-800 border-blue-300',
    GRADE_C: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    GRADE_D: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  return colors[grade] || 'bg-gray-100 text-gray-800 border-gray-300';
}

/**
 * Format texture name for display
 * @param texture - Hair texture enum value
 * @returns Human-readable texture name
 */
export function formatTextureName(texture: string): string {
  return texture
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format origin name for display
 * @param origin - Hair origin enum value
 * @returns Human-readable origin name
 */
export function formatOriginName(origin: string): string {
  return origin.charAt(0) + origin.slice(1).toLowerCase();
}

/**
 * Check if product is in stock
 * @param product - Product object
 * @returns Boolean indicating if product is in stock
 */
export function isInStock(product: Product): boolean {
  if (!product.track_inventory) {
    return true; // Always in stock if not tracking inventory
  }

  return product.stock_quantity > 0 || product.allow_backorder;
}

/**
 * Check if product is low stock
 * @param product - Product object
 * @returns Boolean indicating if product is low stock
 */
export function isLowStock(product: Product): boolean {
  if (!product.track_inventory) {
    return false;
  }

  return (
    product.stock_quantity > 0 &&
    product.stock_quantity <= product.low_stock_threshold
  );
}

/**
 * Get stock status message
 * @param product - Product object
 * @returns Stock status message
 */
export function getStockStatus(product: Product): string {
  if (!product.track_inventory) {
    return 'In Stock';
  }

  if (product.stock_quantity === 0) {
    return product.allow_backorder ? 'Available for Backorder' : 'Out of Stock';
  }

  if (isLowStock(product)) {
    return `Only ${product.stock_quantity} left`;
  }

  return 'In Stock';
}

/**
 * Calculate discount percentage
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @returns Discount percentage
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  salePrice: number
): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) {
    return 0;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Generate product URL slug
 * @param name - Product name
 * @returns URL-safe slug
 */
export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
