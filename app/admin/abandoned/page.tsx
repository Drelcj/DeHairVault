import Link from "next/link"
import { ShoppingBag, ShoppingCart, Eye } from "lucide-react"
import { formatPrice } from "@/lib/utils/currency"
import { createServiceClient } from "@/lib/supabase/server"
import { STALE_PENDING_HOURS, getCheckoutValue, getUnpaidOutcome, isTestOrder, type UnpaidOutcome } from "@/lib/admin/order-metrics"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Abandoned Checkouts | De Hair Vault Admin",
}

// Kept as marketing data for follow-up emails: nothing here is ever deleted
const MAX_ROWS = 500

const OUTCOME_LABELS: Record<UnpaidOutcome, { label: string; style: string }> = {
  pending: { label: 'In progress', style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  failed: { label: 'Payment failed', style: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  expired: { label: 'Session expired', style: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
  abandoned: { label: 'Abandoned', style: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
}

type ItemSummary = { name: string; quantity: number; length: number | null }

async function getAbandonedCheckouts() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, order_number, customer_name, customer_email, customer_phone, total_ngn, exchange_rate, payment_method, status, payment_status, payment_metadata, cancellation_reason, created_at, order_items(product_name, quantity, selected_length)'
    )
    .in('status', ['PENDING', 'CANCELLED'])
    .or('payment_status.is.null,payment_status.neq.paid')
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS)

  if (error) console.error('Error fetching abandoned checkouts:', error)

  // Test-mode and internal test checkouts are not customers to follow up
  return (data ?? []).filter((order) => !isTestOrder(order)).map((order) => ({
    ...order,
    value: getCheckoutValue(order),
    outcome: getUnpaidOutcome(order),
    items: (order.order_items ?? []).map(
      (item): ItemSummary => ({ name: item.product_name, quantity: item.quantity, length: item.selected_length })
    ),
  }))
}

async function getAbandonedCarts() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('carts')
    .select(
      'id, user_id, session_id, created_at, updated_at, user:users(full_name, email, phone), cart_items(quantity, selected_length, unit_price_ngn, updated_at, product:products(name))'
    )
    .order('updated_at', { ascending: false })
    .limit(MAX_ROWS)

  if (error) console.error('Error fetching abandoned carts:', error)

  const carts = (data ?? [])
    .filter((cart) => (cart.cart_items ?? []).length > 0)
    .map((cart) => {
      const items = cart.cart_items ?? []
      const lastActivity = [cart.updated_at, ...items.map((item) => item.updated_at)]
        .filter((value): value is string => !!value)
        .sort()
        .pop() ?? cart.created_at
      return {
        id: cart.id,
        userId: cart.user_id,
        name: cart.user?.full_name ?? null,
        email: cart.user?.email ?? null,
        phone: cart.user?.phone ?? null,
        lastActivity,
        valueNgn: items.reduce((sum, item) => sum + Number(item.unit_price_ngn || 0) * item.quantity, 0),
        items: items.map(
          (item): ItemSummary => ({ name: item.product?.name ?? 'Unknown product', quantity: item.quantity, length: item.selected_length })
        ),
      }
    })

  // A cart whose owner started checkout afterwards is already listed as a checkout
  const userIds = [...new Set(carts.map((cart) => cart.userId).filter((id): id is string => !!id))]
  const { data: orders } = userIds.length
    ? await supabase.from('orders').select('user_id, created_at').in('user_id', userIds)
    : { data: [] }
  const latestOrderByUser = new Map<string, string>()
  for (const order of orders ?? []) {
    if (!order.user_id || !order.created_at) continue
    const prior = latestOrderByUser.get(order.user_id)
    if (!prior || order.created_at > prior) latestOrderByUser.set(order.user_id, order.created_at)
  }

  return carts.filter((cart) => {
    const latestOrder = cart.userId ? latestOrderByUser.get(cart.userId) : undefined
    return !(latestOrder && cart.lastActivity && latestOrder >= cart.lastActivity)
  })
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ItemList({ items }: { items: ItemSummary[] }) {
  if (items.length === 0) return <span className="text-muted-foreground">—</span>
  return (
    <ul className="space-y-0.5">
      {items.map((item, index) => (
        <li key={index} className="text-xs">
          {item.quantity} × {item.name}
          {item.length ? <span className="text-muted-foreground"> · {item.length}"</span> : null}
        </li>
      ))}
    </ul>
  )
}

export default async function AbandonedPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const params = await searchParams
  const view = params.view === 'carts' ? 'carts' : 'checkouts'
  const [checkouts, carts] = await Promise.all([getAbandonedCheckouts(), getAbandonedCarts()])

  const tabs = [
    { value: 'checkouts', label: 'Unpaid Checkouts', count: checkouts.length, icon: ShoppingBag },
    { value: 'carts', label: 'Abandoned Carts', count: carts.length, icon: ShoppingCart },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-foreground">
          Abandoned
        </h1>
        <p className="mt-1 text-muted-foreground">
          Customers who started checkout but didn&apos;t pay, and carts left without starting checkout.
          Unpaid checkouts are marked abandoned after {STALE_PENDING_HOURS}h. Nothing here is deleted.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === 'checkouts' ? '/admin/abandoned' : '/admin/abandoned?view=carts'}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              view === tab.value ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${view === tab.value ? 'bg-accent-foreground/20' : 'bg-muted-foreground/20'}`}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          {view === 'checkouts' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Items</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Value</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">What happened</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {checkouts.length === 0 ? (
                  <EmptyRow colSpan={6} text="No unpaid checkouts" />
                ) : (
                  checkouts.map((order) => {
                    const outcome = OUTCOME_LABELS[order.outcome]
                    return (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors align-top">
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                          {order.customer_phone && <p className="text-xs text-muted-foreground">{order.customer_phone}</p>}
                        </td>
                        <td className="px-6 py-4"><ItemList items={order.items} /></td>
                        <td className="px-6 py-4 font-medium">
                          {formatPrice(order.value.amount, order.value.currency)}
                          <p className="text-xs font-normal text-muted-foreground">
                            via {order.payment_method === 'paystack' ? 'Paystack' : 'Stripe'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{formatDate(order.created_at)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${outcome.style}`}>
                            {outcome.label}
                          </span>
                          {order.cancellation_reason && (
                            <p className="mt-1 text-xs text-muted-foreground">{order.cancellation_reason}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {order.order_number}
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Items</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Value</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Last activity</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">What happened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {carts.length === 0 ? (
                  <EmptyRow colSpan={5} text="No abandoned carts" />
                ) : (
                  carts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-muted/30 transition-colors align-top">
                      <td className="px-6 py-4">
                        {cart.email ? (
                          <>
                            <p className="font-medium text-foreground">{cart.name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{cart.email}</p>
                            {cart.phone && <p className="text-xs text-muted-foreground">{cart.phone}</p>}
                          </>
                        ) : (
                          <p className="text-muted-foreground">Guest (no contact details)</p>
                        )}
                      </td>
                      <td className="px-6 py-4"><ItemList items={cart.items} /></td>
                      <td className="px-6 py-4 font-medium">{formatPrice(cart.valueNgn, 'NGN')}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(cart.lastActivity)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                          Checkout not started
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {(checkouts.length >= MAX_ROWS || carts.length >= MAX_ROWS) && (
        <p className="text-xs text-muted-foreground">Showing the most recent {MAX_ROWS}.</p>
      )}
    </div>
  )
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">{text}</p>
      </td>
    </tr>
  )
}
