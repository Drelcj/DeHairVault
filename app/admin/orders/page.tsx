import Link from "next/link"
import { ShoppingCart, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { formatPrice } from "@/lib/utils/currency"
import { createServiceClient } from "@/lib/supabase/server"
import { getChargedAmount, getPaymentReference, isClosedUnpaidCheckout, isTestOrder } from "@/lib/admin/order-metrics"
import {
  fetchOrderSummaries,
  isAwaitingShipment,
  isUnpaidCheckout,
  type OrderSummary,
} from "@/lib/admin/order-summaries"
import { OrderStatusBadge, PaymentStatusBadge, TestBadge } from "@/components/admin/order-badges"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Orders | De Hair Vault Admin",
}

const PAGE_SIZE = 50

const STATUS_TABS = [
  { value: 'ALL', label: 'All Orders' },
  { value: 'AWAITING_SHIPMENT', label: 'Awaiting Shipment' },
  { value: 'PENDING', label: 'Unpaid' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'ABANDONED', label: 'Abandoned / Expired' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'TEST', label: 'Test' },
] as const

// "All" lists every order (test ones marked TEST); every other tab is live orders only
function matchesTab(order: OrderSummary, tab: string): boolean {
  if (tab === 'ALL') return true
  if (tab === 'TEST') return isTestOrder(order)
  if (isTestOrder(order)) return false
  if (tab === 'AWAITING_SHIPMENT') return isAwaitingShipment(order)
  if (tab === 'PENDING') return isUnpaidCheckout(order)
  // Real cancellations only; unpaid checkouts closed as failed / expired / abandoned have their own tab
  if (tab === 'ABANDONED') return isClosedUnpaidCheckout(order)
  if (tab === 'CANCELLED') return order.status === 'CANCELLED' && !isClosedUnpaidCheckout(order)
  return order.status === tab
}

const ORDER_COLUMNS =
  'id, order_number, customer_name, customer_email, total_ngn, status, created_at, payment_status, payment_reference, payment_metadata, tracking_number'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const params = await searchParams
  const currentStatus = STATUS_TABS.some((tab) => tab.value === params.status) ? params.status! : 'ALL'

  const summaries = await fetchOrderSummaries()
  const counts = Object.fromEntries(
    STATUS_TABS.map((tab) => [tab.value, summaries.filter((order) => matchesTab(order, tab.value)).length])
  )

  // Filter and paginate in code (newest first), then load full rows for this page only
  const matching = summaries.filter((order) => matchesTab(order, currentStatus))
  const totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages)
  const pageIds = matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((order) => order.id)

  const supabase = createServiceClient()
  const { data, error } = pageIds.length
    ? await supabase.from('orders').select(ORDER_COLUMNS).in('id', pageIds).order('created_at', { ascending: false })
    : { data: [], error: null }
  if (error) console.error('Error fetching orders:', error)
  const orders = data ?? []

  const pageHref = (target: number) => {
    const query = new URLSearchParams()
    if (currentStatus !== 'ALL') query.set('status', currentStatus)
    if (target > 1) query.set('page', String(target))
    const qs = query.toString()
    return `/admin/orders${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-foreground">
            Orders
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track customer orders. Unpaid and abandoned checkouts are also listed under{' '}
            <Link href="/admin/abandoned" className="text-accent hover:underline">Abandoned</Link>.
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/orders${tab.value === 'ALL' ? '' : `?status=${tab.value}`}`}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentStatus === tab.value
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              currentStatus === tab.value
                ? 'bg-accent-foreground/20'
                : 'bg-muted-foreground/20'
            }`}>
              {counts[tab.value] || 0}
            </span>
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Order #</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Charged</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Payment</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Tracking</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const charged = getChargedAmount(order)
                  const reference = getPaymentReference(order)
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {order.order_number}
                          {isTestOrder(order) && <TestBadge />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {charged ? (
                          <span className="font-medium">{formatPrice(charged.amount, charged.currency)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Order total {formatPrice(Number(order.total_ngn || 0), 'NGN')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <PaymentStatusBadge status={order.payment_status} />
                        {reference && (
                          <p className="mt-1 max-w-[180px] truncate font-mono text-xs text-muted-foreground" title={reference}>
                            {reference}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {order.tracking_number || <span className="font-sans text-muted-foreground">—</span>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, matching.length)} of {matching.length}
          </p>
          <div className="flex items-center gap-2">
            <PageLink href={pageHref(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </PageLink>
            <span className="text-muted-foreground">Page {page} of {totalPages}</span>
            <PageLink href={pageHref(page + 1)} disabled={page >= totalPages}>
              Next <ChevronRight className="h-4 w-4" />
            </PageLink>
          </div>
        </div>
      )}
    </div>
  )
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  const className = 'inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium'
  if (disabled) return <span className={`${className} opacity-40`}>{children}</span>
  return (
    <Link href={href} className={`${className} bg-background hover:bg-muted transition-colors`}>
      {children}
    </Link>
  )
}
