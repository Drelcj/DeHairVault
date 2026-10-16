import { describe, expect, it } from 'vitest'
import { currencyForCountry, formatMoney, isSupportedCurrency } from './config'

describe('currencyForCountry', () => {
  it('maps the main markets', () => {
    expect(currencyForCountry('GB')).toBe('GBP')
    expect(currencyForCountry('NG')).toBe('NGN')
    expect(currencyForCountry('US')).toBe('USD')
    expect(currencyForCountry('FR')).toBe('EUR')
    expect(currencyForCountry('IE')).toBe('EUR')
    expect(currencyForCountry('hr')).toBe('EUR')
  })

  it('falls back to GBP when the country is unknown or missing', () => {
    expect(currencyForCountry('JP')).toBe('GBP')
    expect(currencyForCountry(null)).toBe('GBP')
    expect(currencyForCountry('')).toBe('GBP')
  })
})

describe('isSupportedCurrency', () => {
  it('only accepts known codes', () => {
    expect(isSupportedCurrency('NGN')).toBe(true)
    expect(isSupportedCurrency('JPY')).toBe(false)
    expect(isSupportedCurrency(undefined)).toBe(false)
  })
})

describe('formatMoney', () => {
  it('formats in the given currency', () => {
    expect(formatMoney(990, 'GBP')).toBe('£990.00')
    expect(formatMoney(1930500, 'NGN')).toBe('₦1,930,500')
  })
})
