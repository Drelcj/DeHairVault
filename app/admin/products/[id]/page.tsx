// Product Editing Page
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProductForm, type ProductFormData, type VariantFormData } from '@/hooks/useProductForm';
import {
  HAIR_GRADES,
  HAIR_TEXTURES,
  HAIR_ORIGINS,
  HAIR_CATEGORIES,
  DRAW_TYPES,
  AVAILABLE_LENGTHS,
} from '@/lib/constants/enums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HairGrade, HairTexture, HairOrigin, HairCategory, DrawType, type Product, type ProductVariant } from '@/types/database.types';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { handleSubmit, generateSlug, loading, error } = useProductForm(product || undefined);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: null,
    short_description: null,
    grade: HairGrade.GRADE_D,
    origin: HairOrigin.VIETNAM,
    texture: HairTexture.STRAIGHT,
    category: HairCategory.BUNDLES,
    draw_type: null,
    available_lengths: [],
    base_price_ngn: 0,
    compare_at_price_ngn: null,
    cost_price_ngn: null,
    stock_quantity: 0,
    low_stock_threshold: 5,
    track_inventory: true,
    allow_backorder: false,
    images: [],
    thumbnail_url: null,
    is_active: true,
    is_featured: false,
    is_new_arrival: false,
    is_bestseller: false,
    is_preorder_only: false,
  });

  // Fetch product and variants
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        
        setProduct(data.product);
        
        // Set form data from product
        setFormData({
          name: data.product.name,
          slug: data.product.slug,
          description: data.product.description,
          short_description: data.product.short_description,
          grade: data.product.grade,
          origin: data.product.origin,
          texture: data.product.texture,
          category: data.product.category,
          draw_type: data.product.draw_type,
          available_lengths: data.product.available_lengths,
          base_price_ngn: data.product.base_price_ngn,
          compare_at_price_ngn: data.product.compare_at_price_ngn,
          cost_price_ngn: data.product.cost_price_ngn,
          stock_quantity: data.product.stock_quantity,
          low_stock_threshold: data.product.low_stock_threshold,
          track_inventory: data.product.track_inventory,
          allow_backorder: data.product.allow_backorder,
          images: data.product.images,
          thumbnail_url: data.product.thumbnail_url,
          is_active: data.product.is_active,
          is_featured: data.product.is_featured,
          is_new_arrival: data.product.is_new_arrival,
          is_bestseller: data.product.is_bestseller,
          is_preorder_only: data.product.is_preorder_only,
        });

        // Set variants
        if (data.variants && data.variants.length > 0) {
          setVariants(
            data.variants.map((v: ProductVariant) => ({
              length: v.length,
              sku: v.sku,
              price_override_ngn: v.price_override_ngn,
              stock_quantity: v.stock_quantity,
              weight_grams: v.weight_grams,
            }))
          );
        }
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleLengthToggle = (length: number) => {
    const newLengths = formData.available_lengths.includes(length)
      ? formData.available_lengths.filter((l) => l !== length)
      : [...formData.available_lengths, length].sort((a, b) => a - b);
    
    setFormData({ ...formData, available_lengths: newLengths });

    // Update variants when lengths change
    const newVariants = newLengths.map((len) => {
      const existing = variants.find((v) => v.length === len);
      return (
        existing || {
          length: len,
          sku: `${formData.slug}-${len}`,
          price_override_ngn: null,
          stock_quantity: formData.stock_quantity,
          weight_grams: null,
        }
      );
    });
    setVariants(newVariants);
  };

  const updateVariant = (length: number, field: keyof VariantFormData, value: any) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.length === length ? { ...v, [field]: value } : v
      )
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSubmit(formData, variants);
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{fetchError}</p>
        </div>
        <Button onClick={() => router.push('/admin/products')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-2">Update product information and variants</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                value={formData.short_description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, short_description: e.target.value || null })
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value || null })
                }
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Hair Attributes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hair Attributes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">Grade *</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData({ ...formData, grade: value as HairGrade })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HAIR_GRADES.map((grade) => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="texture">Texture *</Label>
              <Select
                value={formData.texture}
                onValueChange={(value) => setFormData({ ...formData, texture: value as HairTexture })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HAIR_TEXTURES.map((texture) => (
                    <SelectItem key={texture.value} value={texture.value}>
                      {texture.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="origin">Origin *</Label>
              <Select
                value={formData.origin}
                onValueChange={(value) => setFormData({ ...formData, origin: value as HairOrigin })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HAIR_ORIGINS.map((origin) => (
                    <SelectItem key={origin.value} value={origin.value}>
                      {origin.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as HairCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HAIR_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="draw_type">Draw Type</Label>
              <Select
                value={formData.draw_type || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, draw_type: value === 'none' ? null : (value as DrawType) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {DRAW_TYPES.map((drawType) => (
                    <SelectItem key={drawType.value} value={drawType.value}>
                      {drawType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Available Lengths */}
          <div className="mt-4">
            <Label>Available Lengths (inches) *</Label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-2">
              {AVAILABLE_LENGTHS.map((length) => (
                <div key={length} className="flex items-center space-x-2">
                  <Checkbox
                    id={`length-${length}`}
                    checked={formData.available_lengths.includes(length)}
                    onCheckedChange={() => handleLengthToggle(length)}
                  />
                  <label
                    htmlFor={`length-${length}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {length}"
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Variants */}
        {variants.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Variants</h2>
            
            <div className="space-y-4">
              {variants.map((variant) => (
                <div key={variant.length} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">{variant.length}" Variant</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`sku-${variant.length}`}>SKU</Label>
                      <Input
                        id={`sku-${variant.length}`}
                        value={variant.sku}
                        onChange={(e) => updateVariant(variant.length, 'sku', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`price-${variant.length}`}>Price Override (NGN)</Label>
                      <Input
                        id={`price-${variant.length}`}
                        type="number"
                        value={variant.price_override_ngn || ''}
                        onChange={(e) =>
                          updateVariant(
                            variant.length,
                            'price_override_ngn',
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`stock-${variant.length}`}>Stock</Label>
                      <Input
                        id={`stock-${variant.length}`}
                        type="number"
                        value={variant.stock_quantity}
                        onChange={(e) =>
                          updateVariant(variant.length, 'stock_quantity', parseInt(e.target.value) || 0)
                        }
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`weight-${variant.length}`}>Weight (grams)</Label>
                      <Input
                        id={`weight-${variant.length}`}
                        type="number"
                        value={variant.weight_grams || ''}
                        onChange={(e) =>
                          updateVariant(
                            variant.length,
                            'weight_grams',
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="base_price_ngn">Base Price (NGN) *</Label>
              <Input
                id="base_price_ngn"
                type="number"
                value={formData.base_price_ngn}
                onChange={(e) =>
                  setFormData({ ...formData, base_price_ngn: parseFloat(e.target.value) || 0 })
                }
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="compare_at_price_ngn">Compare at Price (NGN)</Label>
              <Input
                id="compare_at_price_ngn"
                type="number"
                value={formData.compare_at_price_ngn || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    compare_at_price_ngn: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="cost_price_ngn">Cost Price (NGN)</Label>
              <Input
                id="cost_price_ngn"
                type="number"
                value={formData.cost_price_ngn || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cost_price_ngn: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })
                }
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
              <Input
                id="low_stock_threshold"
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) =>
                  setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="track_inventory"
                checked={formData.track_inventory}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, track_inventory: checked as boolean })
                }
              />
              <label htmlFor="track_inventory" className="text-sm font-medium cursor-pointer">
                Track inventory
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow_backorder"
                checked={formData.allow_backorder}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allow_backorder: checked as boolean })
                }
              />
              <label htmlFor="allow_backorder" className="text-sm font-medium cursor-pointer">
                Allow backorder
              </label>
            </div>
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Status</h2>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked as boolean })
                }
              />
              <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                Active (visible in store)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_featured: checked as boolean })
                }
              />
              <label htmlFor="is_featured" className="text-sm font-medium cursor-pointer">
                Featured product
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_new_arrival"
                checked={formData.is_new_arrival}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_new_arrival: checked as boolean })
                }
              />
              <label htmlFor="is_new_arrival" className="text-sm font-medium cursor-pointer">
                New arrival
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_bestseller"
                checked={formData.is_bestseller}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_bestseller: checked as boolean })
                }
              />
              <label htmlFor="is_bestseller" className="text-sm font-medium cursor-pointer">
                Bestseller
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_preorder_only"
                checked={formData.is_preorder_only}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_preorder_only: checked as boolean })
                }
              />
              <label htmlFor="is_preorder_only" className="text-sm font-medium cursor-pointer">
                Pre-order only
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
