import Link from "next/link"
import { RotateCcw, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { formatPrice } from "@/lib/utils/currency"
import { createServiceClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Returns | De Hair Vault Admin",
}

interface ReturnOrder {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  total_ngn: number
  status: string
  created_at: string
  updated_at: string
}

// For now, we'll track returns through order status
// In a full implementation, you'd have a separate returns table
async function getReturnsData() {
  const supabase = createServiceClient()
  
  // Get refunded and cancelled orders as proxy for returns
  const { data: returnedOrdersData } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, customer_email, total_ngn, status, created_at, updated_at')
    .in('status', ['REFUNDED', 'CANCELLED'])
    .order('updated_at', { ascending: false })
    .limit(50)

  const returnedOrders = returnedOrdersData as ReturnOrder[] | null

  // Get stats
  const { count: refundedCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'REFUNDED')

  const { count: cancelledCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'CANCELLED')

  // Calculate refund value
  const { data: refundedOrdersData } = await supabase
    .from('orders')
    .select('total_ngn')
    .eq('status', 'REFUNDED')

  const refundedOrders = refundedOrdersData as { total_ngn: number }[] | null
  const totalRefundValue = refundedOrders?.reduce((sum, o) => sum + Number(o.total_ngn || 0), 0) || 0

  return {
    returnedOrders: returnedOrders || [],
    refundedCount: refundedCount || 0,
    cancelledCount: cancelledCount || 0,
    totalRefundValue,
  }
}

export default async function ReturnsPage() {
  const data = await getReturnsData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-foreground">
          Returns & Refunds
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage order returns and refund requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2.5">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Refunded Orders</p>
              <p className="text-2xl font-semibold">{data.refundedCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2.5">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cancelled Orders</p>
              <p className="text-2xl font-semibold">{data.cancelledCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2.5">
              <RotateCcw className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Refund Value</p>
              <p className="text-2xl font-semibold">{formatPrice(data.totalRefundValue, 'NGN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">
              Returns Management
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Currently, returns are tracked through order status (Refunded/Cancelled). 
              For a dedicated returns workflow with return requests, approvals, and tracking, 
              consider implementing a separate returns management system.
            </p>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Refunded & Cancelled Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Order #</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Amount</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.returnedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No returns or refunds found</p>
                    <p className="text-sm text-muted-foreground/70">This is a good thing!</p>
                  </td>
                </tr>
              ) : (
                data.returnedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(Number(order.total_ngn || 0), 'NGN')}
                    </td>
                    <td className="px-6 py-4">
                      <ReturnStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.updated_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        View Order
                      </Link>
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

function ReturnStatusBadge({ status }: { status: string }) {
  if (status === 'REFUNDED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="h-3 w-3" />
        Refunded
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
      <XCircle className="h-3 w-3" />
      Cancelled
    </span>
  )
}
