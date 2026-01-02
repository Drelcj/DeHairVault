import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/server"
import { ProductForm } from "@/app/admin/products/_components/product-form"
import { updateProductAction } from "@/app/admin/products/actions"
import type { ProductFormValues } from "@/types/admin"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Edit Product | De Hair Vault Admin",
}

async function getProduct(id: string) {
  const supabase = createServiceClient()
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    return null
  }

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id)

  return { product, variants: variants || [] }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminProductEditPage({ params }: PageProps) {
  const { id } = await params
  const data = await getProduct(id)

  if (!data) {
    notFound()
  }

  const { product, variants } = data

  // Convert to ProductFormValues format
  const initialData: Partial<ProductFormValues> = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    short_description: product.short_description,
    grade: product.grade,
    origin: product.origin,
    texture: product.texture,
    category: product.category,
    draw_type: product.draw_type,
    available_lengths: product.available_lengths || [],
    base_price_gbp: product.base_price_gbp,
    compare_at_price_gbp: product.compare_at_price_gbp,
    cost_price_gbp: product.cost_price_gbp,
    length_price_modifiers: product.length_price_modifiers,
    stock_quantity: product.stock_quantity,
    low_stock_threshold: product.low_stock_threshold,
    track_inventory: product.track_inventory,
    allow_backorder: product.allow_backorder,
    images: product.images || [],
    thumbnail_url: product.thumbnail_url,
    video_url: product.video_url,
    is_active: product.is_active,
    is_featured: product.is_featured,
    is_new_arrival: product.is_new_arrival,
    is_preorder_only: product.is_preorder_only,
    variants: variants.map((v: any) => ({
      id: v.id,
      length: v.length,
      sku: v.sku || '',
      price_override_gbp: v.price_override_gbp,
      stock_quantity: v.stock_quantity,
      weight_grams: v.weight_grams,
    })),
  }

  const handleSubmit = async (values: ProductFormValues) => {
    'use server'
    return await updateProductAction(id, values)
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
            Edit Product
          </h1>
          <p className="mt-1 text-muted-foreground">
            Update {product.name}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <ProductForm mode="edit" initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
