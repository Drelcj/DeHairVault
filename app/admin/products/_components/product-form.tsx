"use client"

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/components/ui/tag-input'
import { CreatableSelect } from '@/components/ui/creatable-select'
import { hairCategoryOptions, hairGradeOptions, hairOriginOptions, drawTypeOptions } from '@/lib/constants/enums'
import { getHairTextures, createHairTexture, type HairTextureOption } from '@/lib/actions/textures'
import { useProductForm } from '@/hooks/useProductForm'
import { generateProductSlug } from '@/lib/utils/product'
import type { ActionResult, ProductFormValues } from '@/types/admin'
import { DrawType, HairGrade } from '@/types/database.types'
import { ImageUpload } from './image-upload'

type Props = {
  initialData?: Partial<ProductFormValues>
  onSubmit: (values: ProductFormValues) => Promise<ActionResult>
  mode?: 'create' | 'edit'
}

export function ProductForm({ initialData, onSubmit, mode = 'create' }: Props) {
  const form = useProductForm(initialData)
  const [isPending, startTransition] = useTransition()
  // Track if user has manually edited the slug
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug)
  
  // Texture options from database
  const [textureOptions, setTextureOptions] = useState<HairTextureOption[]>([])
  const [texturesLoading, setTexturesLoading] = useState(true)

  // Load textures on mount
  useEffect(() => {
    async function loadTextures() {
      setTexturesLoading(true)
      try {
        const textures = await getHairTextures()
        setTextureOptions(textures)
      } catch (error) {
        console.error('Failed to load textures:', error)
      } finally {
        setTexturesLoading(false)
      }
    }
    loadTextures()
  }, [])

  // Handle creating a new texture
  const handleCreateTexture = async (label: string) => {
    const result = await createHairTexture(label)
    if (result.success && result.value) {
      // Refresh textures and select the new one
      const textures = await getHairTextures()
      setTextureOptions(textures)
      form.updateField('texture', result.value)
    } else {
      form.setError(result.error || 'Failed to create texture')
    }
  }

  const lengthString = useMemo(() => form.values.available_lengths.join(', '), [form.values.available_lengths])

  // Handle name change - auto-generate slug if not manually edited
  const handleNameChange = (name: string) => {
    form.updateField('name', name)
    if (!slugManuallyEdited && mode === 'create') {
      form.updateField('slug', generateProductSlug(name))
    }
  }

  // Handle slug change - mark as manually edited
  const handleSlugChange = (slug: string) => {
    form.updateField('slug', slug)
    if (slug !== generateProductSlug(form.values.name)) {
      setSlugManuallyEdited(true)
    }
  }

  // Generate slug from current name
  const handleGenerateSlug = () => {
    const generatedSlug = generateProductSlug(form.values.name)
    form.updateField('slug', generatedSlug)
    setSlugManuallyEdited(false)
  }
  const modifierJson = useMemo(
    () => (form.values.length_price_modifiers ? JSON.stringify(form.values.length_price_modifiers, null, 2) : ''),
    [form.values.length_price_modifiers]
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    form.resetMessages()

    // Validate required fields
    if (!form.values.name.trim()) {
      form.setError('Product name is required')
      return
    }
    
    // Auto-generate slug if empty
    let finalSlug = form.values.slug.trim()
    if (!finalSlug) {
      finalSlug = generateProductSlug(form.values.name)
      form.updateField('slug', finalSlug)
    }
    if (form.values.base_price_gbp <= 0) {
      form.setError('Price must be greater than 0')
      return
    }

    // Create the submission values with the guaranteed slug
    const submissionValues = {
      ...form.values,
      slug: finalSlug,
    }

    startTransition(async () => {
      const result = await onSubmit(submissionValues)
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
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Brazilian Body Wave Bundle"
              // maxLength={255}
              required
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">Max 255 characters</p>
          </div>
          <div className="space-y-3">
            <Label htmlFor="slug">Slug (URL)</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={form.values.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-generated from name"
                className="bg-background flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateSlug}
                className="shrink-0"
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">URL-friendly identifier for SEO. Auto-generated from name.</p>
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={form.values.description ?? ''}
              onChange={(e) => form.updateField('description', e.target.value)}
              placeholder="Detailed product description for customers..."
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
              placeholder="Brief summary for product cards"
              className="bg-background"
            />
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label htmlFor="features">Key Features</Label>
            <TagInput
              value={form.values.features ?? []}
              onChange={(features) => form.updateField('features', features)}
              placeholder="Type a feature and press Enter to add..."
            />
            <p className="text-xs text-muted-foreground">
              Press Enter after each feature to add it. These will be displayed as bullet points on the product page.
            </p>
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
              value={form.values.grade ?? 'NA'}
              onValueChange={(value) => form.updateField('grade', value === 'NA' ? null : value as HairGrade)}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {hairGradeOptions.map((option) => (
                  <SelectItem key={option.value ?? 'NA'} value={option.value ?? 'NA'}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Texture</Label>
            <CreatableSelect
              options={textureOptions}
              value={form.values.texture}
              onChange={(value) => form.updateField('texture', value)}
              onCreateOption={handleCreateTexture}
              placeholder={texturesLoading ? "Loading..." : "Select texture..."}
              searchPlaceholder="Search or type to create..."
              emptyMessage="No texture found."
              disabled={texturesLoading}
            />
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
            <Label htmlFor="base_price_gbp">Base Price (GBP)</Label>
            <Input
              id="base_price_gbp"
              type="number"
              value={form.values.base_price_gbp}
              onChange={(e) => form.updateField('base_price_gbp', Number(e.target.value))}
              min={0}
              step="0.01"
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="compare_at_price_gbp">Compare at Price (GBP)</Label>
            <Input
              id="compare_at_price_gbp"
              type="number"
              value={form.values.compare_at_price_gbp ?? ''}
              onChange={(e) =>
                form.updateField(
                  'compare_at_price_gbp',
                  e.target.value ? Number(e.target.value) : null
                )
              }
              min={0}
              step="0.01"
              className="bg-background"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="cost_price_gbp">Cost Price (GBP)</Label>
            <Input
              id="cost_price_gbp"
              type="number"
              value={form.values.cost_price_gbp ?? ''}
              onChange={(e) =>
                form.updateField('cost_price_gbp', e.target.value ? Number(e.target.value) : null)
              }
              min={0}
              step="0.01"
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
                  <Label className="text-xs">Price Override (GBP)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={variant.price_override_gbp ?? ''}
                    onChange={(e) =>
                      form.updateVariant(index, {
                        price_override_gbp: e.target.value ? Number(e.target.value) : null,
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
