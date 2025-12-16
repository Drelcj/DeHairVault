import { createClient } from "@/lib/supabase/server"
import ProductEditForm from "./product-edit-form"
import type { Product, ProductVariant } from "@/types/database.types"

interface PageProps {
  params: { id: string }
}

export const metadata = {
  title: "Edit Product | De Hair Vault Admin",
}

export default async function ProductEditPage({ params }: PageProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
          <h1 className="text-3xl font-serif font-semibold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">
            Supabase environment variables are not configured. Add NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY to enable product editing.
          </p>
        </header>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single()

  if (productError || !product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
          <h1 className="text-3xl font-serif font-semibold">Edit Product</h1>
        </header>
        <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find a product with the provided ID. Verify the URL or select a product from the admin
            catalog first.
          </p>
        </div>
      </div>
    )
  }

  const { data: variants = [] } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .order("length")

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
        <h1 className="text-3xl font-serif font-semibold">Edit Product</h1>
        <p className="text-sm text-muted-foreground">Update product details and manage variant overrides.</p>
      </header>

      <div className="mt-8">
        <ProductEditForm product={product as Product} variants={(variants ?? []) as ProductVariant[]} />
      </div>
    </div>
  )
}
