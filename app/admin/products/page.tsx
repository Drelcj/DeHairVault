import Link from "next/link"
import { Package, Plus, Search } from "lucide-react"
import { createServiceClient } from "@/lib/supabase/server"
import { ProductsTableClient } from "./_components/products-table-client"

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
      <ProductsTableClient products={data.products} />

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
