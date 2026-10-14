import { getOrderEmailPreviews } from '@/lib/actions/email'
import { SendTestEmailButton } from '@/components/admin/send-test-email-button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Email Test | De Hair Vault Admin',
}

// Preview the order emails and send test copies to yourself.
// Uses sample data by default; add ?order=DHV-2026-123456 to use a real order.
export default async function AdminEmailTestPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order } = await searchParams
  const previews = await getOrderEmailPreviews(order)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Order emails</h1>
          <p className="text-sm text-muted-foreground">
            {order ? `Previewing with order ${order}.` : 'Previewing with sample data.'} Test emails go only to you,
            with [TEST] in the subject.
          </p>
        </div>
        {previews.success && previews.recipient && (
          <SendTestEmailButton recipient={previews.recipient} orderNumber={order} />
        )}
      </div>

      {!previews.success && <p className="text-sm text-destructive">{previews.error}</p>}

      <div className="grid gap-6 xl:grid-cols-2">
        {[
          { title: 'Customer confirmation', email: previews.confirmation },
          { title: 'Team alert', email: previews.alert },
        ].map(
          ({ title, email }) =>
            email && (
              <section key={title} className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                  <p className="text-sm text-muted-foreground">Subject: {email.subject}</p>
                </div>
                <iframe title={title} srcDoc={email.html} sandbox="" className="h-[900px] w-full bg-white" />
              </section>
            )
        )}
      </div>
    </div>
  )
}
