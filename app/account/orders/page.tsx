import Link from 'next/link'
import { redirect } from 'next/navigation'
import { HeaderShell } from '@/components/header-shell'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { getUserOrders } from '@/lib/actions/checkout'
import { getSessionUser } from '@/lib/auth/session'
import { Package, ArrowRight, ShoppingBag, Eye, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react'

export const metadata = {
  title: 'My Orders | Dehair Vault',
  description: 'View your order history and track your purchases.',
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  CONFIRMED: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
  PROCESSING: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  SHIPPED: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  DELIVERED: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  CANCELLED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  REFUNDED: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
}

export default async function AccountOrdersPage() {
  // Check if user is authenticated
  const session = await getSessionUser()
  
  if (!session?.user) {
    redirect('/login?redirect=/account/orders')
  }

  // Fetch user orders
  const { orders, error } = await getUserOrders()

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.PENDING
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
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-sm font-medium tracking-[0.2em] uppercase text-accent mb-6">
              My Account
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-tight mb-6">
              Your Orders
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Track your purchases and view your order history. Every order is crafted with care and shipped with love.
            </p>
          </div>
        </div>
      </section>

      {/* Orders Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            {error ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
                  Something went wrong
                </h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button asChild variant="outline">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
                  No orders yet
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  You haven&apos;t placed any orders yet. Explore our premium collection and find your perfect hair extensions.
                </p>
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground group">
                  <Link href="/shop">
                    Start Shopping
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => {
                  const config = getStatusConfig(order.status)
                  const StatusIcon = config.icon
                  const itemCount = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0

                  return (
                    <div
                      key={order.id}
                      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Order Header */}
                      <div className="p-6 border-b border-border bg-secondary/20">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                            <p className="font-semibold text-foreground">{order.order_number}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                              <p className="font-medium text-foreground">{formatDate(order.created_at)}</p>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
                              <StatusIcon className={`h-4 w-4 ${config.color}`} />
                              <span className={`text-sm font-medium ${config.color} capitalize`}>
                                {order.status.toLowerCase().replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                              <Package className="h-4 w-4" />
                              <span className="text-sm">
                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                              </span>
                              {order.shipping_city && (
                                <>
                                  <span>•</span>
                                  <span className="text-sm">
                                    {order.shipping_city}, {order.shipping_country}
                                  </span>
                                </>
                              )}
                            </div>
                            {/* First few items */}
                            <div className="flex flex-wrap gap-2">
                              {order.order_items?.slice(0, 3).map((item: any) => (
                                <span
                                  key={item.id}
                                  className="text-sm px-3 py-1 bg-secondary/50 rounded-full text-foreground"
                                >
                                  {item.product_name}
                                  {item.quantity > 1 && ` × ${item.quantity}`}
                                </span>
                              ))}
                              {order.order_items?.length > 3 && (
                                <span className="text-sm px-3 py-1 bg-secondary/50 rounded-full text-muted-foreground">
                                  +{order.order_items.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground mb-1">Total</p>
                              <p className="text-xl font-semibold text-accent">{formatNGN(order.total_ngn)}</p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="group">
                              <Link href={`/account/orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Continue Shopping */}
                <div className="text-center pt-8">
                  <Button asChild variant="outline" size="lg" className="group">
                    <Link href="/shop">
                      Continue Shopping
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
