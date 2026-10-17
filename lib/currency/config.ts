// Display-currency config shared by the proxy (edge), server components and the
// client CurrencyProvider. No 'use client' / server-only imports here.

export type SupportedCurrency = 'GBP' | 'USD' | 'EUR' | 'NGN' | 'CAD' | 'GHS'

// Base currency is GBP (all DB prices are stored in GBP)
export const DEFAULT_CURRENCY: SupportedCurrency = 'GBP'
export const CURRENCY_COOKIE_KEY = 'dehair_currency'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  NGN: '₦',
  CAD: 'C$',
  GHS: '₵',
}

export const CURRENCY_NAMES: Record<SupportedCurrency, string> = {
  GBP: 'British Pound',
  USD: 'US Dollar',
  EUR: 'Euro',
  NGN: 'Nigerian Naira',
  CAD: 'Canadian Dollar',
  GHS: 'Ghanaian Cedi',
}

export const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  GBP: 'en-GB',
  USD: 'en-US',
  EUR: 'de-DE',
  NGN: 'en-NG',
  CAD: 'en-CA',
  GHS: 'en-GH',
}

// Eurozone members (Bulgaria joined 2026-01-01) plus non-EU states that use the euro
const EURO_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV',
  'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
  'AD', 'MC', 'SM', 'VA', 'ME', 'XK',
]

// Country (ISO 3166-1 alpha-2) to display currency
const COUNTRY_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  GB: 'GBP',
  UK: 'GBP',
  US: 'USD',
  NG: 'NGN',
  CA: 'CAD',
  GH: 'GHS',
  ...Object.fromEntries(EURO_COUNTRIES.map((c) => [c, 'EUR' as const])),
}

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === 'string' && value in CURRENCY_SYMBOLS
}

/** Display currency for a visitor's country code; GBP when unknown. */
export function currencyForCountry(countryCode: string | null | undefined): SupportedCurrency {
  if (!countryCode) return DEFAULT_CURRENCY
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY
}

/** Format an amount that is already in `currency`. Deterministic on server and client. */
export function formatMoney(amount: number, currency: SupportedCurrency, decimals?: number): string {
  // NGN and GHS typically show no decimals
  const digits = decimals ?? (currency === 'NGN' || currency === 'GHS' ? 0 : 2)
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
}
