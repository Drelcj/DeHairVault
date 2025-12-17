import { getProducts } from "@/lib/actions/products"
import { ShopContentClient } from "./shop-content-client"

export async function ShopContent() {
  // Fetch all active products from Supabase
  const products = await getProducts({ isActive: true })

  // Calculate min and max prices for the price range filter
  const prices = products.map(p => p.base_price_ngn)
  const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 1000) * 1000 : 0
  const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 500000

  return <ShopContentClient initialProducts={products} minPrice={minPrice} maxPrice={maxPrice} />
}
