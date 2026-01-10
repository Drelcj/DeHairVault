import { getProducts } from "@/lib/actions/products"
import { getOriginProductImages } from "@/lib/actions/origin"
import { ShopContentClient } from "./shop-content-client"

export async function ShopContent() {
  // Fetch all active products and origin images in parallel
  const [products, originImages] = await Promise.all([
    getProducts({ isActive: true }),
    getOriginProductImages(),
  ])

  // Calculate min and max prices for the price range filter (in GBP)
  const prices = products.map(p => p.base_price_gbp)
  const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 10) * 10 : 0
  const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 10) * 10 : 500

  return (
    <ShopContentClient 
      initialProducts={products} 
      minPrice={minPrice} 
      maxPrice={maxPrice}
      originImages={originImages}
    />
  )
}
