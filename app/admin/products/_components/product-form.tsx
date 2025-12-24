"use client"

import { useMemo, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { hairCategoryOptions, hairGradeOptions, hairOriginOptions, hairTextureOptions, drawTypeOptions } from '@/lib/constants/enums'
import { useProductForm } from '@/hooks/useProductForm'
import type { ActionResult, ProductFormValues } from '@/types/admin'
import { DrawType } from '@/types/database.types'
import { ImageUpload } from './image-upload'

type Props = {
  initialData?: Partial<ProductFormValues>
  onSubmit: (values: ProductFormValues) => Promise<ActionResult>
  mode?: 'create' | 'edit'
}

export function ProductForm({ initialData, onSubmit, mode = 'create' }: Props) {
  const form = useProductForm(initialData)
  const [isPending, startTransition] = useTransition()

  const lengthString = useMemo(() => form.values.available_lengths.join(', '), [form.values.available_lengths])
  const modifierJson = useMemo(
    () => (form.values.length_price_modifiers ? JSON.stringify(form.values.length_price_modifiers, null, 2) : ''),
    [form.values.length_price_modifiers]
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    form.resetMessages()

    startTransition(async () => {
      const result = await onSubmit(form.values)
      if (result?.error) {
        form.setError(result.error)
      } else if (result?.success) {
        form.setSuccessMessage(result.message ?? 'Saved')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
          <p className="text-sm text-muted-foreground">Product name, description, and identifiers</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.values.name}
              onChange={(e) => form.updateField('name', e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.values.slug}
              onChange={(e) => form.updateField('slug', e.target.value)}
              placeholder="auto-generated from name"
              className="bg-background"
            />
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={form.values.description ?? ''}
              onChange={(e) => form.updateField('description', e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              rows={2}
              value={form.values.short_description ?? ''}
              onChange={(e) => form.updateField('short_description', e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
      </section>

      {/* Hair Properties */}
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-foreground">Hair Properties</h3>
          <p className="text-sm text-muted-foreground">Grade, texture, origin, and category</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <Label>Grade</Label>
            <Select
              value={form.values.grade}
              onValueChange={(value) => form.updateField('grade', value as ProductFormValues['grade'])}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {hairGradeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Texture</Label>
            <Select
              value={form.values.texture}
              onValueChange={(value) => form.updateField('texture', value as ProductFormValues['texture'])}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select texture" />
              </SelectTrigger>
              <SelectContent>
                {hairTextureOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Origin</Label>
            <Select
              value={form.values.origin}
              onValueChange={(value) => form.updateField('origin', value as ProductFormValues['origin'])}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select origin" />
              </SelectTrigger>
              <SelectContent>
                {hairOriginOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Category</Label>
            <Select
              value={form.values.category}
              onValueChange={(value) => form.updateField('category', value as ProductFormValues['category'])}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {hairCategoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Draw Type</Label>
            <Select
              value={(form.values.draw_type ?? 'NA').toString()}
              onValueChange={(value) =>
                form.updateField('draw_type', value === 'NA' ? null : (value as DrawType))
              }
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select draw" />
              </SelectTrigger>
              <SelectContent>
                {drawTypeOptions.map((option) => (
                  <SelectItem key={option.label} value={option.value ?? 'NA'}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-foreground">Pricing</h3>
          <p className="text-sm text-muted-foreground">Set product prices and length-based modifiers</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <Label htmlFor="base_price_ngn">Base Price (NGN)</Label>
            <Input
              id="base_price_ngn"
              type="number"
              value={form.values.base_price_ngn}
              onChange={(e) => form.updateField('base_price_ngn', Number(e.target.value))}
              min={0}
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="compare_at_price_ngn">Compare at Price (NGN)</Label>
            <Input
              id="compare_at_price_ngn"
              type="number"
              value={form.values.compare_at_price_ngn ?? ''}
              onChange={(e) =>
                form.updateField(
                  'compare_at_price_ngn',
                  e.target.value ? Number(e.target.value) : null
                )
              }
              min={0}
              className="bg-background"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="cost_price_ngn">Cost Price (NGN)</Label>
            <Input
              id="cost_price_ngn"
              type="number"
              value={form.values.cost_price_ngn ?? ''}
              onChange={(e) =>
                form.updateField('cost_price_ngn', e.target.value ? Number(e.target.value) : null)
              }
              min={0}
              className="bg-background"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="available_lengths">Available Lengths (comma separated)</Label>
            <Input
              id="available_lengths"
              value={lengthString}
              onChange={(e) => form.setAvailableLengthsFromString(e.target.value)}
              placeholder="12, 14, 16"
              className="bg-background"
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label htmlFor="length_price_modifiers">Length Price Modifiers (JSON)</Label>
            <Textarea
              id="length_price_modifiers"
              value={modifierJson}
              onChange={(e) => form.setLengthModifiersFromJson(e.target.value)}
              placeholder='{ "14": 0, "16": 5000 }'
              rows={3}
              className="bg-background font-mono text-sm"
            />
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-foreground">Inventory</h3>
          <p className="text-sm text-muted-foreground">Stock levels and inventory tracking</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Label htmlFor="stock_quantity">Stock Quantity</Label>
            <Input
              id="stock_quantity"
              type="number"
              value={form.values.stock_quantity}
              onChange={(e) => form.updateField('stock_quantity', Number(e.target.value))}
              min={0}
              className="bg-background"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
            <Input
              id="low_stock_threshold"
              type="number"
              value={form.values.low_stock_threshold}
              onChange={(e) => form.updateField('low_stock_threshold', Number(e.target.value))}
              min={0}
              className="bg-background"
            />
          </div>

          <div className="flex items-end">
            <ToggleField
              label="Track Inventory"
              checked={form.values.track_inventory}
              onCheckedChange={(checked) => form.updateField('track_inventory', Boolean(checked))}
            />
          </div>

          <div className="flex items-end">
            <ToggleField
              label="Allow Backorder"
              checked={form.values.allow_backorder}
              onCheckedChange={(checked) => form.updateField('allow_backorder', Boolean(checked))}
            />
          </div>
        </div>
      </section>

      {/* Media */}
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-foreground">Media</h3>
          <p className="text-sm text-muted-foreground">Product images and videos</p>
        </div>
        <div className="space-y-6">
          <ImageUpload
            images={form.values.images}
            onChange={(images) => {
              form.updateField('images', images)
              // Auto-set thumbnail to first image if not set
              if (images.length > 0 && !form.values.thumbnail_url) {
                form.updateField('thumbnail_url', images[0])
              }
            }}
            maxImages={10}
            label="Product Images"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                value={form.values.thumbnail_url ?? ''}
                onChange={(e) => form.updateField('thumbnail_url', e.target.value || null)}
                placeholder="https://..."
                className="bg-background"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="video_url">Video URL</Label>
              <Input
                id="video_url"
                value={form.values.video_url ?? ''}
                onChange={(e) => form.updateField('video_url', e.target.value || null)}
                placeholder="https://..."
                className="bg-background"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Status */}
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold text-foreground">Product Status</h3>
          <p className="text-sm text-muted-foreground">Visibility and special badges</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-lg border border-border p-4">
            <ToggleField
              label="Active"
              checked={form.values.is_active}
              onCheckedChange={(checked) => form.updateField('is_active', Boolean(checked))}
            />
            <p className="mt-1 text-xs text-muted-foreground">Product is visible on the store</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <ToggleField
              label="Featured"
              checked={form.values.is_featured}
              onCheckedChange={(checked) => form.updateField('is_featured', Boolean(checked))}
            />
            <p className="mt-1 text-xs text-muted-foreground">Show on homepage</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <ToggleField
              label="New Arrival"
              checked={form.values.is_new_arrival}
              onCheckedChange={(checked) => form.updateField('is_new_arrival', Boolean(checked))}
            />
            <p className="mt-1 text-xs text-muted-foreground">Display new badge</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <ToggleField
              label="Preorder Only"
              checked={form.values.is_preorder_only}
              onCheckedChange={(checked) => form.updateField('is_preorder_only', Boolean(checked))}
            />
            <p className="mt-1 text-xs text-muted-foreground">Accept preorders only</p>
          </div>
        </div>
      </section>

      {/* Variants */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Variants</h3>
            <p className="text-sm text-muted-foreground">Different lengths and SKUs</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={form.addVariant}>
            Add Variant
          </Button>
        </div>
        <div className="space-y-4">
          {form.values.variants.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No variants yet. Add variants for different lengths.</p>
            </div>
          )}
          {form.values.variants.map((variant, index) => (
            <div key={index} className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <Label className="text-xs">Length (inches)</Label>
                  <Input
                    type="number"
                    value={variant.length}
                    onChange={(e) => form.updateVariant(index, { length: Number(e.target.value) })}
                    min={0}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">SKU</Label>
                  <Input
                    value={variant.sku}
                    onChange={(e) => form.updateVariant(index, { sku: e.target.value })}
                    placeholder="SKU"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Price Override (NGN)</Label>
                  <Input
                    type="number"
                    value={variant.price_override_ngn ?? ''}
                    onChange={(e) =>
                      form.updateVariant(index, {
                        price_override_ngn: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    min={0}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Stock Qty</Label>
                  <Input
                    type="number"
                    value={variant.stock_quantity}
                    onChange={(e) => form.updateVariant(index, { stock_quantity: Number(e.target.value) })}
                    min={0}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Weight (g)</Label>
                  <Input
                    type="number"
                    value={variant.weight_grams ?? ''}
                    onChange={(e) =>
                      form.updateVariant(index, {
                        weight_grams: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    min={0}
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => form.removeVariant(index)}
                >
                  Remove Variant
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form Actions */}
      {form.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm text-red-800 dark:text-red-200">{form.error}</p>
        </div>
      )}
      {form.successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <p className="text-sm text-green-800 dark:text-green-200">{form.successMessage}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={isPending} className="min-w-[140px]">
          {isPending ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}

type ToggleFieldProps = {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function ToggleField({ label, checked, onCheckedChange }: ToggleFieldProps) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(Boolean(v))} />
      <span>{label}</span>
    </label>
  )
}
