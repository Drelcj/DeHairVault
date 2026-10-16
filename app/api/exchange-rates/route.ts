import { NextResponse } from 'next/server'
import { getExchangeRates } from '@/lib/currency/rates'

export async function GET() {
  try {
    const rates = await getExchangeRates()

    return NextResponse.json(
      {
        rates,
        success: true,
      },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (error) {
    console.error('Exchange rates API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    )
  }
}
