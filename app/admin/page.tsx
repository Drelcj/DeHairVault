import Link from 'next/link'
import { Package, ShoppingCart, Users, TrendingUp, Boxes, Truck, ShoppingBag } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/currency'
import { isLowStock, isOutOfStock } from '@/lib/utils/product'
import { STALE_PENDING_HOURS, isTestOrder, sumChargedByCurrency } from '@/lib/admin/order-metrics'
import {
  fetchOrderSummaries,
  isAwaitingShipment,
  isSale,
  isStale,
  isUnpaidCheckout,
  saleDate,
} from '@/lib/admin/order-summaries'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  const supabase = createServiceClient()

  // Active products, with the fields the shared low-stock rule needs
  const { data: products } = await supabase
    .from('products')
    .select('stock_quantity, low_stock_threshold, track_inventory')
    .eq('is_active', true)

  const productCount = products?.length ?? 0
  const lowStockCount = products?.filter(isLowStock).length ?? 0
  const outOfStockCount = products?.filter(isOutOfStock).length ?? 0

  // Orders are classified in code: test orders are excluded from every figure
  const orders = (await fetchOrderSummaries()).filter((order) => !isTestOrder(order))

  const unpaid = orders.filter(isUnpaidCheckout)
  const staleUnpaidCount = unpaid.filter((order) => isStale(order)).length
  const awaitingShipmentCount = orders.filter(isAwaitingShipment).length

  // This month in UTC, by when the order was paid
  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const monthlySales = orders.filter((order) => {
    const date = saleDate(order)
    return isSale(order) && !!date && date >= startOfMonth
  })
  const revenue = sumChargedByCurrency(monthlySales)

  // Get customer count
  const { count: customerCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'CUSTOMER')

  return {
    productCount,
    lowStockCount,
    outOfStockCount,
    unpaidCount: unpaid.length,
    staleUnpaidCount,
    awaitingShipmentCount,
    monthlyOrdersCount: monthlySales.length,
    revenueByCurrency: revenue.totals,
    revenueMissingCount: revenue.missing,
    customerCount: customerCount || 0,
  }
}

// GBP (Stripe) first, then NGN (Paystack), then anything else a provider reported
function orderedCurrencies(totals: Record<string, number>): string[] {
  const preferred = ['GBP', 'NGN']
  const rest = Object.keys(totals).filter((c) => !preferred.includes(c)).sort()
  return [...preferred, ...rest]
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  const currencies = orderedCurrencies(stats.revenueByCurrency)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Paid, Awaiting Shipment"
          value={stats.awaitingShipmentCount.toString()}
          icon={Truck}
          href="/admin/orders?status=AWAITING_SHIPMENT"
          subtitle="Paid orders to pack and ship"
          subtitleColor={stats.awaitingShipmentCount > 0 ? 'text-accent' : undefined}
        />
        <StatCard
          title="Unpaid Checkouts"
          value={stats.unpaidCount.toString()}
          icon={ShoppingBag}
          href="/admin/abandoned"
          subtitle={`${stats.staleUnpaidCount} older than ${STALE_PENDING_HOURS}h`}
          subtitleColor={stats.staleUnpaidCount > 0 ? 'text-amber-600' : undefined}
        />
        <Link
          href="/admin/orders"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue This Month</p>
              <div className="mt-2 space-y-1">
                {currencies.map((currency) => (
                  <p key={currency} className="text-2xl font-semibold text-foreground">
                    {formatPrice(stats.revenueByCurrency[currency] ?? 0, currency)}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {currency === 'GBP' ? 'via Stripe' : currency === 'NGN' ? 'via Paystack' : ''}
                    </span>
                  </p>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.monthlyOrdersCount} paid orders this month
              </p>
              {stats.revenueMissingCount > 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  {stats.revenueMissingCount} paid order{stats.revenueMissingCount === 1 ? '' : 's'} missing the charged amount
                </p>
              )}
            </div>
            <div className="rounded-lg bg-muted p-2.5 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Link>
        <StatCard
          title="Active Products"
          value={stats.productCount.toString()}
          icon={Package}
          href="/admin/products"
          subtitle={`${stats.lowStockCount} low stock`}
          subtitleColor={stats.lowStockCount > 0 ? 'text-amber-600' : undefined}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount.toString()}
          icon={Boxes}
          href="/admin/inventory"
          subtitle={`At or below each product's threshold · ${stats.outOfStockCount} out of stock`}
          subtitleColor={stats.lowStockCount > 0 ? 'text-red-600' : undefined}
        />
        <StatCard
          title="Total Customers"
          value={stats.customerCount.toString()}
          icon={Users}
          href="/admin/customers"
          subtitle="Registered accounts"
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            <Package className="h-4 w-4" />
            Add New Product
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            View Orders
          </Link>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Boxes className="h-4 w-4" />
            Manage Inventory
          </Link>
        </div>
      </div>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  subtitle?: string
  subtitleColor?: string
}

function StatCard({ title, value, icon: Icon, href, subtitle, subtitleColor }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
          {subtitle && (
            <p className={`mt-1 text-xs ${subtitleColor || 'text-muted-foreground'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-muted p-2.5 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Link>
  )
}
