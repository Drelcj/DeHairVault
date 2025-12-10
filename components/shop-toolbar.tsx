"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShopToolbarProps {
  sortBy: string
  setSortBy: (value: string) => void
}

export function ShopToolbar({ sortBy, setSortBy }: ShopToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground hidden sm:block">Sort by:</span>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px] border-border bg-background hover:bg-secondary transition-colors">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="featured" className="cursor-pointer">
            Featured
          </SelectItem>
          <SelectItem value="newest" className="cursor-pointer">
            Newest Arrivals
          </SelectItem>
          <SelectItem value="price-low" className="cursor-pointer">
            Price: Low to High
          </SelectItem>
          <SelectItem value="price-high" className="cursor-pointer">
            Price: High to Low
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
