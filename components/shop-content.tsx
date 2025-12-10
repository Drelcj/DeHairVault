"use client"

import { useState, useMemo } from "react"
import { ShopSidebar } from "./shop-sidebar"
import { ProductGrid } from "./product-grid"
import { ShopToolbar } from "./shop-toolbar"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export interface FilterState {
  textures: string[]
  lengths: string[]
  priceRange: [number, number]
}

const products = [
  {
    id: 1,
    name: "Silky Straight Bundle",
    price: 180,
    texture: "Straight",
    length: '18"',
    image: "silky straight hair bundle elegant packaging",
    featured: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    name: "Body Wave Bundle",
    price: 195,
    texture: "Wavy",
    length: '20"',
    image: "body wave hair extensions luxurious",
    featured: true,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: 3,
    name: "Deep Curly Bundle",
    price: 220,
    texture: "Curly",
    length: '16"',
    image: "deep curly hair bundle premium quality",
    featured: false,
    createdAt: new Date("2024-03-10"),
  },
  {
    id: 4,
    name: "Natural Wave Bundle",
    price: 175,
    texture: "Wavy",
    length: '14"',
    image: "natural wave hair extensions elegant",
    featured: true,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: 5,
    name: "Kinky Straight Bundle",
    price: 200,
    texture: "Straight",
    length: '22"',
    image: "kinky straight hair bundle luxury",
    featured: false,
    createdAt: new Date("2024-02-15"),
  },
  {
    id: 6,
    name: "Loose Wave Bundle",
    price: 185,
    texture: "Wavy",
    length: '18"',
    image: "loose wave hair extensions premium",
    featured: true,
    createdAt: new Date("2024-03-01"),
  },
  {
    id: 7,
    name: "Jerry Curl Bundle",
    price: 210,
    texture: "Curly",
    length: '14"',
    image: "jerry curl hair bundle elegant styling",
    featured: false,
    createdAt: new Date("2024-01-25"),
  },
  {
    id: 8,
    name: "Straight Closure",
    price: 150,
    texture: "Straight",
    length: '16"',
    image: "straight lace closure luxury hair",
    featured: true,
    createdAt: new Date("2024-02-20"),
  },
  {
    id: 9,
    name: "Water Wave Bundle",
    price: 205,
    texture: "Wavy",
    length: '24"',
    image: "water wave hair extensions elegant",
    featured: false,
    createdAt: new Date("2024-03-15"),
  },
  {
    id: 10,
    name: "Afro Kinky Curly",
    price: 230,
    texture: "Curly",
    length: '12"',
    image: "afro kinky curly hair bundle premium",
    featured: true,
    createdAt: new Date("2024-01-30"),
  },
  {
    id: 11,
    name: "Yaki Straight Bundle",
    price: 190,
    texture: "Straight",
    length: '20"',
    image: "yaki straight hair extensions luxury",
    featured: false,
    createdAt: new Date("2024-02-25"),
  },
  {
    id: 12,
    name: "Bohemian Curl Bundle",
    price: 215,
    texture: "Curly",
    length: '18"',
    image: "bohemian curl hair bundle elegant",
    featured: true,
    createdAt: new Date("2024-03-05"),
  },
]

export function ShopContent() {
  const [filters, setFilters] = useState<FilterState>({
    textures: [],
    lengths: [],
    priceRange: [100, 300],
  })
  const [sortBy, setSortBy] = useState("featured")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Apply texture filter
    if (filters.textures.length > 0) {
      result = result.filter((p) => filters.textures.includes(p.texture))
    }

    // Apply length filter
    if (filters.lengths.length > 0) {
      result = result.filter((p) => filters.lengths.includes(p.length))
    }

    // Apply price range filter
    result = result.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1])

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case "featured":
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    return result
  }, [filters, sortBy])

  const activeFilterCount =
    filters.textures.length +
    filters.lengths.length +
    (filters.priceRange[0] > 100 || filters.priceRange[1] < 300 ? 1 : 0)

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
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>
    </section>
  )
}
