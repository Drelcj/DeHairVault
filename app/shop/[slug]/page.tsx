import { notFound } from 'next/navigation'
import Image from 'next/image'
import { HeaderShell } from '@/components/header-shell'
import { Footer } from '@/components/footer'
import { getProductBySlug } from '@/lib/actions/products'
import { ProductDetailClient } from './product-detail-client'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <ProductDetailClient product={product} />
      <Footer />
    </main>
  )
}
