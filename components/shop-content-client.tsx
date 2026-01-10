"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ShopSidebar } from "./shop-sidebar"
import { ProductGrid } from "./product-grid"
import { ShopToolbar } from "./shop-toolbar"
import { OriginNavigationCards } from "./origin-navigation-cards"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import type { Product, HairTexture, HairCategory, HairOrigin } from "@/types/database.types"

export interface FilterState {
  category: HairCategory | null
  origin: HairOrigin | null
  textures: HairTexture[]
  lengths: number[]
  priceRange: [number, number]
}

interface ShopContentClientProps {
  initialProducts: Product[]
  minPrice: number
  maxPrice: number
  originImages?: Record<HairOrigin, string[]>
}

export function ShopContentClient({ initialProducts, minPrice, maxPrice, originImages = {} as Record<HairOrigin, string[]> }: ShopContentClientProps) {
  const searchParams = useSearchParams()
  
  // Get category and origin from URL query params
  const categoryParam = searchParams.get("category")?.toUpperCase() as HairCategory | null
  const originParam = searchParams.get("origin")?.toUpperCase() as HairOrigin | null
  
  const [filters, setFilters] = useState<FilterState>({
    category: categoryParam || null,
    origin: originParam || null,
    textures: [],
    lengths: [],
    priceRange: [minPrice, maxPrice],
  })
  
  // Update filters when URL changes
  useEffect(() => {
    const newCategory = searchParams.get("category")?.toUpperCase() as HairCategory | null
    const newOrigin = searchParams.get("origin")?.toUpperCase() as HairOrigin | null
    setFilters(prev => ({ 
      ...prev, 
      category: newCategory || null,
      origin: newOrigin || null
    }))
  }, [searchParams])
  const [sortBy, setSortBy] = useState("featured")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts]

    // Apply category filter
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category)
    }

    // Apply origin filter
    if (filters.origin) {
      result = result.filter((p) => p.origin === filters.origin)
    }

    // Apply texture filter
    if (filters.textures.length > 0) {
      result = result.filter((p) => filters.textures.includes(p.texture))
    }

    // Apply length filter
    if (filters.lengths.length > 0) {
      result = result.filter((p) => 
        filters.lengths.some(length => p.available_lengths.includes(length))
      )
    }

    // Apply price range filter (prices are in GBP)
    result = result.filter((p) => p.base_price_gbp >= filters.priceRange[0] && p.base_price_gbp <= filters.priceRange[1])

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.base_price_gbp - b.base_price_gbp)
        break
      case "price-high":
        result.sort((a, b) => b.base_price_gbp - a.base_price_gbp)
        break
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "featured":
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
        break
    }

    return result
  }, [initialProducts, filters, sortBy])

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.origin ? 1 : 0) +
    filters.textures.length +
    filters.lengths.length +
    (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? 1 : 0)

  return (
    <section className="pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Origin Navigation Cards */}
        <OriginNavigationCards originImages={originImages} />

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
                  <ShopSidebar filters={filters} setFilters={setFilters} minPrice={minPrice} maxPrice={maxPrice} />
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
              <ShopSidebar filters={filters} setFilters={setFilters} minPrice={minPrice} maxPrice={maxPrice} />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>
    </section>
  )
}
