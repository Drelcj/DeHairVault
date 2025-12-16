import Link from "next/link"
import { HeaderShell } from "@/components/header-shell"
import { ProductEditForm } from "./_components/product-edit-form"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Edit Product | De Hair Vault Admin",
}

async function getProduct(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    const res = await fetch(`${baseUrl}/api/admin/products/${id}`, { cache: 'no-store' })
    if (!res.ok) {
      console.error('Failed to fetch product:', res.status)
      return null
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function AdminProductEditPage({ params }: { params: { id: string } }) {
  const data = await getProduct(params.id)
  const product = data?.product
  const variants = data?.variants ?? []

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <HeaderShell />
        <section className="container mx-auto px-6 lg:px-12 py-10">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
            <h1 className="font-[--font-playfair] text-2xl md:text-3xl font-medium text-foreground">Edit Product</h1>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground mb-4">Product not found.</p>
            <Link href="/admin/products" className="text-accent hover:text-accent/80 text-sm font-medium">
              ← Back to Products
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <section className="container mx-auto px-6 lg:px-12 py-10">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
              <h1 className="font-[--font-playfair] text-2xl md:text-3xl font-medium text-foreground">Edit {product.name}</h1>
            </div>
            <Link href="/admin/products" className="text-sm text-accent hover:text-accent/80">Back to Products</Link>
          </div>
        </div>

        <ProductEditForm product={product} variants={variants} />
      </section>
    </main>
  )
}
