export const dynamic = 'force-dynamic'

export default function AdminHome() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage products, orders, and content.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Products" value="--" subtitle="Overview" />
        <StatCard title="Orders" value="--" subtitle="Coming soon" />
        <StatCard title="Revenue" value="--" subtitle="Coming soon" />
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
