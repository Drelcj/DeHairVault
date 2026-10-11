// Country Code Resolution
// The checkout form collects country as free text ("Nigeria", "UK", "United Kingdom").
// Payment providers need ISO 3166-1 alpha-2 codes, so resolve the text to a code here.

// Common inputs that Intl's English region names don't cover
const ALIASES: Record<string, string> = {
  uk: 'GB',
  'great britain': 'GB',
  britain: 'GB',
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  'northern ireland': 'GB',
  usa: 'US',
  us: 'US',
  america: 'US',
  'united states of america': 'US',
  uae: 'AE',
  holland: 'NL',
}

// Region codes that Intl names but that aren't assigned ISO 3166-1 countries:
// groupings (EU, UN), unknown (ZZ), and exceptionally reserved codes (UK would shadow GB)
const NON_COUNTRY_CODES = new Set(['EU', 'EZ', 'UN', 'ZZ', 'UK', 'EA', 'IC', 'CP', 'DG', 'TA', 'AC'])

let nameToCode: Map<string, string> | null = null

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z ]/g, ' ')
    .replace(/^the /, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getNameToCode(): Map<string, string> {
  if (nameToCode) return nameToCode

  const names = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' })
  const map = new Map<string, string>()
  const A = 'A'.charCodeAt(0)

  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) {
      const code = String.fromCharCode(A + i, A + j)
      // Q* and X* are private-use / pseudo regions
      if (code.startsWith('Q') || code.startsWith('X') || NON_COUNTRY_CODES.has(code)) continue
      const name = names.of(code)
      if (name) map.set(normalize(name), code)
    }
  }

  nameToCode = map
  return map
}

/**
 * Resolve a free-text country (name, alias, or ISO alpha-2 code) to an ISO 3166-1 alpha-2 code
 * @returns The uppercase code, or null when the input can't be resolved unambiguously
 */
export function toIsoCountryCode(input: string | null | undefined): string | null {
  if (!input) return null
  const key = normalize(input)
  if (!key) return null

  if (ALIASES[key]) return ALIASES[key]

  const map = getNameToCode()
  if (/^[a-z]{2}$/.test(key)) {
    const code = key.toUpperCase()
    return [...map.values()].includes(code) ? code : null
  }

  return map.get(key) ?? null
}
