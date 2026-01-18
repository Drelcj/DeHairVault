'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PaymentVerifier } from '@/components/checkout/payment-verifier'
import { 
  CheckCircle2, 
  Package, 
  Mail, 
  Truck, 
  Clock, 
  ArrowRight, 
  ShoppingBag,
  Phone,
  MapPin,
  Sparkles,
  Loader2
} from 'lucide-react'

interface OrderItem {
  id: string
  product_name: string
  product_grade?: string
  product_texture?: string
  product_origin?: string
  selected_length?: number
  quantity: number
  unit_price_ngn: number
  total_price_ngn: number
  product_snapshot?: {
    name?: string
    description?: string
    images?: string[]
    grade?: string
    texture?: string
    origin?: string
  }
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_state: string
  shipping_country: string
  shipping_postal_code?: string
  subtotal_ngn: number
  shipping_cost_ngn: number
  tax_ngn: number
  discount_ngn: number
  total_ngn: number
  display_currency: string
  exchange_rate: number
  total_display_currency: number
  payment_status: string
  payment_method?: string
  created_at: string
  user_id?: string
  order_items?: OrderItem[]
}

interface SuccessPageContentProps {
  order: Order
  orderNumber: string
}

// Currency formatters
function formatCurrency(amount: number | null | undefined, currency: string): string {
  if (amount == null || isNaN(amount)) return '—'
  
  const formatters: Record<string, () => string> = {
    NGN: () => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount),
    GBP: () => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount),
    USD: () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount),
  }
  
  return formatters[currency]?.() ?? formatters.NGN()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SuccessPageContent({ order, orderNumber }: SuccessPageContentProps) {
  const currency = order?.display_currency || 'NGN'
  
  // Calculate display amounts based on saved currency
  const displayTotal = currency === 'NGN' 
    ? order?.total_ngn 
    : order?.total_display_currency
  
  const displaySubtotal = currency === 'NGN'
    ? order?.subtotal_ngn
    : (order?.subtotal_ngn ?? 0) / (order?.exchange_rate || 1)
    
  const displayShipping = currency === 'NGN'
    ? order?.shipping_cost_ngn
    : (order?.shipping_cost_ngn ?? 0) / (order?.exchange_rate || 1)
    
  const displayDiscount = currency === 'NGN'
    ? order?.discount_ngn
    : (order?.discount_ngn ?? 0) / (order?.exchange_rate || 1)

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        {/* Background gradients - theme aware */}
        <div className="absolute inset-0 bg-linear-to-b from-secondary/50 via-background to-background" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-(--gold)/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-(--rose-gold)/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Payment Verification (handles Paystack callback and cart clearing) */}
          <PaymentVerifier orderNumber={orderNumber} />
          
          <div className="max-w-3xl mx-auto text-center">
            {/* Success Icon with animation */}
            <div className="mb-8 flex justify-center">
              <div className="relative animate-in zoom-in-50 duration-500">
                <div className="absolute inset-0 bg-(--gold)/20 rounded-full blur-xl animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-(--gold) to-(--rose-gold)">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>

            <span className="inline-block text-sm font-medium tracking-[0.2em] uppercase text-accent mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              Order Confirmed
            </span>
            <h1 className="font-(family-name:--font-playfair) text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              Thank You,
              <span className="block italic text-accent">{order?.customer_name?.split(' ')[0] || 'Valued Customer'}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              Your order <span className="font-semibold text-foreground">{order?.order_number}</span> has been 
              successfully placed. We&apos;re preparing your premium hair extensions with the utmost care.
            </p>
          </div>
        </div>
      </section>

      {/* Order Details Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Order Summary Card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8 lg:p-10 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <h2 className="font-(family-name:--font-playfair) text-2xl font-medium text-foreground">Order Details</h2>
              </div>

              {/* Order Info Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
                  <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                  <p className="text-lg font-semibold text-foreground font-mono">{order?.order_number}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
                  <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                  <p className="text-base font-semibold text-foreground">{formatDate(order?.created_at)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatTime(order?.created_at)}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-lg font-semibold text-accent">{formatCurrency(displayTotal, currency)}</p>
                  {currency !== 'NGN' && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ≈ {formatCurrency(order?.total_ngn, 'NGN')}
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
                  <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      order?.payment_status === 'paid' ? 'bg-green-500' :
                      order?.payment_status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <p className="text-lg font-semibold text-foreground capitalize">{order?.payment_status}</p>
                  </div>
                </div>
              </div>

              {/* Order Items - With Origin/Texture/Grade Details */}
              <div className="border-t border-border pt-8 mb-8">
                <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-accent" />
                  Your Premium Hair Extensions
                </h3>
                <div className="space-y-4">
                  {order?.order_items?.map((item) => {
                    // Get origin/texture/grade from item or snapshot
                    const origin = item?.product_origin || item?.product_snapshot?.origin
                    const texture = item?.product_texture || item?.product_snapshot?.texture
                    const grade = item?.product_grade || item?.product_snapshot?.grade
                    const length = item?.selected_length
                    
                    // Calculate display price for this item
                    const itemDisplayPrice = currency === 'NGN'
                      ? item?.total_price_ngn
                      : (item?.total_price_ngn ?? 0) / (order?.exchange_rate || 1)
                    
                    return (
                      <div 
                        key={item?.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-secondary/30 dark:bg-secondary/20 rounded-xl gap-4"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-lg">{item?.product_name}</p>
                          
                          {/* Product Details Tags */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {origin && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                                <MapPin className="h-3 w-3" />
                                {origin}
                              </span>
                            )}
                            {texture && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                <Sparkles className="h-3 w-3" />
                                {texture}
                              </span>
                            )}
                            {grade && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-(--gold)/10 text-(--gold) text-xs font-medium rounded-full">
                                {grade}
                              </span>
                            )}
                            {length && (
                              <span className="inline-flex items-center px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                                {length}&quot; Length
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-2">
                            Quantity: {item?.quantity}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-accent text-lg">
                            {formatCurrency(itemDisplayPrice, currency)}
                          </p>
                          {currency !== 'NGN' && (
                            <p className="text-xs text-muted-foreground">
                              ≈ {formatCurrency(item?.total_price_ngn, 'NGN')}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Order Totals */}
                <div className="mt-6 pt-6 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatCurrency(displaySubtotal, currency)}</span>
                  </div>
                  {(order?.shipping_cost_ngn ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">{formatCurrency(displayShipping, currency)}</span>
                    </div>
                  )}
                  {(order?.discount_ngn ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-{formatCurrency(displayDiscount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-accent">{formatCurrency(displayTotal, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t border-border pt-8">
                <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-accent" />
                  Shipping Address
                </h3>
                <div className="bg-secondary/30 dark:bg-secondary/20 rounded-xl p-5">
                  <p className="font-medium text-foreground">{order?.customer_name}</p>
                  <p className="text-muted-foreground">{order?.shipping_address_line1}</p>
                  {order?.shipping_address_line2 && (
                    <p className="text-muted-foreground">{order.shipping_address_line2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {order?.shipping_city}, {order?.shipping_state}
                  </p>
                  <p className="text-muted-foreground">{order?.shipping_country}</p>
                  {order?.shipping_postal_code && (
                    <p className="text-muted-foreground">{order.shipping_postal_code}</p>
                  )}
                  {order?.customer_phone && (
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      {order.customer_phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* What Happens Next Card - Enhanced */}
            <div className="bg-linear-to-br from-accent/5 to-(--gold)/5 dark:from-accent/10 dark:to-(--gold)/10 rounded-2xl border border-accent/20 p-8 lg:p-10 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
              <h3 className="font-(family-name:--font-playfair) text-xl font-medium text-foreground mb-2 flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent" />
                What Happens Next?
              </h3>
              <p className="text-muted-foreground mb-6">
                Our team will personally prepare your order with the care it deserves.
              </p>
              
              {/* Timeline Steps */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold text-sm">1</div>
                    <div className="w-0.5 h-full bg-accent/30 mt-2" />
                  </div>
                  <div className="pb-6">
                    <p className="font-medium text-foreground">Confirmation Email</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      A detailed receipt has been sent to <span className="font-medium text-foreground">{order?.customer_email}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-semibold text-sm">2</div>
                    <div className="w-0.5 h-full bg-accent/30 mt-2" />
                  </div>
                  <div className="pb-6">
                    <p className="font-medium text-foreground">Personal Outreach</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our team will contact you within <span className="font-medium text-accent">24 hours</span> to confirm shipping details and answer any questions.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-semibold text-sm">3</div>
                    <div className="w-0.5 h-full bg-accent/30 mt-2" />
                  </div>
                  <div className="pb-6">
                    <p className="font-medium text-foreground">Quality Inspection & Packaging</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Each bundle is individually inspected and packaged in our signature luxury packaging.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-semibold text-sm">4</div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Shipping & Tracking</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You&apos;ll receive tracking information via email. Estimated delivery: 
                      <span className="font-medium text-foreground"> 3-5 days (local)</span> or 
                      <span className="font-medium text-foreground"> 7-14 days (international)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="text-center mb-10 p-6 rounded-xl bg-muted/50 dark:bg-muted/20">
              <p className="text-muted-foreground mb-2">Questions about your order?</p>
              <p className="text-foreground font-medium">
                Contact us at <a href="mailto:support@dehairvault.com" className="text-accent hover:underline">support@dehairvault.com</a>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
              <Button asChild variant="outline" size="lg" className="group">
                <Link href="/shop">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {order?.user_id && (
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/account/orders">
                    View My Orders
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// Loading state component for race condition handling
export function SuccessPageLoading() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden min-h-[60vh] flex items-center justify-center">
      <div className="absolute inset-0 bg-linear-to-b from-secondary/50 via-background to-background" />
      <div className="relative z-10 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Loading your order details...</p>
      </div>
    </section>
  )
}

// Order not found component
export function OrderNotFound({ orderNumber }: { orderNumber: string }) {
  const router = useRouter()
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(true)
  const maxRetries = 3
  
  useEffect(() => {
    // Race condition handling: retry fetching order a few times
    if (retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        router.refresh() // Trigger page refresh to re-fetch data
      }, 2000) // Wait 2 seconds between retries
      
      return () => clearTimeout(timer)
    } else {
      setIsRetrying(false)
    }
  }, [retryCount, router])
  
  if (isRetrying) {
    return (
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden min-h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-b from-secondary/50 via-background to-background" />
        <div className="relative z-10 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-2">
            Confirming your order...
          </p>
          <p className="text-sm text-muted-foreground">
            Attempt {retryCount + 1} of {maxRetries}
          </p>
        </div>
      </section>
    )
  }
  
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden min-h-[60vh] flex items-center justify-center">
      <div className="absolute inset-0 bg-linear-to-b from-secondary/50 via-background to-background" />
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
          <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="font-(family-name:--font-playfair) text-2xl font-medium text-foreground mb-4">
          Order Processing
        </h2>
        <p className="text-muted-foreground mb-6">
          We&apos;re still processing your order <span className="font-mono font-medium text-foreground">{orderNumber}</span>. 
          This usually takes just a moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.refresh()} variant="outline">
            <Loader2 className="h-4 w-4 mr-2" />
            Check Again
          </Button>
          <Button asChild>
            <Link href="/shop">Return to Shop</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          If your payment was successful, you&apos;ll receive a confirmation email shortly.
        </p>
      </div>
    </section>
  )
}
