import Link from "next/link"
import { Users, Mail, Phone, MapPin, ShoppingBag } from "lucide-react"
import { formatPrice } from "@/lib/utils/currency"
import { createServiceClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Customers | De Hair Vault Admin",
}

interface UserData {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  city: string | null
  state: string | null
  country: string | null
  role: string
  created_at: string
}

interface CustomerWithStats extends UserData {
  order_count: number
  total_spent: number
}

interface OrderData {
  total_ngn: number
}

async function getCustomers(): Promise<CustomerWithStats[]> {
  const supabase = createServiceClient()
  
  // Get all users who are customers
  const { data: usersData } = await supabase
    .from('users')
    .select('id, email, full_name, phone, city, state, country, role, created_at')
    .eq('role', 'CUSTOMER')
    .order('created_at', { ascending: false })
    .limit(100)

  const users = usersData as UserData[] | null
  if (!users || users.length === 0) {
    return []
  }

  // Get order stats for each customer
  const customersWithStats: CustomerWithStats[] = await Promise.all(
    users.map(async (user) => {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_ngn')
        .eq('user_id', user.id)

      const orders = ordersData as OrderData[] | null
      const orderCount = orders?.length || 0
      const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total_ngn || 0), 0) || 0

      return {
        ...user,
        order_count: orderCount,
        total_spent: totalSpent,
      }
    })
  )

  return customersWithStats
}

async function getCustomerStats() {
  const supabase = createServiceClient()
  
  // Total customers
  const { count: totalCustomers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'CUSTOMER')

  // New customers this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { count: newThisMonth } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'CUSTOMER')
    .gte('created_at', startOfMonth.toISOString())

  // Customers with orders
  const { data: ordersData } = await supabase
    .from('orders')
    .select('user_id')
    .not('user_id', 'is', null)

  const orders = ordersData as { user_id: string }[] | null
  const uniqueCustomersWithOrders = new Set(orders?.map(o => o.user_id) || [])

  return {
    totalCustomers: totalCustomers || 0,
    newThisMonth: newThisMonth || 0,
    withOrders: uniqueCustomersWithOrders.size,
  }
}

export default async function CustomersPage() {
  const [customers, stats] = await Promise.all([
    getCustomers(),
    getCustomerStats(),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-foreground">
          Customers
        </h1>
        <p className="mt-1 text-muted-foreground">
          View and manage your customer base
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-semibold">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2.5">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New This Month</p>
              <p className="text-2xl font-semibold">{stats.newThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2.5">
              <ShoppingBag className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">With Orders</p>
              <p className="text-2xl font-semibold">{stats.withOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">All Customers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Contact</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Orders</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Total Spent</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No customers found</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {customer.full_name || 'No name'}
                        </p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="text-xs truncate max-w-[150px]">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span className="text-xs">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.city || customer.state || customer.country ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-xs">
                            {[customer.city, customer.state, customer.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{customer.order_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">
                        {customer.total_spent > 0 ? formatPrice(customer.total_spent, 'NGN') : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(customer.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
