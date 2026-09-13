// Checkout Price Guard
// Verifies that the unit price about to be charged for each order line matches the
// live catalog price (products.base_price_gbp) before a payment session is created.

// Maximum relative drift allowed between the charged unit price and the catalog price
export const PRICE_DEVIATION_TOLERANCE = 0.01

export interface PricedLine {
  productId: string | null
  productName: string
  unitAmountPence: number
}

export interface PriceViolation extends PricedLine {
  catalogPence: number | null
  deviationPct: number | null
}

/**
 * Find order lines whose charged unit amount deviates from the live catalog price
 * @param lines - Unit amounts (in pence) exactly as they will be sent to the payment provider
 * @param catalogPricesGbp - Live catalog prices in GBP, keyed by product id
 * @param tolerance - Allowed relative drift; never less than 1p so kobo -> pence rounding can't trip it
 * @returns Every violating line. A line with no catalog price (deleted or inactive product) always violates.
 */
export function findPriceViolations(
  lines: PricedLine[],
  catalogPricesGbp: Readonly<Record<string, number>>,
  tolerance: number = PRICE_DEVIATION_TOLERANCE
): PriceViolation[] {
  const violations: PriceViolation[] = []

  for (const line of lines) {
    const catalogGbp = line.productId ? Number(catalogPricesGbp[line.productId]) : NaN
    const catalogPence = Number.isFinite(catalogGbp) ? Math.round(catalogGbp * 100) : null

    if (catalogPence === null || !Number.isFinite(line.unitAmountPence)) {
      violations.push({ ...line, catalogPence, deviationPct: null })
      continue
    }

    const deviationPence = line.unitAmountPence - catalogPence

    if (Math.abs(deviationPence) > Math.max(1, catalogPence * tolerance)) {
      violations.push({
        ...line,
        catalogPence,
        deviationPct: catalogPence > 0 ? Math.round((deviationPence / catalogPence) * 10000) / 100 : null,
      })
    }
  }

  return violations
}
