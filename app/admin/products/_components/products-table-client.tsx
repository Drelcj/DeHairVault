'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'
import { deleteProduct } from '@/lib/actions/products'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  slug: string
  base_price_gbp: number
  stock_quantity: number
  is_active: boolean
  category: string
  images: string[] | null
}

interface ProductsTableClientProps {
  products: Product[]
}

export function ProductsTableClient({ products }: ProductsTableClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!productToDelete) return

    startTransition(async () => {
      const result = await deleteProduct(productToDelete.id)
      
      if (result.success) {
        toast.success(`"${productToDelete.name}" has been deleted`)
        setDeleteDialogOpen(false)
        setProductToDelete(null)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete product')
      }
    })
  }

  return (
    <>
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
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No products found</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
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
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Delete Product</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">"{productToDelete?.name}"</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? 'Deleting...' : 'Delete Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
