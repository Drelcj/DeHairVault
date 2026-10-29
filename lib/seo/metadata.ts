import type { Metadata } from 'next'

// Canonical origin. The bare domain redirects to www, and link-preview crawlers
// (WhatsApp, iMessage, Facebook) don't always follow redirects.
export const SITE_URL = 'https://www.dehairvault.com'
export const SITE_NAME = 'Dehair Vault'

const OG_WIDTH = 1200
const OG_HEIGHT = 630

export interface OgImage {
  url: string
  width?: number
  height?: number
  alt: string
  type?: string
}

export const DEFAULT_OG_IMAGE: OgImage = {
  url: '/og-default.jpg',
  width: OG_WIDTH,
  height: OG_HEIGHT,
  alt: 'Dehair Vault - Luxury Hair Extensions',
  type: 'image/jpeg',
}

interface BuildMetadataOptions {
  title: string
  description: string
  /** Path (with query string if it matters) used for canonical + og:url. Omit for the root layout defaults. */
  path?: string
  image?: OgImage
  /** Keeps the page out of search results (links on it are still followed). */
  noIndex?: boolean
}

// Every public page goes through this so each one gets the full set of
// title, description, canonical, Open Graph and Twitter tags. Next replaces
// openGraph/twitter wholesale per segment, so a page that only set a title
// would otherwise lose its preview image.
export function buildMetadata({ title, description, path, image = DEFAULT_OG_IMAGE, noIndex = false }: BuildMetadataOptions): Metadata {
  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      ...(path ? { url: path } : {}),
      siteName: SITE_NAME,
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  }
}

// Matches a Cloudinary transformation segment such as "f_auto,q_auto" or "c_fill,w_400".
const CLOUDINARY_TRANSFORM_SEGMENT = /^[a-z]{1,3}_[^/]*$/

/**
 * Turns a product image into a 1200×630 JPG suitable for link previews.
 * Crawlers handle WebP/AVIF unevenly, so f_auto is replaced with f_jpg, and
 * c_pad keeps the whole product in frame instead of cropping it.
 * Non-Cloudinary images are returned without size hints.
 */
export function toOgImage(url: string | null | undefined, alt: string): OgImage {
  if (!url) return DEFAULT_OG_IMAGE

  const marker = '/image/upload/'
  const markerIndex = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || markerIndex === -1) {
    return { url, alt }
  }

  const prefix = url.slice(0, markerIndex + marker.length)
  const segments = url.slice(markerIndex + marker.length).split('/')
  // Drop existing transformations (e.g. the f_auto,q_auto added at upload) so ours apply cleanly.
  while (segments.length > 1 && CLOUDINARY_TRANSFORM_SEGMENT.test(segments[0])) {
    segments.shift()
  }

  // Uploads can be .heic/.webp/.png; a .jpg extension keeps crawlers that judge by URL happy.
  const path = segments.join('/').replace(/\.[a-z0-9]+$/i, '') + '.jpg'

  return {
    url: `${prefix}c_pad,w_${OG_WIDTH},h_${OG_HEIGHT},b_white,f_jpg,q_auto/${path}`,
    width: OG_WIDTH,
    height: OG_HEIGHT,
    alt,
    type: 'image/jpeg',
  }
}

/** Strips HTML/markdown and collapses whitespace, then cuts at a word boundary under maxLength. */
export function cleanDescription(text: string | null | undefined, maxLength = 160): string {
  if (!text) return ''

  const plain = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[*_#>`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (plain.length <= maxLength) return plain

  const cut = plain.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, '')}…`
}
