import Link from "next/link"
import { HeaderShell } from "@/components/header-shell"
import { formatPrice } from "@/lib/utils/currency"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Products | De Hair Vault Admin",
}

async function getProducts(searchParams: Record<string, string | string[] | undefined>) {
  try {
    const query = new URLSearchParams()
    if (searchParams.q) query.append('q', String(searchParams.q))
    if (searchParams.sort) query.append('sort', String(searchParams.sort))
    if (searchParams.page) query.append('page', String(searchParams.page))

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    const res = await fetch(`${baseUrl}/api/admin/products?${query}`, { cache: 'no-store' })
    if (!res.ok) {
      console.error('Failed to fetch products:', res.status)
      return { products: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
  }
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const data = await getProducts(searchParams)
  const products = data?.products ?? []
  const page = data?.page ?? 1
  const totalPages = data?.totalPages ?? 1
  const q = searchParams.q ? String(searchParams.q) : ''

  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <section className="container mx-auto px-6 lg:px-12 py-10">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
              <h1 className="font-[--font-playfair] text-2xl md:text-3xl font-medium text-foreground">Products</h1>
            </div>
            <Link href="/admin/products/new" className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
              + Add Product
            </Link>
          </div>
        </div>

        <div className="mb-6 flex gap-2 items-end">
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={q}
            onChange={(e) => {
              const url = new URL(window.location.href)
              if (e.target.value) {
                url.searchParams.set('q', e.target.value)
              } else {
                url.searchParams.delete('q')
              }
              url.searchParams.set('page', '1')
              window.location.href = url.toString()
            }}
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
          />
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border bg-muted/50">
                  <th className="px-4 md:px-6 py-4 font-medium">Product Name</th>
                  <th className="px-4 md:px-6 py-4 font-medium">SKU</th>
                  <th className="px-4 md:px-6 py-4 font-medium">Price (₦)</th>
                  <th className="px-4 md:px-6 py-4 font-medium">Stock</th>
                  <th className="px-4 md:px-6 py-4 font-medium">Status</th>
                  <th className="px-4 md:px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td className="px-4 md:px-6 py-6 text-muted-foreground" colSpan={6}>No products found.</td>
                  </tr>
                ) : (
                  products.map((product: any) => (
                    <tr key={product.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 md:px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-4 md:px-6 py-4 text-muted-foreground">{product.sku || '—'}</td>
                      <td className="px-4 md:px-6 py-4">{formatPrice(Number(product.price_ngn || 0), 'NGN')}</td>
                      <td className="px-4 md:px-6 py-4">{product.stock_quantity ?? '—'}</td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${product.is_available ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                          {product.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <Link href={`/admin/products/${product.id}/edit`} className="text-accent hover:text-accent/80 text-sm font-medium">
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

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {page > 1 && (
              <Link href={`/admin/products?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-2 border border-border rounded hover:bg-muted">
                ← Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/products?page=${p}${q ? `&q=${q}` : ''}`}
                className={`px-3 py-2 rounded ${p === page ? 'bg-accent text-accent-foreground' : 'border border-border hover:bg-muted'}`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link href={`/admin/products?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-2 border border-border rounded hover:bg-muted">
                Next →
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
