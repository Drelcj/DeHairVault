// Server-side exchange-rate loader, shared by /api/exchange-rates and the root
// layout (which seeds CurrencyProvider so server and browser render the same prices).

import { unstable_cache } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export interface ExchangeRate {
  id: string
  currency_code: string
  rate_from_gbp: number // How many units of this currency = 1 GBP
  symbol: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Cached for 5 minutes (matches the old s-maxage=300 policy). Throws on error so
// a failed query is never cached.
const loadRates = unstable_cache(
  async (): Promise<ExchangeRate[]> => {
    // Cookie-less anon client: exchange_rates is publicly readable, and
    // unstable_cache can't read request cookies.
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('is_active', true)
      .order('currency_code')

    if (error) throw new Error(`Failed to fetch exchange rates: ${error.message}`)

    const rates = (data ?? []) as unknown as ExchangeRate[]

    // Always ensure GBP rate exists (base rate = 1)
    if (!rates.some((r) => r.currency_code === 'GBP')) {
      const now = new Date().toISOString()
      rates.unshift({
        id: 'gbp-base',
        currency_code: 'GBP',
        rate_from_gbp: 1,
        symbol: '£',
        is_active: true,
        created_at: now,
        updated_at: now,
      })
    }
    return rates
  },
  ['exchange-rates'],
  { revalidate: 300, tags: ['exchange-rates'] }
)

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  return loadRates()
}

/** Like getExchangeRates, but returns [] on failure (prices then display in GBP). */
export async function getExchangeRatesSafe(): Promise<ExchangeRate[]> {
  try {
    return await loadRates()
  } catch (error) {
    console.error('Exchange rates unavailable, falling back to GBP display:', error)
    return []
  }
}
