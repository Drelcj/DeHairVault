"use client"

import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HairTexture, HairCategory } from "@/types/database.types"
import { useCurrency } from "@/contexts/currency-context"
import type { FilterState } from "./shop-content-client"

interface ShopSidebarProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  minPrice: number
  maxPrice: number
}

// Map database enum values to display labels
const categoryOptions: { value: HairCategory; label: string }[] = [
  { value: HairCategory.BUNDLES, label: "Bundles" },
  { value: HairCategory.CLOSURE, label: "Closures" },
  { value: HairCategory.FRONTAL, label: "Frontals" },
  { value: HairCategory.WIG, label: "Wigs" },
  { value: HairCategory.PONYTAIL, label: "Ponytails" },
  { value: HairCategory.CLIP_INS, label: "Clip-Ins" },
]

const textureOptions: { value: HairTexture; label: string }[] = [
  { value: HairTexture.STRAIGHT, label: "Straight" },
  { value: HairTexture.BODY_WAVE, label: "Body Wave" },
  { value: HairTexture.LOOSE_WAVE, label: "Loose Wave" },
  { value: HairTexture.DEEP_WAVE, label: "Deep Wave" },
  { value: HairTexture.WATER_WAVE, label: "Water Wave" },
  { value: HairTexture.KINKY_CURLY, label: "Kinky Curly" },
  { value: HairTexture.JERRY_CURL, label: "Jerry Curl" },
  { value: HairTexture.LOOSE_DEEP, label: "Loose Deep" },
  { value: HairTexture.NATURAL_WAVE, label: "Natural Wave" },
]

const lengthOptions = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]

export function ShopSidebar({ filters, setFilters, minPrice, maxPrice }: ShopSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const handleCategoryChange = (category: HairCategory | null) => {
    setFilters((prev) => ({
      ...prev,
      category,
    }))
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set("category", category.toLowerCase())
    } else {
      params.delete("category")
    }
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false })
  }

  const handleTextureChange = (texture: HairTexture, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      textures: checked ? [...prev.textures, texture] : prev.textures.filter((t) => t !== texture),
    }))
  }

  const handleLengthChange = (length: number, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      lengths: checked ? [...prev.lengths, length] : prev.lengths.filter((l) => l !== length),
    }))
  }

  const handlePriceChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [value[0], value[1]] as [number, number],
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      category: null,
      textures: [],
      lengths: [],
      priceRange: [minPrice, maxPrice],
    })
    router.push("/shop", { scroll: false })
  }

  const hasActiveFilters =
    filters.category !== null ||
    filters.textures.length > 0 ||
    filters.lengths.length > 0 ||
    filters.priceRange[0] > minPrice ||
    filters.priceRange[1] < maxPrice

  // Use currency context for formatting
  const { formatPrice: formatCurrencyPrice } = useCurrency()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-medium text-foreground">Refine By</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Category</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="category-all"
              checked={filters.category === null}
              onCheckedChange={() => handleCategoryChange(null)}
              className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <Label
              htmlFor="category-all"
              className="text-sm text-foreground cursor-pointer hover:text-accent transition-colors"
            >
              All Products
            </Label>
          </div>
          {categoryOptions.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-3">
              <Checkbox
                id={`category-${value}`}
                checked={filters.category === value}
                onCheckedChange={() => handleCategoryChange(filters.category === value ? null : value)}
                className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <Label
                htmlFor={`category-${value}`}
                className="text-sm text-foreground cursor-pointer hover:text-accent transition-colors"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Texture Filter */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Texture</h4>
        <div className="space-y-3">
          {textureOptions.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-3">
              <Checkbox
                id={`texture-${value}`}
                checked={filters.textures.includes(value)}
                onCheckedChange={(checked) => handleTextureChange(value, checked as boolean)}
                className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <Label
                htmlFor={`texture-${value}`}
                className="text-sm text-foreground cursor-pointer hover:text-accent transition-colors"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Length Filter */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Length (inches)</h4>
        <div className="grid grid-cols-2 gap-3">
          {lengthOptions.map((length) => (
            <div key={length} className="flex items-center gap-3">
              <Checkbox
                id={`length-${length}`}
                checked={filters.lengths.includes(length)}
                onCheckedChange={(checked) => handleLengthChange(length, checked as boolean)}
                className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <Label
                htmlFor={`length-${length}`}
                className="text-sm text-foreground cursor-pointer hover:text-accent transition-colors"
              >
                {length}"
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Price Range Filter */}
      <div className="space-y-6">
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Price Range</h4>
        <div className="px-1">
          <Slider
            value={filters.priceRange}
            min={minPrice}
            max={maxPrice}
            step={1000}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="px-3 py-1.5 bg-secondary rounded-md">
              <span className="text-sm font-medium text-foreground">{formatCurrencyPrice(filters.priceRange[0])}</span>
            </div>
            <span className="text-muted-foreground text-sm">to</span>
            <div className="px-3 py-1.5 bg-secondary rounded-md">
              <span className="text-sm font-medium text-foreground">{formatCurrencyPrice(filters.priceRange[1])}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Additional Info */}
      <div className="p-4 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          All our hair extensions are 100% virgin human hair, ethically sourced and crafted for lasting elegance.
        </p>
      </div>
    </div>
  )
}
