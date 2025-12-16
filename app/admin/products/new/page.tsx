import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/app/admin/products/_components/product-form'
import { createProductAction } from '@/app/admin/products/actions'
import type { ProductFormValues } from '@/types/admin'

export const dynamic = 'force-dynamic'

export default function NewProductPage() {
  const handleSubmit = async (values: ProductFormValues) => {
    'use server'
    return await createProductAction(values)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Product</h1>
          <p className="text-sm text-muted-foreground">Add a new product to the catalog.</p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/admin/products">Back to list</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <ProductForm mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
