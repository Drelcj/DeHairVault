import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { HeaderShell } from '@/components/header-shell'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { getUserOrderById } from '@/lib/actions/checkout'
import { getSessionUser } from '@/lib/auth/session'
import { 
  Package, 
  ArrowLeft, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

export const metadata = {
  title: 'Order Details | Dehair Vault',
  description: 'View your order details and track your purchase.',
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
  CONFIRMED: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Confirmed' },
  PROCESSING: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Processing' },
  SHIPPED: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Shipped' },
  DELIVERED: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
  CANCELLED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
  REFUNDED: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Refunded' },
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Check if user is authenticated
  const session = await getSessionUser()
  
  if (!session?.user) {
    redirect('/login?redirect=/account/orders')
  }

  // Fetch order
  const order = await getUserOrderById(id)

  if (!order) {
    notFound()
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const config = statusConfig[order.status] || statusConfig.PENDING
  const StatusIcon = config.icon

  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[var(--gold)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--rose-gold)]/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link 
              href="/account/orders" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="inline-block text-sm font-medium tracking-[0.2em] uppercase text-accent mb-2">
                  Order Details
                </span>
                <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
                  {order.order_number}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bg}`}>
                <StatusIcon className={`h-5 w-5 ${config.color}`} />
                <span className={`font-medium ${config.color}`}>{config.label}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Content */}
      <section className="py-10 lg:py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Order Items - Main Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Items Card */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 lg:p-8">
                  <h2 className="font-serif text-xl font-medium text-foreground mb-6 flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-accent" />
                    Order Items
                  </h2>
                  <div className="space-y-4">
                    {order.order_items?.map((item: any) => (
                      <div 
                        key={item.id} 
                        className="flex items-start justify-between p-4 bg-secondary/30 rounded-xl"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.product_name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                            <span>Qty: {item.quantity}</span>
                            {item.selected_length && (
                              <span>Length: {item.selected_length}&quot;</span>
                            )}
                            <span>Unit: {formatNGN(item.unit_price_ngn)}</span>
                          </div>
                        </div>
                        <p className="font-semibold text-accent text-lg">
                          {formatNGN(item.total_price_ngn)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Timeline (if shipped) */}
                {order.tracking_number && (
                  <div className="bg-card rounded-2xl border border-border shadow-sm p-6 lg:p-8">
                    <h2 className="font-serif text-xl font-medium text-foreground mb-6 flex items-center gap-3">
                      <Truck className="h-5 w-5 text-accent" />
                      Tracking Information
                    </h2>
                    <div className="bg-secondary/30 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                      <p className="font-mono font-medium text-foreground">{order.tracking_number}</p>
                      {order.tracking_url && (
                        <a 
                          href={order.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-accent hover:underline mt-2 text-sm"
                        >
                          Track Package →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="font-medium text-foreground mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatNGN(order.subtotal_ngn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {order.shipping_cost_ngn > 0 ? formatNGN(order.shipping_cost_ngn) : 'Free'}
                      </span>
                    </div>
                    {order.discount_ngn > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatNGN(order.discount_ngn)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-3 flex justify-between font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-accent text-lg">{formatNGN(order.total_ngn)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="font-medium text-foreground mb-4">Contact Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-accent mt-0.5" />
                      <span className="text-muted-foreground">{order.customer_email}</span>
                    </div>
                    {order.customer_phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-accent mt-0.5" />
                        <span className="text-muted-foreground">{order.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    Shipping Address
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">{order.customer_name}</p>
                    <p>{order.shipping_address_line1}</p>
                    {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                    <p>{order.shipping_city}, {order.shipping_state}</p>
                    <p>{order.shipping_country}</p>
                    {order.shipping_postal_code && <p>{order.shipping_postal_code}</p>}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="font-medium text-foreground mb-4">Payment</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`font-medium capitalize ${
                        order.payment_status === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {order.payment_status?.toLowerCase() || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/account/orders">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/contact">
                  Need Help?
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
