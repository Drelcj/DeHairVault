import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { CurrencyProvider, useCurrency, type ExchangeRate, type SupportedCurrency } from './currency-context'

const rate = (currency_code: string, rate_from_gbp: number): ExchangeRate => ({
  id: currency_code,
  currency_code,
  rate_from_gbp,
  symbol: '',
  is_active: true,
  created_at: '',
  updated_at: '',
})

function Price({ gbp }: { gbp: number }) {
  const { formatPrice } = useCurrency()
  return <>{formatPrice(gbp)}</>
}

function render(currency: SupportedCurrency, rates: ExchangeRate[]) {
  return renderToString(
    <CurrencyProvider initialCurrency={currency} initialRates={rates}>
      <Price gbp={990} />
    </CurrencyProvider>
  )
}

describe('CurrencyProvider formatPrice', () => {
  it('converts with the live rate from the server', () => {
    expect(render('NGN', [rate('GBP', 1), rate('NGN', 1950)])).toBe('₦1,930,500')
    expect(render('USD', [rate('USD', 1.25)])).toBe('$1,237.50')
  })

  it('shows GBP instead of an unconverted figure when the rate is missing', () => {
    expect(render('NGN', [])).toBe('£990.00')
    expect(render('NGN', [rate('NGN', 0)])).toBe('£990.00')
  })

  it('renders the cookie currency on the server', () => {
    expect(render('GBP', [rate('NGN', 1950)])).toBe('£990.00')
  })
})
