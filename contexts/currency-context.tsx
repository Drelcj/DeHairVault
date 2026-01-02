'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { getCookie, setCookie } from 'cookies-next'

// ============================================================================
// Types & Constants
// ============================================================================

export type SupportedCurrency = 'GBP' | 'USD' | 'EUR' | 'NGN' | 'CAD' | 'GHS'

// Base currency is GBP (all DB prices are stored in GBP)
const DEFAULT_CURRENCY: SupportedCurrency = 'GBP'
const CURRENCY_COOKIE_KEY = 'dehair_currency'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

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

const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  GBP: 'en-GB',
  USD: 'en-US',
  EUR: 'de-DE',
  NGN: 'en-NG',
  CAD: 'en-CA',
  GHS: 'en-GH',
}

// Country to currency mapping for geolocation detection
const COUNTRY_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  GB: 'GBP',
  UK: 'GBP',
  US: 'USD',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  NG: 'NGN',
  CA: 'CAD',
  GH: 'GHS',
}

// Exchange rate from database
export interface ExchangeRate {
  id: string
  currency_code: string
  rate_from_gbp: number  // How many units of this currency = 1 GBP
  symbol: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CurrencyContextType {
  currency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => void
  exchangeRates: ExchangeRate[]
  isLoading: boolean
  formatPrice: (amountGbp: number, options?: FormatPriceOptions) => string
  convertFromGbp: (amountGbp: number) => number
  getRate: () => number
  currencySymbol: string
  currencyName: string
  supportedCurrencies: typeof CURRENCY_SYMBOLS
}

interface FormatPriceOptions {
  showOriginal?: boolean
  decimals?: number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// ============================================================================
// Hook
// ============================================================================

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}

// ============================================================================
// Helpers
// ============================================================================

function getInitialCurrency(): SupportedCurrency {
  // Read from cookie on initial render (works on server and client)
  if (typeof window !== 'undefined') {
    const cookieValue = getCookie(CURRENCY_COOKIE_KEY)
    if (cookieValue && Object.keys(CURRENCY_SYMBOLS).includes(cookieValue as string)) {
      return cookieValue as SupportedCurrency
    }
  }
  return DEFAULT_CURRENCY
}

async function detectUserCurrency(): Promise<SupportedCurrency> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000),
    })

    if (!response.ok) {
      throw new Error('Geolocation API failed')
    }

    const data = await response.json()
    const countryCode = data.country_code?.toUpperCase()

    if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
      return COUNTRY_CURRENCY_MAP[countryCode]
    }
  } catch (error) {
    console.log('Geolocation detection failed, using default currency')
  }

  return DEFAULT_CURRENCY
}

// ============================================================================
// Provider
// ============================================================================

interface CurrencyProviderProps {
  children: React.ReactNode
  initialCurrency?: SupportedCurrency
}

export function CurrencyProvider({ children, initialCurrency }: CurrencyProviderProps) {
  // Initialize with cookie value or provided initial value to prevent flickering
  const [currency, setCurrencyState] = useState<SupportedCurrency>(
    initialCurrency || getInitialCurrency()
  )
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch exchange rates from API
  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await fetch('/api/exchange-rates')
      if (response.ok) {
        const data = await response.json()
        setExchangeRates(data.rates || [])
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
      // Set default rates as fallback
      setExchangeRates([
        { id: 'gbp', currency_code: 'GBP', rate_from_gbp: 1, symbol: '£', is_active: true, created_at: '', updated_at: '' },
        { id: 'usd', currency_code: 'USD', rate_from_gbp: 1.27, symbol: '$', is_active: true, created_at: '', updated_at: '' },
        { id: 'eur', currency_code: 'EUR', rate_from_gbp: 1.17, symbol: '€', is_active: true, created_at: '', updated_at: '' },
        { id: 'ngn', currency_code: 'NGN', rate_from_gbp: 1950, symbol: '₦', is_active: true, created_at: '', updated_at: '' },
        { id: 'cad', currency_code: 'CAD', rate_from_gbp: 1.72, symbol: 'C$', is_active: true, created_at: '', updated_at: '' },
        { id: 'ghs', currency_code: 'GHS', rate_from_gbp: 15.5, symbol: '₵', is_active: true, created_at: '', updated_at: '' },
      ])
    }
  }, [])

  // Initialize currency from cookie or geolocation
  useEffect(() => {
    const initCurrency = async () => {
      setIsLoading(true)

      // Fetch exchange rates
      await fetchExchangeRates()

      // Check if currency is already set from cookie
      const cookieCurrency = getCookie(CURRENCY_COOKIE_KEY) as SupportedCurrency | undefined

      if (cookieCurrency && Object.keys(CURRENCY_SYMBOLS).includes(cookieCurrency)) {
        setCurrencyState(cookieCurrency)
      } else {
        // Detect user's currency based on location (only on first visit)
        const detectedCurrency = await detectUserCurrency()
        setCurrencyState(detectedCurrency)
        setCookie(CURRENCY_COOKIE_KEY, detectedCurrency, {
          maxAge: COOKIE_MAX_AGE,
          path: '/',
          sameSite: 'lax',
        })
      }

      setIsLoading(false)
      setIsInitialized(true)
    }

    initCurrency()
  }, [fetchExchangeRates])

  // Update currency with cookie persistence
  const setCurrency = useCallback((newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency)
    setCookie(CURRENCY_COOKIE_KEY, newCurrency, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    })
  }, [])

  // Get the exchange rate for current currency (rate FROM GBP)
  // Example: if rate_from_gbp for USD is 1.27, that means 1 GBP = 1.27 USD
  const getRate = useCallback((): number => {
    if (currency === 'GBP') return 1

    const rate = exchangeRates.find((r) => r.currency_code === currency && r.is_active)
    return rate ? Number(rate.rate_from_gbp) : 1
  }, [currency, exchangeRates])

  // Convert amount from GBP (database value) to current display currency
  // MATH: displayedPrice = dbValue (in GBP) × rate_from_gbp
  // Example: £100 × 1.27 = $127 USD
  // Example: £100 × 1950 = ₦195,000 NGN
  const convertFromGbp = useCallback(
    (amountGbp: number): number => {
      const rate = getRate()
      return amountGbp * rate
    },
    [getRate]
  )

  // Format price in the current currency
  const formatPrice = useCallback(
    (amountGbp: number, options: FormatPriceOptions = {}): string => {
      const { showOriginal = false, decimals } = options

      // Convert from GBP to display currency: displayedPrice = dbValue × rate
      const displayAmount = convertFromGbp(amountGbp)

      // Determine decimal places (NGN and GHS typically show no decimals)
      const minDecimals = decimals ?? (currency === 'NGN' || currency === 'GHS' ? 0 : 2)
      const maxDecimals = decimals ?? (currency === 'NGN' || currency === 'GHS' ? 0 : 2)

      const formatted = new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals,
      }).format(displayAmount)

      if (showOriginal && currency !== 'GBP') {
        const gbpFormatted = new Intl.NumberFormat(CURRENCY_LOCALES.GBP, {
          style: 'currency',
          currency: 'GBP',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amountGbp)
        return `${formatted} (${gbpFormatted})`
      }

      return formatted
    },
    [currency, convertFromGbp]
  )

  const currencySymbol = CURRENCY_SYMBOLS[currency]
  const currencyName = CURRENCY_NAMES[currency]

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      currency,
      setCurrency,
      exchangeRates,
      isLoading,
      formatPrice,
      convertFromGbp,
      getRate,
      currencySymbol,
      currencyName,
      supportedCurrencies: CURRENCY_SYMBOLS,
    }),
    [currency, setCurrency, exchangeRates, isLoading, formatPrice, convertFromGbp, getRate, currencySymbol, currencyName]
  )

  // Render children immediately with initial currency to prevent layout flickering
  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>
}

// ============================================================================
// Exports for Components
// ============================================================================

export { DEFAULT_CURRENCY, CURRENCY_LOCALES }
