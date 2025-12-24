import Link from 'next/link'
import { Package, ShoppingCart, Users, TrendingUp, Boxes, RotateCcw } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/currency'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  const supabase = createServiceClient()
  
  // Get product count
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get pending orders count
  const { count: pendingOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING')

  // Get total orders this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { count: monthlyOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  // Get revenue this month
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_ngn')
    .gte('created_at', startOfMonth.toISOString())
    .in('status', ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'])

  const monthlyRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_ngn || 0), 0) || 0

  // Get customer count
  const { count: customerCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'CUSTOMER')

  // Get low stock products
  const { count: lowStockCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .lt('stock_quantity', 5)

  return {
    productCount: productCount || 0,
    pendingOrdersCount: pendingOrdersCount || 0,
    monthlyOrdersCount: monthlyOrdersCount || 0,
    monthlyRevenue,
    customerCount: customerCount || 0,
    lowStockCount: lowStockCount || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

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
          title="Active Products"
          value={stats.productCount.toString()}
          icon={Package}
          href="/admin/products"
          subtitle={`${stats.lowStockCount} low stock`}
          subtitleColor={stats.lowStockCount > 0 ? 'text-amber-600' : undefined}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrdersCount.toString()}
          icon={ShoppingCart}
          href="/admin/orders"
          subtitle="Awaiting processing"
          subtitleColor={stats.pendingOrdersCount > 0 ? 'text-accent' : undefined}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatPrice(stats.monthlyRevenue, 'NGN')}
          icon={TrendingUp}
          href="/admin/orders"
          subtitle={`${stats.monthlyOrdersCount} orders this month`}
        />
        <StatCard
          title="Total Customers"
          value={stats.customerCount.toString()}
          icon={Users}
          href="/admin/customers"
          subtitle="Registered accounts"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount.toString()}
          icon={Boxes}
          href="/admin/inventory"
          subtitle="Below threshold"
          subtitleColor={stats.lowStockCount > 0 ? 'text-red-600' : undefined}
        />
        <StatCard
          title="Returns"
          value="--"
          icon={RotateCcw}
          href="/admin/returns"
          subtitle="Coming soon"
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
