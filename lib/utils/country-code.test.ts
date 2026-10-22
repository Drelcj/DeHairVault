import { describe, expect, it } from 'vitest'
import { toIsoCountryCode } from './country-code'

describe('toIsoCountryCode', () => {
  it.each([
    ['Nigeria', 'NG'],
    ['nigeria ', 'NG'],
    ['United Kingdom', 'GB'],
    ['UK', 'GB'],
    ['England', 'GB'],
    ['gb', 'GB'],
    ['United States', 'US'],
    ['USA', 'US'],
    ['The Netherlands', 'NL'],
    ['Germany', 'DE'],
    ['Ireland', 'IE'],
    ['Côte d’Ivoire', 'CI'],
  ])('resolves %s to %s', (input, code) => {
    expect(toIsoCountryCode(input)).toBe(code)
  })

  it.each([null, undefined, '', '  ', 'Atlantis', 'EU', 'ZZ', 'XX'])('returns null for %s', (input) => {
    expect(toIsoCountryCode(input)).toBeNull()
  })
})
