import Link from "next/link"
import { HeaderShell } from "@/components/header-shell"
import { formatPrice } from "@/lib/utils/currency"
import { OrderStatusActions } from "./_components/order-status-actions"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Order Details | De Hair Vault Admin",
}

async function getOrder(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    const res = await fetch(`${baseUrl}/api/admin/orders/${id}`, { cache: 'no-store' })
    if (!res.ok) {
      console.error('Failed to fetch order:', res.status)
      return null
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const data = await getOrder(params.id)
  const order = data?.order
  const items = data?.items ?? []

  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <section className="container mx-auto px-6 lg:px-12 py-10">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
              <h1 className="font-[--font-playfair] text-2xl md:text-3xl font-medium text-foreground">Order {order?.order_number ?? '—'}</h1>
            </div>
            <Link href="/admin/orders" className="text-sm text-accent hover:text-accent/80">Back to Orders</Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 grid gap-6">
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium">Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="px-4 md:px-6 py-3 font-medium">Product</th>
                      <th className="px-4 md:px-6 py-3 font-medium">Length</th>
                      <th className="px-4 md:px-6 py-3 font-medium">Qty</th>
                      <th className="px-4 md:px-6 py-3 font-medium">Unit (₦)</th>
                      <th className="px-4 md:px-6 py-3 font-medium">Total (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td className="px-4 md:px-6 py-6 text-muted-foreground" colSpan={5}>No items.</td>
                      </tr>
                    ) : (
                      items.map((it: any) => (
                        <tr key={it.id} className="border-t border-border">
                          <td className="px-4 md:px-6 py-3">{it.product_name}</td>
                          <td className="px-4 md:px-6 py-3">{it.selected_length ?? '—'}</td>
                          <td className="px-4 md:px-6 py-3">{it.quantity}</td>
                          <td className="px-4 md:px-6 py-3">{formatPrice(Number(it.unit_price_ngn || 0), 'NGN')}</td>
                          <td className="px-4 md:px-6 py-3">{formatPrice(Number(it.total_price_ngn || 0), 'NGN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <OrderStatusActions orderId={params.id} currentStatus={order?.status || 'PENDING'} />
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium">Summary</h2>
              </div>
              <div className="p-4 md:p-6 text-sm">
                <div className="flex justify-between py-1"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(Number(order?.subtotal_ngn || 0), 'NGN')}</span></div>
                <div className="flex justify-between py-1"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(Number(order?.shipping_cost_ngn || 0), 'NGN')}</span></div>
                <div className="flex justify-between py-1"><span className="text-muted-foreground">Tax</span><span>{formatPrice(Number(order?.tax_ngn || 0), 'NGN')}</span></div>
                <div className="flex justify-between py-1"><span className="text-muted-foreground">Discount</span><span>{formatPrice(Number(order?.discount_ngn || 0), 'NGN')}</span></div>
                <div className="flex justify-between py-2 border-t border-border mt-2"><span className="font-medium">Total</span><span className="font-medium">{formatPrice(Number(order?.total_ngn || 0), 'NGN')}</span></div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium">Customer</h2>
              </div>
              <div className="p-4 md:p-6 text-sm">
                <p className="font-medium">{order?.customer_name ?? '—'}</p>
                <p className="text-muted-foreground">{order?.customer_email ?? '—'}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium">Shipping Address</h2>
              </div>
              <div className="p-4 md:p-6 text-sm">
                <p className="font-medium">{order?.shipping_address ?? '—'}</p>
                <p className="text-muted-foreground">{order?.shipping_city ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}