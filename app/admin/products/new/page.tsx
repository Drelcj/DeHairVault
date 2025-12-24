import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '@/app/admin/products/_components/product-form'
import { createProductAction } from '@/app/admin/products/actions'
import type { ProductFormValues } from '@/types/admin'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Add Product | De Hair Vault Admin",
}

export default function NewProductPage() {
  const handleSubmit = async (values: ProductFormValues) => {
    'use server'
    return await createProductAction(values)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/admin/products" 
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-foreground">
            Add New Product
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create a new product for your catalog
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <ProductForm mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
