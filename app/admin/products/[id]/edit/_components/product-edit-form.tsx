'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils/currency'

interface Product {
  id: string
  name: string
  description?: string
  category?: string
  sku?: string
  price_ngn?: number
  stock_quantity?: number
  is_available?: boolean
  created_at?: string
  updated_at?: string
}

interface ProductEditFormProps {
  product: Product
  variants: any[]
}

export function ProductEditForm({ product, variants }: ProductEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    category: product.category || '',
    sku: product.sku || '',
    price_ngn: product.price_ngn || 0,
    stock_quantity: product.stock_quantity || 0,
    is_available: product.is_available ?? true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to update product')
      }

      router.refresh()
      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Product Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sku" className="text-sm font-medium">SKU</label>
          <input
            id="sku"
            name="sku"
            type="text"
            value={formData.sku}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="price_ngn" className="text-sm font-medium">Price (₦) *</label>
          <input
            id="price_ngn"
            name="price_ngn"
            type="number"
            required
            step="100"
            value={formData.price_ngn}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="stock_quantity" className="text-sm font-medium">Stock Quantity</label>
          <input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="is_available"
            name="is_available"
            type="checkbox"
            checked={formData.is_available}
            onChange={handleChange}
            className="rounded border-border"
          />
          <label htmlFor="is_available" className="text-sm font-medium">Available for sale</label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <label htmlFor="description" className="text-sm font-medium block mb-2">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
