// Currency Utilities
// Functions for currency formatting and conversion

import type { ExchangeRate } from '@/types/database.types';

/**
 * Currency symbols mapping
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
  CAD: 'C$',
  GHS: '₵',
};

/**
 * Format a price amount with currency symbol
 * @param amount - The amount to format
 * @param currency - Currency code (NGN, USD, GBP, EUR, CAD, GHS)
 * @param options - Additional formatting options
 * @returns Formatted price string
 */
export function formatPrice(
  amount: number,
  currency: string = 'NGN',
  options?: {
    showDecimals?: boolean;
    locale?: string;
  }
): string {
  const { showDecimals = true, locale = 'en-NG' } = options || {};

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return `${symbol}${formattedAmount}`;
}

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert (in source currency)
 * @param from - Source currency code
 * @param to - Target currency code
 * @param rates - Array of exchange rates
 * @returns Converted amount in target currency
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRate[]
): number {
  if (from === to) {
    return amount;
  }

  // Find exchange rates
  const fromRate = rates.find((r) => r.currency_code === from);
  const toRate = rates.find((r) => r.currency_code === to);

  if (!fromRate || !toRate) {
    throw new Error(`Exchange rate not found for ${from} or ${to}`);
  }

  // Convert via GBP (base currency)
  // First convert from source currency to GBP, then to target currency
  const amountInGBP = amount / Number(fromRate.rate_from_gbp);
  const convertedAmount = amountInGBP * Number(toRate.rate_from_gbp);

  return Number(convertedAmount.toFixed(2));
}

/**
 * Get currency symbol for a currency code
 * @param currencyCode - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

/**
 * Parse a formatted price string back to a number
 * @param priceString - Formatted price string (e.g., "₦350,000.00")
 * @returns Numeric amount
 */
export function parsePrice(priceString: string): number {
  // Remove currency symbols and commas
  const cleaned = priceString.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format price range
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @param currency - Currency code
 * @returns Formatted price range string
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  currency: string = 'NGN'
): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency);
  }
  return `${formatPrice(minPrice, currency)} - ${formatPrice(maxPrice, currency)}`;
}

/**
 * Format amount in Nigerian Naira (NGN)
 * Defensive: handles null, undefined, and NaN values
 * @param amount - Amount to format
 * @returns Formatted NGN string
 */
export function formatNGN(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '₦0.00';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}

/**
 * Format amount in British Pounds (GBP)
 * Defensive: handles null, undefined, and NaN values
 * @param amount - Amount to format
 * @returns Formatted GBP string
 */
export function formatGBP(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '£0.00';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

/**
 * Format amount in US Dollars (USD)
 * Defensive: handles null, undefined, and NaN values
 * @param amount - Amount to format
 * @returns Formatted USD string
 */
export function formatUSD(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
