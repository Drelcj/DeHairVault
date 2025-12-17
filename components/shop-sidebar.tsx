"use client"

import type React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils/currency"
import { MIN_PRICE_NGN, MAX_PRICE_NGN } from "@/lib/utils/product"
import type { FilterState } from "./shop-content"

interface ShopSidebarProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
}

const textures = ["Straight", "Wavy", "Curly"]
const lengths = ['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"']

export function ShopSidebar({ filters, setFilters }: ShopSidebarProps) {
  const handleTextureChange = (texture: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      textures: checked ? [...prev.textures, texture] : prev.textures.filter((t) => t !== texture),
    }))
  }

  const handleLengthChange = (length: string, checked: boolean) => {
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
      textures: [],
      lengths: [],
      priceRange: [MIN_PRICE_NGN, MAX_PRICE_NGN],
    })
  }

  const hasActiveFilters =
    filters.textures.length > 0 ||
    filters.lengths.length > 0 ||
    filters.priceRange[0] > MIN_PRICE_NGN ||
    filters.priceRange[1] < MAX_PRICE_NGN

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

      {/* Texture Filter */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Texture</h4>
        <div className="space-y-3">
          {textures.map((texture) => (
            <div key={texture} className="flex items-center gap-3">
              <Checkbox
                id={`texture-${texture}`}
                checked={filters.textures.includes(texture)}
                onCheckedChange={(checked) => handleTextureChange(texture, checked as boolean)}
                className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <Label
                htmlFor={`texture-${texture}`}
                className="text-sm text-foreground cursor-pointer hover:text-accent transition-colors"
              >
                {texture}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Length Filter */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Length</h4>
        <div className="grid grid-cols-2 gap-3">
          {lengths.map((length) => (
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
                {length}
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
            min={MIN_PRICE_NGN}
            max={MAX_PRICE_NGN}
            step={10000}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="px-3 py-1.5 bg-secondary rounded-md">
              <span className="text-sm font-medium text-foreground">{formatPrice(filters.priceRange[0], 'NGN', { showDecimals: false })}</span>
            </div>
            <span className="text-muted-foreground text-sm">to</span>
            <div className="px-3 py-1.5 bg-secondary rounded-md">
              <span className="text-sm font-medium text-foreground">{formatPrice(filters.priceRange[1], 'NGN', { showDecimals: false })}</span>
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
