'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PaymentMethod } from './payment-method'
import { OrderSummary } from './order-summary'
import type { CartWithItems } from '@/lib/actions/cart'
import { createOrder, applyCoupon, type CheckoutFormData } from '@/lib/actions/checkout'

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  shippingAddressLine1: z.string().min(5, 'Address is required'),
  shippingAddressLine2: z.string().optional(),
  shippingCity: z.string().min(2, 'City is required'),
  shippingState: z.string().min(2, 'State/Province is required'),
  shippingCountry: z.string().min(2, 'Country is required'),
  shippingPostalCode: z.string().optional(),
  billingSameAsShipping: z.boolean(),
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingCountry: z.string().optional(),
  billingPostalCode: z.string().optional(),
  customerNotes: z.string().optional(),
  paymentMethod: z.enum(['stripe', 'paystack']),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  cart: CartWithItems
}

export function CheckoutForm({ cart }: CheckoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  
  // For now, use NGN as default. In production, fetch from exchange_rates table
  const [displayCurrency] = useState('NGN')
  const [exchangeRate] = useState(1)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      billingSameAsShipping: true,
      paymentMethod: 'stripe',
      shippingCountry: 'Nigeria',
    },
  })

  const billingSameAsShipping = watch('billingSameAsShipping')
  const paymentMethod = watch('paymentMethod')
  const shippingCountry = watch('shippingCountry')

  // Calculate shipping cost based on country
  // TODO: Replace with getShippingOptions() from shipping service when DHL is integrated
  // This will allow users to select from multiple shipping options with real DHL rates
  // const shippingCost = shippingCountry === 'Nigeria' ? 5000 : 15000
  const shippingCost = 0 // Temporarily disabled for payment testing
  const tax = 0

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setIsApplyingCoupon(true)
    setCouponError(null)

    const result = await applyCoupon(couponCode.trim(), cart.subtotalNgn)

    if (result.success && result.discountNgn) {
      setAppliedCoupon(couponCode.toUpperCase())
      setDiscount(result.discountNgn)
      setCouponCode('')
      setCouponError(null)
    } else {
      setCouponError(result.error || 'Invalid coupon code')
    }

    setIsApplyingCoupon(false)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode('')
    setCouponError(null)
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare checkout form data
      const formData: CheckoutFormData = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddressLine1: data.shippingAddressLine1,
        shippingAddressLine2: data.shippingAddressLine2,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingCountry: data.shippingCountry,
        shippingPostalCode: data.shippingPostalCode,
        billingSameAsShipping: data.billingSameAsShipping,
        billingAddressLine1: data.billingSameAsShipping
          ? data.shippingAddressLine1
          : data.billingAddressLine1,
        billingAddressLine2: data.billingSameAsShipping
          ? data.shippingAddressLine2
          : data.billingAddressLine2,
        billingCity: data.billingSameAsShipping ? data.shippingCity : data.billingCity,
        billingState: data.billingSameAsShipping ? data.shippingState : data.billingState,
        billingCountry: data.billingSameAsShipping
          ? data.shippingCountry
          : data.billingCountry,
        billingPostalCode: data.billingSameAsShipping
          ? data.shippingPostalCode
          : data.billingPostalCode,
        customerNotes: data.customerNotes,
        paymentMethod: data.paymentMethod,
        displayCurrency,
        exchangeRate,
        couponCode: appliedCoupon || undefined,
        discountNgn: discount,
      }

      // Create order
      const orderResult = await createOrder(formData)

      if (!orderResult.success || !orderResult.orderId) {
        setError(orderResult.error || 'Failed to create order')
        setIsSubmitting(false)
        return
      }

      // Redirect to payment
      if (data.paymentMethod === 'stripe') {
        // Redirect to Stripe checkout
        const response = await fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderResult.orderId,
            orderNumber: orderResult.orderNumber,
          }),
        })

        const result = await response.json()

        if (result.url) {
          window.location.href = result.url
        } else {
          setError(result.error || 'Failed to initialize payment')
          setIsSubmitting(false)
        }
      } else {
        // Redirect to Paystack
        const response = await fetch('/api/checkout/paystack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderResult.orderId,
            orderNumber: orderResult.orderNumber,
          }),
        })

        const result = await response.json()

        if (result.authorization_url) {
          window.location.href = result.authorization_url
        } else {
          setError(result.error || 'Failed to initialize payment')
          setIsSubmitting(false)
        }
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Information */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-medium mb-6 text-foreground">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  {...register('customerName')}
                  placeholder="John Doe"
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    {...register('customerEmail')}
                    placeholder="john@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerEmail.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    {...register('customerPhone')}
                    placeholder="+234 800 000 0000"
                  />
                  {errors.customerPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerPhone.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-medium mb-6 text-foreground">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shippingAddressLine1">Address Line 1 *</Label>
                <Input
                  id="shippingAddressLine1"
                  {...register('shippingAddressLine1')}
                  placeholder="Street address"
                />
                {errors.shippingAddressLine1 && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.shippingAddressLine1.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="shippingAddressLine2">Address Line 2</Label>
                <Input
                  id="shippingAddressLine2"
                  {...register('shippingAddressLine2')}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="shippingCity">City *</Label>
                  <Input
                    id="shippingCity"
                    {...register('shippingCity')}
                    placeholder="Lagos"
                  />
                  {errors.shippingCity && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingCity.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shippingState">State/Province *</Label>
                  <Input
                    id="shippingState"
                    {...register('shippingState')}
                    placeholder="Lagos State"
                  />
                  {errors.shippingState && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingState.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="shippingCountry">Country *</Label>
                  <Input
                    id="shippingCountry"
                    {...register('shippingCountry')}
                    placeholder="Nigeria"
                  />
                  {errors.shippingCountry && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.shippingCountry.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shippingPostalCode">Postal Code</Label>
                  <Input
                    id="shippingPostalCode"
                    {...register('shippingPostalCode')}
                    placeholder="100001 (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="mb-4 flex items-center space-x-2">
              <Checkbox
                id="billingSameAsShipping"
                checked={billingSameAsShipping}
                onCheckedChange={(checked) =>
                  setValue('billingSameAsShipping', checked as boolean)
                }
              />
              <Label htmlFor="billingSameAsShipping" className="cursor-pointer">
                Billing address same as shipping address
              </Label>
            </div>

            {!billingSameAsShipping && (
              <div className="space-y-4">
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-medium text-foreground">Billing Address</h2>
                <div>
                  <Label htmlFor="billingAddressLine1">Address Line 1 *</Label>
                  <Input
                    id="billingAddressLine1"
                    {...register('billingAddressLine1')}
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <Label htmlFor="billingAddressLine2">Address Line 2</Label>
                  <Input
                    id="billingAddressLine2"
                    {...register('billingAddressLine2')}
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="billingCity">City *</Label>
                    <Input id="billingCity" {...register('billingCity')} />
                  </div>

                  <div>
                    <Label htmlFor="billingState">State/Province *</Label>
                    <Input id="billingState" {...register('billingState')} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="billingCountry">Country *</Label>
                    <Input id="billingCountry" {...register('billingCountry')} />
                  </div>

                  <div>
                    <Label htmlFor="billingPostalCode">Postal Code</Label>
                    <Input id="billingPostalCode" {...register('billingPostalCode')} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Notes */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-medium mb-4 text-foreground">Additional Information</h2>
            <div>
              <Label htmlFor="customerNotes">Order Notes (Optional)</Label>
              <Textarea
                id="customerNotes"
                {...register('customerNotes')}
                placeholder="Any special instructions for your order?"
                rows={4}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <PaymentMethod
              value={paymentMethod}
              onChange={(method) => setValue('paymentMethod', method)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-red-800 dark:text-red-200">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            <OrderSummary
              cart={cart}
              shippingCost={shippingCost}
              tax={tax}
              discount={discount}
              displayCurrency={displayCurrency}
              exchangeRate={exchangeRate}
              couponCode={appliedCoupon || undefined}
              onRemoveCoupon={handleRemoveCoupon}
            />

            {/* Coupon Code */}
            {!appliedCoupon && (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="font-medium mb-3 text-foreground">Have a coupon code?</h3>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    disabled={isApplyingCoupon}
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    variant="outline"
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
                {couponError && (
                  <p className="mt-2 text-sm text-red-600">{couponError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
