import { describe, expect, it } from 'vitest'
import { DEFAULT_OG_IMAGE, buildMetadata, cleanDescription, toOgImage } from './metadata'

describe('toOgImage', () => {
  it('replaces upload transforms with a padded 1200x630 JPG', () => {
    const image = toOgImage(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v123/products/wig.webp',
      'Wig'
    )
    expect(image.url).toBe(
      'https://res.cloudinary.com/demo/image/upload/c_pad,w_1200,h_630,b_white,f_jpg,q_auto/v123/products/wig.jpg'
    )
    expect(image).toMatchObject({ width: 1200, height: 630, type: 'image/jpeg', alt: 'Wig' })
  })

  it('handles Cloudinary URLs with no existing transforms', () => {
    expect(toOgImage('https://res.cloudinary.com/demo/image/upload/v1/a.jpg', 'A').url).toBe(
      'https://res.cloudinary.com/demo/image/upload/c_pad,w_1200,h_630,b_white,f_jpg,q_auto/v1/a.jpg'
    )
  })

  it('passes other URLs through without size hints and falls back to the default', () => {
    expect(toOgImage('https://example.com/a.png', 'A')).toEqual({ url: 'https://example.com/a.png', alt: 'A' })
    expect(toOgImage(null, 'A')).toBe(DEFAULT_OG_IMAGE)
  })
})

describe('cleanDescription', () => {
  it('strips markup and collapses whitespace', () => {
    expect(cleanDescription('<p>Silky **raw** hair</p>\n\n<br/>Lasts &amp; lasts')).toBe('Silky raw hair Lasts & lasts')
  })

  it('cuts long text at a word boundary under the limit', () => {
    const result = cleanDescription('word '.repeat(60))
    expect(result.length).toBeLessThanOrEqual(160)
    expect(result.endsWith('word…')).toBe(true)
  })

  it('returns an empty string for missing text', () => {
    expect(cleanDescription(null)).toBe('')
  })
})

describe('buildMetadata', () => {
  it('sets canonical, og:url and matching Twitter tags', () => {
    const metadata = buildMetadata({ title: 'T', description: 'D', path: '/shop?category=wig' })
    expect(metadata.alternates?.canonical).toBe('/shop?category=wig')
    expect(metadata.openGraph).toMatchObject({ url: '/shop?category=wig', title: 'T', images: [DEFAULT_OG_IMAGE] })
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title: 'T', description: 'D' })
    expect(metadata.robots).toBeUndefined()
  })

  it('adds noindex when asked', () => {
    expect(buildMetadata({ title: 'T', description: 'D', path: '/login', noIndex: true }).robots).toEqual({
      index: false,
      follow: true,
    })
  })
})
