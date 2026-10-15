// Status badges shared by the admin orders, order detail and abandoned-checkout pages

const BADGE = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium'

const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESSING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  SHIPPED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export function OrderStatusBadge({ status }: { status: string | null }) {
  const value = status ?? 'PENDING'
  return <span className={`${BADGE} ${ORDER_STATUS_STYLES[value] || ORDER_STATUS_STYLES.PENDING}`}>{value}</span>
}

const PAYMENT_STATUS: Record<string, { label: string; style: string }> = {
  paid: { label: 'Paid', style: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  pending: { label: 'Pending', style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  failed: { label: 'Failed', style: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  expired: { label: 'Expired', style: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
  abandoned: { label: 'Abandoned', style: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
}

export function PaymentStatusBadge({ status }: { status: string | null }) {
  const config = PAYMENT_STATUS[(status ?? 'pending').toLowerCase()] ?? PAYMENT_STATUS.pending
  return <span className={`${BADGE} ${config.style}`}>{config.label}</span>
}

export function TestBadge() {
  return (
    <span
      className="inline-flex items-center rounded border border-dashed border-orange-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-orange-600 dark:text-orange-400"
      title="Placed with payment provider test keys. Excluded from all dashboard figures."
    >
      TEST
    </span>
  )
}
