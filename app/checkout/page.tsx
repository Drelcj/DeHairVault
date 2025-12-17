import { redirect } from 'next/navigation'
import { getCart } from '@/lib/actions/cart'
import { cookies } from 'next/headers'
import { CheckoutForm } from '@/components/checkout/checkout-form'

export default async function CheckoutPage() {
  // Get session ID from cookie or localStorage will be used on client side
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('guest_session_id')?.value || null

  // Fetch cart
  const cart = await getCart(sessionId || undefined)

  // Redirect to shop if cart is empty
  if (!cart || cart.items.length === 0) {
    redirect('/shop')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="mt-2 text-gray-600">
            Complete your order and proceed to payment
          </p>
        </div>

        <CheckoutForm cart={cart} sessionId={sessionId} />
      </div>
    </div>
  )
}
