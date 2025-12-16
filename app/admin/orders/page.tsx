import Link from "next/link"
import { HeaderShell } from "@/components/header-shell"
import { formatPrice } from "@/lib/utils/currency"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Orders | De Hair Vault Admin",
}

async function fetchPendingOrders() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/orders?status=PENDING&page=1&pageSize=20&sort=created_at:desc`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    return { data: [], pagination: { page: 1, per_page: 20, total: 0, total_pages: 0 } }
  }
  return res.json()
}

export default async function AdminOrdersPage() {
  const { data: orders } = await fetchPendingOrders()
  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <section className="container mx-auto px-6 lg:px-12 py-10">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
              <h1 className="font-(family-name:--font-playfair) text-2xl md:text-3xl font-medium text-foreground">Orders</h1>
            </div>
            <Link href="/admin" className="text-sm text-accent hover:text-accent/80">Back to Dashboard</Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border">
            <h2 className="text-base font-medium">Pending Orders</h2>
            <div className="text-sm text-muted-foreground">Latest 20</div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="px-4 md:px-6 py-3 font-medium">Order #</th>
                  <th className="px-4 md:px-6 py-3 font-medium">Customer</th>
                  <th className="px-4 md:px-6 py-3 font-medium">Email</th>
                  <th className="px-4 md:px-6 py-3 font-medium">Total (₦)</th>
                  <th className="px-4 md:px-6 py-3 font-medium">Status</th>
                  <th className="px-4 md:px-6 py-3 font-medium">Placed</th>
                  <th className="px-4 md:px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td className="px-4 md:px-6 py-6 text-muted-foreground" colSpan={7}>No pending orders.</td>
                  </tr>
                ) : (
                  orders.map((o: any) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="px-4 md:px-6 py-3">{o.order_number}</td>
                      <td className="px-4 md:px-6 py-3">{o.customer_name}</td>
                      <td className="px-4 md:px-6 py-3 text-muted-foreground">{o.customer_email}</td>
                      <td className="px-4 md:px-6 py-3">{formatPrice(Number(o.total_ngn || 0), 'NGN', { showDecimals: true })}</td>
                      <td className="px-4 md:px-6 py-3">
                        <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-2.5 py-1.5 text-xs">{o.status}</span>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleString('en-NG')}</td>
                      <td className="px-4 md:px-6 py-3">
                        <div className="flex gap-2 text-xs">
                          <Link href={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-accent hover:text-accent-foreground">View</Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}
