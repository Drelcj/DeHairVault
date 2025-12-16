import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/app/admin/products/_components/product-form'
import { updateProductAction } from '@/app/admin/products/actions'
import { createServiceClient } from '@/lib/supabase/server'
import type { ProductFormValues } from '@/types/admin'

async function fetchProduct(id: string): Promise<ProductFormValues | null> {
  const supabase = createServiceClient()
  const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error || !product) return null

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id)

  return {
    ...product,
    variants: variants ?? [],
  } as ProductFormValues
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id)
  if (!product) {
    return notFound()
  }

  const handleSubmit = async (values: ProductFormValues) => {
    'use server'
    return await updateProductAction(params.id, values)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">Update product details and variants.</p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/admin/products">Back to list</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <ProductForm mode="edit" initialData={product} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
