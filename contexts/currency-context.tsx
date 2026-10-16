'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { setCookie } from 'cookies-next'
import {
  COOKIE_MAX_AGE,
  CURRENCY_COOKIE_KEY,
  CURRENCY_LOCALES,
  CURRENCY_NAMES,
  CURRENCY_SYMBOLS,
  DEFAULT_CURRENCY,
  formatMoney,
  type SupportedCurrency,
} from '@/lib/currency/config'
import type { ExchangeRate } from '@/lib/currency/rates'

// ============================================================================
// Types & Constants
// ============================================================================

export type { SupportedCurrency, ExchangeRate }
export { CURRENCY_SYMBOLS, CURRENCY_NAMES }

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
// Provider
// ============================================================================

interface CurrencyProviderProps {
  children: React.ReactNode
  // Both come from the server (root layout reads the currency cookie set by
  // proxy.ts and the cached exchange rates), so the server render and the first
  // browser render produce identical prices.
  initialCurrency?: SupportedCurrency
  initialRates?: ExchangeRate[]
}

export function CurrencyProvider({ children, initialCurrency, initialRates = [] }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(initialCurrency ?? DEFAULT_CURRENCY)
  const exchangeRates = initialRates

  // Update currency with cookie persistence
  const setCurrency = useCallback((newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency)
    setCookie(CURRENCY_COOKIE_KEY, newCurrency, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    })
  }, [])

  // Live rate for a currency, or null if the DB has none (never a hardcoded number)
  const findRate = useCallback(
    (code: SupportedCurrency): number | null => {
      if (code === 'GBP') return 1
      const rate = exchangeRates.find((r) => r.currency_code === code && r.is_active)
      const value = rate ? Number(rate.rate_from_gbp) : NaN
      return Number.isFinite(value) && value > 0 ? value : null
    },
    [exchangeRates]
  )

  // Get the exchange rate for current currency (rate FROM GBP)
  // Example: if rate_from_gbp for USD is 1.27, that means 1 GBP = 1.27 USD
  const getRate = useCallback((): number => findRate(currency) ?? 1, [currency, findRate])

  // Convert amount from GBP (database value) to current display currency
  // MATH: displayedPrice = dbValue (in GBP) × rate_from_gbp
  const convertFromGbp = useCallback(
    (amountGbp: number): number => amountGbp * getRate(),
    [getRate]
  )

  // Format price in the current currency. If the rate is missing, show GBP
  // rather than an unconverted GBP number with a foreign symbol.
  const formatPrice = useCallback(
    (amountGbp: number, options: FormatPriceOptions = {}): string => {
      const { showOriginal = false, decimals } = options
      const rate = findRate(currency)
      if (rate === null) return formatMoney(amountGbp, 'GBP', decimals)

      const formatted = formatMoney(amountGbp * rate, currency, decimals)
      if (showOriginal && currency !== 'GBP') {
        return `${formatted} (${formatMoney(amountGbp, 'GBP')})`
      }
      return formatted
    },
    [currency, findRate]
  )

  const currencySymbol = CURRENCY_SYMBOLS[currency]
  const currencyName = CURRENCY_NAMES[currency]

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      currency,
      setCurrency,
      exchangeRates,
      isLoading: false,
      formatPrice,
      convertFromGbp,
      getRate,
      currencySymbol,
      currencyName,
      supportedCurrencies: CURRENCY_SYMBOLS,
    }),
    [currency, setCurrency, exchangeRates, formatPrice, convertFromGbp, getRate, currencySymbol, currencyName]
  )

  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>
}

// ============================================================================
// Exports for Components
// ============================================================================

export { DEFAULT_CURRENCY, CURRENCY_LOCALES }
