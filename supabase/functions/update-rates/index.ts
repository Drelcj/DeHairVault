// Supabase Edge Function: update-rates
// Fetches live exchange rates from ExchangeRate-API and updates the database
// Base currency: GBP (British Pounds)
//
// Deploy: npx supabase functions deploy update-rates
// Set secret: npx supabase secrets set EXCHANGERATE_API_KEY=your_key_here
// Invoke manually: curl -i --location --request POST 'https://<project-ref>.supabase.co/functions/v1/update-rates'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supported currencies to fetch rates for
const SUPPORTED_CURRENCIES = ['GBP', 'USD', 'EUR', 'NGN', 'CAD', 'GHS'] as const

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  NGN: '₦',
  CAD: 'C$',
  GHS: '₵',
}

interface ExchangeRateAPIResponse {
  result: string
  base_code: string
  conversion_rates: Record<string, number>
  time_last_update_utc: string
}

Deno.serve(async (req: Request) => {
  try {
    // Only allow POST requests (for security when called via cron)
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get API key from environment
    const apiKey = Deno.env.get('EXCHANGERATE_API_KEY')
    if (!apiKey) {
      console.error('EXCHANGERATE_API_KEY not set')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not set')
      return new Response(
        JSON.stringify({ error: 'Database credentials not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch exchange rates from ExchangeRate-API with GBP as base
    // API returns: how many units of each currency = 1 GBP
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/GBP`
    console.log('Fetching rates from ExchangeRate-API with GBP base...')

    const response = await fetch(apiUrl)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ExchangeRate-API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch exchange rates', details: errorText }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data: ExchangeRateAPIResponse = await response.json()

    if (data.result !== 'success') {
      console.error('ExchangeRate-API returned error:', data)
      return new Response(
        JSON.stringify({ error: 'Exchange rate API returned error', details: data }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Rates fetched successfully. Last update: ${data.time_last_update_utc}`)

    // Prepare upsert data for supported currencies
    // rate_from_gbp = how many units of currency X you get for 1 GBP
    const upsertData = SUPPORTED_CURRENCIES.map((currencyCode) => {
      const rate = data.conversion_rates[currencyCode] || 1

      return {
        currency_code: currencyCode,
        rate_from_gbp: rate,  // 1 GBP = X units of this currency
        symbol: CURRENCY_SYMBOLS[currencyCode] || currencyCode,
        is_active: true,
        updated_at: new Date().toISOString(),
      }
    })

    console.log('Upserting rates:', JSON.stringify(upsertData, null, 2))

    // Upsert exchange rates to database
    const { data: upsertResult, error: upsertError } = await supabase
      .from('exchange_rates')
      .upsert(upsertData, {
        onConflict: 'currency_code',
        ignoreDuplicates: false,
      })
      .select()

    if (upsertError) {
      console.error('Database upsert error:', upsertError)
      return new Response(
        JSON.stringify({ error: 'Failed to update database', details: upsertError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('Exchange rates updated successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Exchange rates updated successfully',
        rates_updated: upsertData.length,
        last_api_update: data.time_last_update_utc,
        rates: upsertData.map((r) => ({
          currency: r.currency_code,
          rate_from_gbp: r.rate_from_gbp,
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
