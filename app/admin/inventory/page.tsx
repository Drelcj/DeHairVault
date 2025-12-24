import Link from "next/link"
import { Package, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import { formatPrice } from "@/lib/utils/currency"
import { createServiceClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Inventory | De Hair Vault Admin",
}

interface ProductInventory {
  id: string
  name: string
  slug: string
  stock_quantity: number
  low_stock_threshold: number
  images: string[] | null
  base_price_ngn: number
  category: string
  is_active?: boolean
}

async function getInventoryStats() {
  const supabase = createServiceClient()
  
  // Get total products
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  // Get low stock products (stock_quantity <= low_stock_threshold)
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('id, name, slug, stock_quantity, low_stock_threshold, images, base_price_ngn, category')
    .lte('stock_quantity', 10)
    .gt('stock_quantity', 0)
    .order('stock_quantity', { ascending: true })

  // Get out of stock products
  const { data: outOfStockProducts } = await supabase
    .from('products')
    .select('id, name, slug, stock_quantity, low_stock_threshold, images, base_price_ngn, category')
    .eq('stock_quantity', 0)

  // Get all products for inventory table
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, slug, stock_quantity, low_stock_threshold, images, base_price_ngn, category, is_active')
    .order('stock_quantity', { ascending: true })
    .limit(100)

  // Calculate total inventory value
  const { data: inventoryValue } = await supabase
    .from('products')
    .select('stock_quantity, base_price_ngn')

  const products = inventoryValue as { stock_quantity: number; base_price_ngn: number }[] | null
  const totalValue = products?.reduce((sum, p) => sum + (p.stock_quantity * p.base_price_ngn), 0) || 0

  return {
    totalProducts: totalProducts || 0,
    lowStockCount: (lowStockProducts as ProductInventory[] | null)?.length || 0,
    outOfStockCount: (outOfStockProducts as ProductInventory[] | null)?.length || 0,
    totalValue,
    lowStockProducts: (lowStockProducts || []) as ProductInventory[],
    outOfStockProducts: (outOfStockProducts || []) as ProductInventory[],
    allProducts: (allProducts || []) as ProductInventory[],
  }
}

export default async function InventoryPage() {
  const stats = await getInventoryStats()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-foreground">
          Inventory
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track and manage your product inventory levels
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-semibold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-semibold">{formatPrice(stats.totalValue, 'NGN')}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2.5">
              <TrendingDown className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-semibold">{stats.lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2.5">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-semibold">{stats.outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(stats.outOfStockProducts.length > 0 || stats.lowStockProducts.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Out of Stock Alert */}
          {stats.outOfStockProducts.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Out of Stock</h2>
              </div>
              <div className="space-y-3">
                {stats.outOfStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <Link 
                      href={`/admin/products/${product.slug}/edit`}
                      className="text-sm font-medium text-red-900 dark:text-red-100 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs text-red-700 dark:text-red-300">{product.category}</span>
                  </div>
                ))}
                {stats.outOfStockProducts.length > 5 && (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    +{stats.outOfStockProducts.length - 5} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Low Stock Alert */}
          {stats.lowStockProducts.length > 0 && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Low Stock</h2>
              </div>
              <div className="space-y-3">
                {stats.lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <Link 
                      href={`/admin/products/${product.slug}/edit`}
                      className="text-sm font-medium text-yellow-900 dark:text-yellow-100 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs text-yellow-700 dark:text-yellow-300">
                      {product.stock_quantity} left
                    </span>
                  </div>
                ))}
                {stats.lowStockProducts.length > 5 && (
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    +{stats.lowStockProducts.length - 5} more items
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">All Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Stock</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Threshold</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Unit Price</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Total Value</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.allProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No products found</p>
                  </td>
                </tr>
              ) : (
                stats.allProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/products/${product.slug}/edit`}
                        className="font-medium text-foreground hover:text-accent"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        product.stock_quantity === 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : product.stock_quantity <= product.low_stock_threshold
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-foreground'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {product.low_stock_threshold}
                    </td>
                    <td className="px-6 py-4">
                      {formatPrice(product.base_price_ngn, 'NGN')}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(product.stock_quantity * product.base_price_ngn, 'NGN')}
                    </td>
                    <td className="px-6 py-4">
                      <StockStatusBadge 
                        stock={product.stock_quantity} 
                        threshold={product.low_stock_threshold}
                        isActive={product.is_active ?? true}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StockStatusBadge({ stock, threshold, isActive }: { stock: number; threshold: number; isActive: boolean }) {
  if (!isActive) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
        Inactive
      </span>
    )
  }
  
  if (stock === 0) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        Out of Stock
      </span>
    )
  }
  
  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        Low Stock
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      In Stock
    </span>
  )
}
