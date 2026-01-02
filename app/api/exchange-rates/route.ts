import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: rates, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('is_active', true)
      .order('currency_code')

    if (error) {
      console.error('Error fetching exchange rates:', error)
      return NextResponse.json(
        { error: 'Failed to fetch exchange rates' },
        { status: 500 }
      )
    }

    // Always ensure NGN rate exists (base rate)
    const hasNgn = rates?.some(r => r.currency_code === 'NGN')
    const ratesWithNgn = hasNgn 
      ? rates 
      : [
          {
            id: 'ngn-base',
            currency_code: 'NGN',
            rate_to_ngn: 1,
            symbol: '₦',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...(rates || [])
        ]

    return NextResponse.json({
      rates: ratesWithNgn,
      success: true,
    })
  } catch (error) {
    console.error('Exchange rates API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
