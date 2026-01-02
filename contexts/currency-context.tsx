'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ExchangeRate } from '@/types/database.types'

// Supported currencies
export type SupportedCurrency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'GHS'

interface CurrencyContextType {
  currency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => void
  exchangeRates: ExchangeRate[]
  isLoading: boolean
  formatPrice: (amountNgn: number, showOriginal?: boolean) => string
  convertFromNgn: (amountNgn: number) => number
  getRate: () => number
  currencySymbol: string
}

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
  CAD: 'C$',
  GHS: '₵',
}

const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  NGN: 'en-NG',
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'de-DE',
  CAD: 'en-CA',
  GHS: 'en-GH',
}

const CURRENCY_STORAGE_KEY = 'dehair_vault_currency'

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}

// Country to currency mapping for geolocation
const COUNTRY_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  NG: 'NGN', // Nigeria
  US: 'USD', // United States
  GB: 'GBP', // United Kingdom
  UK: 'GBP', // United Kingdom (alternative)
  DE: 'EUR', // Germany
  FR: 'EUR', // France
  IT: 'EUR', // Italy
  ES: 'EUR', // Spain
  NL: 'EUR', // Netherlands
  BE: 'EUR', // Belgium
  AT: 'EUR', // Austria
  IE: 'EUR', // Ireland
  PT: 'EUR', // Portugal
  CA: 'CAD', // Canada
  GH: 'GHS', // Ghana
}

async function detectUserCurrency(): Promise<SupportedCurrency> {
  try {
    // Try to get location from a free geolocation API
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(3000) 
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
  
  // Default to NGN
  return 'NGN'
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>('NGN')
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
    }
  }, [])

  // Initialize currency from localStorage or geolocation
  useEffect(() => {
    const initCurrency = async () => {
      setIsLoading(true)
      
      // Fetch exchange rates first
      await fetchExchangeRates()
      
      // Check localStorage first
      const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as SupportedCurrency | null
      
      if (storedCurrency && Object.keys(CURRENCY_SYMBOLS).includes(storedCurrency)) {
        setCurrencyState(storedCurrency)
      } else {
        // Detect user's currency based on location
        const detectedCurrency = await detectUserCurrency()
        setCurrencyState(detectedCurrency)
        localStorage.setItem(CURRENCY_STORAGE_KEY, detectedCurrency)
      }
      
      setIsLoading(false)
      setIsInitialized(true)
    }

    initCurrency()
  }, [fetchExchangeRates])

  // Update currency with localStorage persistence
  const setCurrency = useCallback((newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency)
  }, [])

  // Get the exchange rate for current currency
  const getRate = useCallback((): number => {
    if (currency === 'NGN') return 1
    
    const rate = exchangeRates.find(r => r.currency_code === currency && r.is_active)
    return rate ? Number(rate.rate_to_ngn) : 1
  }, [currency, exchangeRates])

  // Convert amount from NGN to current currency
  const convertFromNgn = useCallback((amountNgn: number): number => {
    const rate = getRate()
    if (rate === 1 || currency === 'NGN') return amountNgn
    return amountNgn / rate
  }, [currency, getRate])

  // Format price in the current currency
  const formatPrice = useCallback((amountNgn: number, showOriginal: boolean = false): string => {
    if (currency === 'NGN') {
      return new Intl.NumberFormat(CURRENCY_LOCALES.NGN, {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amountNgn)
    }

    const convertedAmount = convertFromNgn(amountNgn)
    const formatted = new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount)

    if (showOriginal) {
      const ngnFormatted = new Intl.NumberFormat(CURRENCY_LOCALES.NGN, {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amountNgn)
      return `${formatted} (${ngnFormatted})`
    }

    return formatted
  }, [currency, convertFromNgn])

  const currencySymbol = CURRENCY_SYMBOLS[currency]

  // Don't render children until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRates,
        isLoading,
        formatPrice,
        convertFromNgn,
        getRate,
        currencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}
