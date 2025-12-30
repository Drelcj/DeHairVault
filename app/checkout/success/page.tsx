import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getOrderByNumber } from '@/lib/actions/checkout'
import { HeaderShell } from '@/components/header-shell'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { PaymentVerifier } from '@/components/checkout/payment-verifier'
import { CheckCircle2, Package, Mail, Truck, Clock, ArrowRight, ShoppingBag } from 'lucide-react'

export const metadata = {
  title: 'Order Confirmed | Dehair Vault',
  description: 'Your order has been successfully placed.',
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_number?: string; reference?: string; trxref?: string }>
}) {
  const params = await searchParams
  const orderNumber = params.order_number

  if (!orderNumber) {
    redirect('/shop')
  }

  // Fetch order details
  const order = await getOrderByNumber(orderNumber)

  if (!order) {
    redirect('/shop')
  }

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[var(--gold)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--rose-gold)]/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Payment Verification (handles Paystack callback and cart clearing) */}
          <PaymentVerifier orderNumber={orderNumber} />
          
          <div className="max-w-3xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--gold)]/20 rounded-full blur-xl animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--rose-gold)]">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>

            <span className="inline-block text-sm font-medium tracking-[0.2em] uppercase text-accent mb-4">
              Order Confirmed
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-tight mb-6">
              Thank You for Your
              <span className="block italic text-accent">Purchase</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Your order has been successfully placed. We&apos;re preparing your premium hair extensions with care.
            </p>
          </div>
        </div>
      </section>

      {/* Order Details Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            {/* Order Summary Card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8 lg:p-10 mb-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <h2 className="font-serif text-2xl font-medium text-foreground">Order Details</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                  <p className="text-lg font-semibold text-foreground">{order.order_number}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(order.created_at)}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-lg font-semibold text-accent">{formatNGN(order.total_ngn)}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{order.payment_status}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t border-border pt-8 mb-8">
                <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-accent" />
                  Shipping Address
                </h3>
                <div className="bg-secondary/30 rounded-xl p-5">
                  <p className="font-medium text-foreground">{order.customer_name}</p>
                  <p className="text-muted-foreground">{order.shipping_address_line1}</p>
                  {order.shipping_address_line2 && (
                    <p className="text-muted-foreground">{order.shipping_address_line2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {order.shipping_city}, {order.shipping_state}
                  </p>
                  <p className="text-muted-foreground">{order.shipping_country}</p>
                  {order.shipping_postal_code && (
                    <p className="text-muted-foreground">{order.shipping_postal_code}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-border pt-8">
                <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-accent" />
                  Order Items
                </h3>
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-secondary/30 rounded-xl">
                      <div>
                        <p className="font-medium text-foreground">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quantity: {item.quantity}
                          {item.selected_length && ` • Length: ${item.selected_length}"`}
                        </p>
                      </div>
                      <p className="font-semibold text-accent">{formatNGN(item.total_price_ngn)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What Happens Next Card */}
            <div className="bg-gradient-to-br from-accent/5 to-[var(--gold)]/5 rounded-2xl border border-accent/20 p-8 lg:p-10 mb-10">
              <h3 className="font-serif text-xl font-medium text-foreground mb-6 flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent" />
                What Happens Next?
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Confirmation Email</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      We&apos;ll send a confirmation to {order.customer_email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Package className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Order Processing</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      We&apos;ll prepare your order for shipping
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Shipping Updates</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      You&apos;ll receive tracking information once shipped
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Delivery Time</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      3-5 days local, 7-14 days international
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" size="lg" className="group">
                <Link href="/shop">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {order.user_id && (
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

      <Footer />
    </main>
  )
}
