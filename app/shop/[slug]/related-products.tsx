'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCurrency } from '@/contexts/currency-context'
import type { Product } from '@/types/database.types'

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const { formatPrice } = useCurrency()

  if (products.length === 0) return null

  return (
    <section className="container mx-auto px-6 lg:px-12 py-16 border-t border-border">
      <div className="text-center mb-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-medium text-foreground mb-2">
          You May Also Like
        </h2>
        <p className="text-muted-foreground">
          Explore more products from our collection
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            className="group"
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mb-4">
              <Image
                src={product.thumbnail_url || product.images?.[0] || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.is_featured && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium uppercase tracking-wider rounded-full">
                  Featured
                </div>
              )}
              {product.is_new_arrival && !product.is_featured && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium uppercase tracking-wider rounded-full">
                  New
                </div>
              )}
              {product.compare_at_price_gbp && product.compare_at_price_gbp > product.base_price_gbp && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                  Sale
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {product.texture.replace('_', ' ')}
              </p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">
                  {formatPrice(product.base_price_gbp)}
                </p>
                {product.compare_at_price_gbp && product.compare_at_price_gbp > product.base_price_gbp && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price_gbp)}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          View All Products
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
