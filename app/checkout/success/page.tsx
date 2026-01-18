import { redirect } from 'next/navigation'
import { getOrderByNumber } from '@/lib/actions/checkout'
import { HeaderShell } from '@/components/header-shell'
import { Footer } from '@/components/footer'
import { 
  SuccessPageContent, 
  OrderNotFound 
} from './success-page-content'

export const metadata = {
  title: 'Order Confirmed | Dehair Vault',
  description: 'Your order has been successfully placed.',
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_number?: string; reference?: string; trxref?: string }>
}) {
  const params = await searchParams
  const orderNumber = params.order_number

  if (!orderNumber) {
    redirect('/shop')
  }

  // Fetch order details from database using order_number (secure - no sensitive data in URL)
  const order = await getOrderByNumber(orderNumber)

  // If order not found, show a race-condition-aware component instead of redirecting
  // This handles the case where payment webhook hasn't completed yet
  if (!order) {
    return (
      <main className="min-h-screen bg-background">
        <HeaderShell />
        <OrderNotFound orderNumber={orderNumber} />
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <SuccessPageContent order={order} orderNumber={orderNumber} />
      <Footer />
    </main>
  )
}
