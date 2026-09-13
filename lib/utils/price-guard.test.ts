import { describe, expect, it } from 'vitest'
import { findPriceViolations, PRICE_DEVIATION_TOLERANCE } from './price-guard'

// Mirrors the checkout conversions: GBP catalog price -> NGN order line (createOrder)
// -> kobo -> pence (app/api/checkout/stripe/route.ts)
const toOrderLineNgn = (priceGbp: number, ngnPerGbp: number) => Math.round(priceGbp * ngnPerGbp * 100) / 100
const toStripeUnitAmount = (unitPriceNgn: number, ngnPerGbp: number) =>
  Math.round(Math.round(unitPriceNgn * 100) / ngnPerGbp)

const line = (unitAmountPence: number, productId: string | null = 'p') => ({
  productId,
  productName: 'Product',
  unitAmountPence,
})

describe('findPriceViolations', () => {
  it('rejects the DHV-2026-325844 incident: stale £115 cart snapshot vs £200 catalog price', () => {
    const unitAmountPence = toStripeUnitAmount(223324.64, 1941.9534)
    expect(unitAmountPence).toBe(11500)

    expect(findPriceViolations([line(unitAmountPence, 'wig-bee')], { 'wig-bee': 200 })).toEqual([
      { productId: 'wig-bee', productName: 'Product', unitAmountPence: 11500, catalogPence: 20000, deviationPct: -42.5 },
    ])
  })

  it('rejects snapshots stored before the GBP migration (₦800 stored for an £800 wig)', () => {
    const unitAmountPence = toStripeUnitAmount(800, 1941.9534)
    expect(unitAmountPence).toBe(41)
    expect(findPriceViolations([line(unitAmountPence)], { p: 800 })).toHaveLength(1)
  })

  it('accepts catalog-priced lines after the NGN round trip', () => {
    const prices = [0.3, 1, 9.99, 40, 115, 179.49, 199.99, 240, 499, 890, 1234.56, 9999.99]
    const rates = [1, 1941.9534, 1950, 2087.33]

    for (const rate of rates) {
      for (const price of prices) {
        const unitAmountPence = toStripeUnitAmount(toOrderLineNgn(price, rate), rate)
        expect(findPriceViolations([line(unitAmountPence)], { p: price })).toEqual([])
      }
    }
  })

  it('allows drift up to the tolerance and rejects anything beyond it', () => {
    expect(PRICE_DEVIATION_TOLERANCE).toBe(0.01)
    expect(findPriceViolations([line(10100), line(9900)], { p: 100 })).toEqual([])
    expect(findPriceViolations([line(10101)], { p: 100 })).toHaveLength(1)
    expect(findPriceViolations([line(9899)], { p: 100 })).toHaveLength(1)
  })

  it('never allows less than 1p of rounding drift on cheap items', () => {
    expect(findPriceViolations([line(31)], { p: 0.3 })).toEqual([])
    expect(findPriceViolations([line(32)], { p: 0.3 })).toHaveLength(1)
  })

  it('treats a missing catalog price, missing product id or non-numeric amount as a violation', () => {
    expect(findPriceViolations([line(5000, 'deleted'), line(5000, null)], {})).toEqual([
      { ...line(5000, 'deleted'), catalogPence: null, deviationPct: null },
      { ...line(5000, null), catalogPence: null, deviationPct: null },
    ])
    expect(findPriceViolations([line(NaN)], { p: 10 })).toHaveLength(1)
  })
})
