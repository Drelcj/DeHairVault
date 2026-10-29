import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { HeaderShell } from '@/components/header-shell'
import { Footer } from '@/components/footer'
import { getProductBySlug, getRelatedProducts } from '@/lib/actions/products'
import { ProductDetailClient } from './product-detail-client'
import { RelatedProducts } from './related-products'
import { buildMetadata, cleanDescription, toOgImage } from '@/lib/seo/metadata'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Product Not Found | Dehair Vault',
    }
  }

  const name = product.name.trim()
  const description =
    cleanDescription(product.short_description) ||
    cleanDescription(product.description) ||
    `Shop ${name} - Premium quality hair extensions from Dehair Vault`

  return buildMetadata({
    title: `${name} | Dehair Vault`,
    description,
    path: `/shop/${product.slug}`,
    image: toOgImage(product.thumbnail_url || product.images?.[0], name),
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // Fetch related products in parallel
  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category,
    product.texture,
    4
  )

  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <ProductDetailClient product={product} />
      
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} currentOrigin={product.origin} />
      )}
      
      <Footer />
    </main>
  )
}
