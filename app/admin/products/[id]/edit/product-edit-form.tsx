"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import type { Product, ProductVariant } from "@/types/database.types"

type EditableProduct = Pick<
  Product,
  | "id"
  | "name"
  | "description"
  | "base_price_gbp"
  | "available_lengths"
  | "is_active"
  | "track_inventory"
  | "allow_backorder"
  | "stock_quantity"
  | "low_stock_threshold"
>

type EditableVariant = Pick<ProductVariant, "id" | "product_id" | "length" | "sku" | "price_override_gbp" | "stock_quantity">

interface ProductEditFormProps {
  product: EditableProduct
  variants: EditableVariant[]
}

export default function ProductEditForm({ product, variants }: ProductEditFormProps) {
  const canPersist = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const supabase = useMemo(() => (canPersist ? createClient() : null), [canPersist])

  const [formState, setFormState] = useState({
    name: product.name,
    description: product.description ?? "",
    basePrice: Number(product.base_price_gbp ?? 0).toString(),
    availableLengths: (product.available_lengths ?? []).join(", "),
    isActive: product.is_active,
    trackInventory: product.track_inventory,
    allowBackorder: product.allow_backorder,
    stockQuantity: product.stock_quantity ?? 0,
    lowStockThreshold: product.low_stock_threshold ?? 0,
  })

  const [variantState, setVariantState] = useState(
    (variants ?? []).map((variant) => ({
      id: variant.id,
      product_id: variant.product_id,
      length: variant.length,
      sku: variant.sku,
      priceOverride: variant.price_override_gbp ? Number(variant.price_override_gbp).toString() : "",
      stockQuantity: variant.stock_quantity ?? 0,
    }))
  )

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)

  const parseLengths = () =>
    formState.availableLengths
      .split(",")
      .map((length) => parseInt(length.trim(), 10))
      .filter((length) => !Number.isNaN(length))

  const handleVariantChange = (index: number, key: "length" | "sku" | "priceOverride" | "stockQuantity", value: string | number) => {
    setVariantState((prev) =>
      prev.map((variant, idx) => (idx === index ? { ...variant, [key]: value } : variant))
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)

    if (!supabase) {
      setStatus("error")
      setMessage("Supabase environment variables are missing. Updates are disabled.")
      return
    }

    setStatus("saving")
    const availableLengths = parseLengths()

    const productUpdateData = {
      name: formState.name.trim(),
      description: formState.description.trim() || null,
      base_price_gbp: Number(formState.basePrice) || 0,
      available_lengths: availableLengths,
      is_active: formState.isActive,
      track_inventory: formState.trackInventory,
      allow_backorder: formState.allowBackorder,
      stock_quantity: formState.trackInventory ? Number(formState.stockQuantity) || 0 : product.stock_quantity,
      low_stock_threshold: formState.trackInventory ? Number(formState.lowStockThreshold) || 0 : product.low_stock_threshold,
    }

    const { error: productError } = await supabase
      .from("products")
      // @ts-ignore - Supabase client types don't match runtime schema
      .update(productUpdateData)
      .eq("id", product.id)

    if (productError) {
      setStatus("error")
      setMessage(productError.message)
      return
    }

    if (variantState.length > 0) {
      const variantsData = variantState.map((variant) => ({
        id: variant.id,
        product_id: product.id,
        length: Number(variant.length),
        sku: variant.sku,
        price_override_gbp: variant.priceOverride === "" ? null : Number(variant.priceOverride),
        stock_quantity: formState.trackInventory ? Number(variant.stockQuantity) || 0 : variant.stockQuantity,
      }))

      const { error: variantError } = await supabase
        .from("product_variants")
        // @ts-ignore - Supabase client types don't match runtime schema
        .upsert(variantsData)

      if (variantError) {
        setStatus("error")
        setMessage(variantError.message)
        return
      }
    }

    setStatus("saved")
    setMessage("Product updated successfully.")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="grid gap-6 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-2">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Raw Vietnamese Straight Bundles"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formState.description}
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Describe the product, hair quality, sourcing, and care tips."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="basePrice">Base price (GBP)</Label>
            <Input
              id="basePrice"
              type="number"
              min="0"
              step="0.01"
              value={formState.basePrice}
              onChange={(event) => setFormState((prev) => ({ ...prev, basePrice: event.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="availableLengths">Available lengths (comma separated)</Label>
            <Input
              id="availableLengths"
              value={formState.availableLengths}
              onChange={(event) => setFormState((prev) => ({ ...prev, availableLengths: event.target.value }))}
              placeholder="12, 14, 16, 18"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Checkbox
              id="isActive"
              checked={formState.isActive}
              onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isActive: checked === true }))}
            />
            <Label htmlFor="isActive">Visible in store</Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="trackInventory"
              checked={formState.trackInventory}
              onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, trackInventory: checked === true }))}
            />
            <Label htmlFor="trackInventory">Track inventory</Label>
          </div>
        </div>

        {formState.trackInventory && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="stockQuantity">Stock quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={formState.stockQuantity}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, stockQuantity: Number(event.target.value) || 0 }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={formState.lowStockThreshold}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, lowStockThreshold: Number(event.target.value) || 0 }))
                }
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Checkbox
            id="allowBackorder"
            checked={formState.allowBackorder}
            onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, allowBackorder: checked === true }))}
          />
          <Label htmlFor="allowBackorder">Allow backorders when out of stock</Label>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Variants</p>
            <p className="text-sm text-muted-foreground">Override pricing and inventory per length.</p>
          </div>
        </div>

        {variantState.length === 0 ? (
          <p className="text-sm text-muted-foreground">No variants were found for this product.</p>
        ) : (
          <div className="grid gap-4">
            {variantState.map((variant, index) => (
              <div key={variant.id ?? index} className="grid gap-4 rounded-md border border-border p-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor={`variant-length-${index}`}>Length (inches)</Label>
                  <Input
                    id={`variant-length-${index}`}
                    type="number"
                    min="0"
                    value={variant.length}
                    onChange={(event) => handleVariantChange(index, "length", Number(event.target.value))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`variant-sku-${index}`}>SKU</Label>
                  <Input
                    id={`variant-sku-${index}`}
                    value={variant.sku}
                    onChange={(event) => handleVariantChange(index, "sku", event.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`variant-price-${index}`}>Price override (GBP)</Label>
                  <Input
                    id={`variant-price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.priceOverride}
                    onChange={(event) => handleVariantChange(index, "priceOverride", event.target.value)}
                    placeholder="Leave blank to use base price"
                  />
                </div>

                {formState.trackInventory && (
                  <div className="grid gap-2">
                    <Label htmlFor={`variant-stock-${index}`}>Stock quantity</Label>
                    <Input
                      id={`variant-stock-${index}`}
                      type="number"
                      min="0"
                      value={variant.stockQuantity}
                      onChange={(event) => handleVariantChange(index, "stockQuantity", Number(event.target.value))}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save changes"}
        </Button>
        {message && (
          <p className={`text-sm ${status === "error" ? "text-red-500" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>

      {!canPersist && (
        <p className="text-sm text-muted-foreground">
          Supabase credentials are not configured in this environment. The form will render but changes will not be saved.
        </p>
      )}
    </form>
  )
}
