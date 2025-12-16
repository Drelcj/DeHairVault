import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createServiceClient } from '@/lib/supabase/server'
import type { Product } from '@/types/database.types'

export const dynamic = 'force-dynamic'

async function fetchProducts(): Promise<Product[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, category, grade, base_price_ngn, is_active, updated_at')
    .order('updated_at', { ascending: false })

  if (error || !data) return []
  return data
}

export default async function ProductsPage() {
  const products = await fetchProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage catalog and pricing.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">New Product</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Grade</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Price (NGN)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{product.grade}</td>
                <td className="px-4 py-3">₦{product.base_price_ngn.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/products/${product.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
