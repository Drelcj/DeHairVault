import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { HeaderShell } from '@/components/header-shell'
import { Footer } from '@/components/footer'
import { getProductBySlug, getRelatedProducts } from '@/lib/actions/products'
import { ProductDetailClient } from './product-detail-client'
import { RelatedProducts } from './related-products'

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

  const title = `${product.name} | Dehair Vault`
  const description = product.short_description || product.description || `Shop ${product.name} - Premium quality hair extensions from Dehair Vault`
  
  // Get the product image - use absolute URL for social sharing
  const productImage = product.thumbnail_url || product.images?.[0]
  const imageUrl = productImage 
    ? (productImage.startsWith('http') ? productImage : `https://dehairvault.com${productImage}`)
    : 'https://dehairvault.com/og-default.jpg'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://dehairvault.com/shop/${slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      siteName: 'Dehair Vault',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // Fetch related products
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
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
      <Footer />
    </main>
  )
}
