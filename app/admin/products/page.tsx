import Link from "next/link"
import { Package, Plus, Edit, Search } from "lucide-react"
import { formatPrice } from "@/lib/utils/currency"
import { createServiceClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Products | De Hair Vault Admin",
}

async function getProducts(searchQuery?: string, page: number = 1, pageSize: number = 20) {
  const supabase = createServiceClient()
  
  let query = supabase
    .from('products')
    .select('id, name, slug, base_price_gbp, stock_quantity, is_active, category, images, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [], total: 0, page, pageSize, totalPages: 0 }
  }

  return {
    products: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export default async function AdminProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string | string[] | undefined>> 
}) {
  const params = await searchParams
  const q = params.q ? String(params.q) : undefined
  const page = params.page ? parseInt(String(params.page)) : 1
  const data = await getProducts(q, page)
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-foreground">
            Products
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your product catalog ({data.total} products)
          </p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <form action="/admin/products" method="get" className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          name="q"
          placeholder="Search products..."
          defaultValue={q}
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </form>

      {/* Products Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Stock</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">
                      {q ? `No products matching "${q}"` : 'No products found'}
                    </p>
                    <Link
                      href="/admin/products/new"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
                    >
                      <Plus className="h-4 w-4" />
                      Add your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                data.products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(Number(product.base_price_gbp || 0), 'GBP')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        product.stock_quantity === 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : product.stock_quantity <= 10
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-foreground'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {data.page > 1 && (
            <Link 
              href={`/admin/products?page=${data.page - 1}${q ? `&q=${q}` : ''}`} 
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Previous
            </Link>
          )}
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
              let pageNum: number
              if (data.totalPages <= 5) {
                pageNum = i + 1
              } else if (data.page <= 3) {
                pageNum = i + 1
              } else if (data.page >= data.totalPages - 2) {
                pageNum = data.totalPages - 4 + i
              } else {
                pageNum = data.page - 2 + i
              }
              return pageNum
            }).map((p) => (
              <Link
                key={p}
                href={`/admin/products?page=${p}${q ? `&q=${q}` : ''}`}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  p === data.page 
                    ? 'bg-accent text-accent-foreground' 
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>

          {data.page < data.totalPages && (
            <Link 
              href={`/admin/products?page=${data.page + 1}${q ? `&q=${q}` : ''}`} 
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
