"use client"

import { useState, useEffect, useCallback } from "react"
import { ShopSidebar } from "./shop-sidebar"
import { ProductGrid } from "./product-grid"
import { ShopToolbar } from "./shop-toolbar"
import { SlidersHorizontal, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { textureFilterMap, MIN_PRICE_NGN, MAX_PRICE_NGN } from "@/lib/utils/product"

export interface FilterState {
  textures: string[]
  lengths: string[]
  priceRange: [number, number]
}

export interface Product {
  id: string
  name: string
  slug: string
  short_description: string | null
  grade: string
  origin: string
  texture: string
  category: string
  base_price_ngn: number
  compare_at_price_ngn: number | null
  available_lengths: number[]
  images: string[]
  thumbnail_url: string | null
  is_featured: boolean
  is_new_arrival: boolean
  is_bestseller: boolean
  stock_quantity: number
  created_at: string
}

export function ShopContent() {
  const [filters, setFilters] = useState<FilterState>({
    textures: [],
    lengths: [],
    priceRange: [MIN_PRICE_NGN, MAX_PRICE_NGN],
  })
  const [sortBy, setSortBy] = useState("featured")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalProducts, setTotalProducts] = useState(0)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('sort', sortBy)
      params.set('pageSize', '50')
      
      if (filters.priceRange[0] > MIN_PRICE_NGN) {
        params.set('minPrice', String(filters.priceRange[0]))
      }
      if (filters.priceRange[1] < MAX_PRICE_NGN) {
        params.set('maxPrice', String(filters.priceRange[1]))
      }

      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await res.json()
      setProducts(data.products || [])
      setTotalProducts(data.pagination?.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [sortBy, filters.priceRange])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Client-side filtering for textures and lengths (since API doesn't support multiple values)
  const filteredProducts = products.filter((product) => {
    // Texture filter
    if (filters.textures.length > 0) {
      const displayTexture = textureFilterMap[product.texture] || product.texture
      if (!filters.textures.includes(displayTexture)) {
        return false
      }
    }
    
    // Length filter
    if (filters.lengths.length > 0) {
      const productLengths = product.available_lengths.map(l => `${l}"`)
      const hasMatchingLength = filters.lengths.some(filterLen => productLengths.includes(filterLen))
      if (!hasMatchingLength) {
        return false
      }
    }
    
    return true
  })

  const activeFilterCount =
    filters.textures.length +
    filters.lengths.length +
    (filters.priceRange[0] > MIN_PRICE_NGN || filters.priceRange[1] < MAX_PRICE_NGN ? 1 : 0)

  return (
    <section className="pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden flex items-center gap-2 border-border hover:bg-secondary bg-transparent"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetTitle className="sr-only">Filter Products</SheetTitle>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-xl font-medium">Filters</h2>
                    <Button variant="ghost" size="sm" onClick={() => setMobileFiltersOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <ShopSidebar filters={filters} setFilters={setFilters} />
                </div>
              </SheetContent>
            </Sheet>

            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredProducts.length}</span>{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          <ShopToolbar sortBy={sortBy} setSortBy={setSortBy} />
        </div>

        <div className="flex gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <ShopSidebar filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchProducts} variant="outline">Try Again</Button>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
