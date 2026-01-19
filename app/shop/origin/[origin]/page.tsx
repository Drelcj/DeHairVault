import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HeaderShell } from '@/components/header-shell'
import { Footer } from '@/components/footer'
import { ProductGrid } from '@/components/product-grid'
import { OriginNavigationCards } from '@/components/origin-navigation-cards'
import { getProductsByOrigin, getOriginProductImages } from '@/lib/actions/origin'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

// Map slugs to origin values (string type for dynamic support)
const originSlugMap: Record<string, string> = {
  china: 'CHINA',
  vietnam: 'VIETNAM',
  cambodia: 'CAMBODIA',
  burma: 'BURMA',
  philippines: 'PHILIPPINES',
  india: 'INDIA',
}

// Map origins to display names
const originDisplayNames: Record<string, string> = {
  'CHINA': 'Chinese',
  'VIETNAM': 'Vietnamese',
  'CAMBODIA': 'Cambodian',
  'BURMA': 'Burmese',
  'PHILIPPINES': 'Filipino',
  'INDIA': 'Indian',
}

// Map origins to descriptions
const originDescriptions: Record<string, string> = {
  'CHINA': 'Discover our collection of silky and versatile Chinese hair extensions, known for their smooth texture and easy styling.',
  'VIETNAM': 'Explore thick and lustrous Vietnamese hair, prized for its durability and natural shine.',
  'CAMBODIA': 'Shop natural and soft Cambodian hair extensions, perfect for a seamless, authentic look.',
  'BURMA': 'Experience raw and premium Burmese hair, sourced from the finest quality donors.',
  'PHILIPPINES': 'Browse smooth and durable Filipino hair extensions, ideal for lasting wear.',
  'INDIA': 'Find classic and reliable Indian hair, a timeless choice for all hair types.',
}

interface OriginPageProps {
  params: Promise<{
    origin: string
  }>
}

export async function generateMetadata({ params }: OriginPageProps): Promise<Metadata> {
  const { origin: originSlug } = await params
  const origin = originSlugMap[originSlug.toLowerCase()]
  
  if (!origin) {
    return { title: 'Origin Not Found | Dehair Vault' }
  }

  const displayName = originDisplayNames[origin]
  const description = originDescriptions[origin]

  return {
    title: `${displayName} Hair Extensions | Dehair Vault`,
    description,
    openGraph: {
      title: `${displayName} Hair Extensions | Dehair Vault`,
      description,
      type: 'website',
      url: `https://dehairvault.com/shop/origin/${originSlug}`,
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(originSlugMap).map((origin) => ({
    origin,
  }))
}

export default async function OriginPage({ params }: OriginPageProps) {
  const { origin: originSlug } = await params
  const origin = originSlugMap[originSlug.toLowerCase()]

  if (!origin) {
    notFound()
  }

  const [products, originImages] = await Promise.all([
    getProductsByOrigin(origin),
    getOriginProductImages(),
  ])

  const displayName = originDisplayNames[origin]
  const description = originDescriptions[origin]

  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Breadcrumb */}
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-4">
            {displayName} Hair
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {description}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{products.length}</span>{' '}
            {products.length === 1 ? 'product' : 'products'} available
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="pb-16">
        <div className="container mx-auto px-6 lg:px-12">
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No products available for this origin yet.
              </p>
              <p className="text-muted-foreground mt-2">
                Check back soon or explore other origins below.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Other Origins Section */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <OriginNavigationCards 
            originImages={originImages}
            currentOrigin={origin}
            compact
          />
        </div>
      </section>

      <Footer />
    </main>
  )
}
