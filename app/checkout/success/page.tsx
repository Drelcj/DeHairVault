import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getOrderByNumber } from '@/lib/actions/checkout'
import { Button } from '@/components/ui/button'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order_number?: string }
}) {
  const orderNumber = searchParams.order_number

  if (!orderNumber) {
    redirect('/shop')
  }

  // Fetch order details
  const order = await getOrderByNumber(orderNumber)

  if (!order) {
    redirect('/shop')
  }

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
            <p className="mt-2 text-gray-600">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Details */}
          <div className="mb-8 rounded-lg border bg-gray-50 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-lg font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="text-lg font-semibold">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-semibold">{formatNGN(order.total_ngn)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className="text-lg font-semibold capitalize">{order.payment_status}</p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold">Shipping Address</h2>
            <div className="rounded-lg border p-4">
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-sm text-gray-600">{order.shipping_address_line1}</p>
              {order.shipping_address_line2 && (
                <p className="text-sm text-gray-600">{order.shipping_address_line2}</p>
              )}
              <p className="text-sm text-gray-600">
                {order.shipping_city}, {order.shipping_state}
              </p>
              <p className="text-sm text-gray-600">{order.shipping_country}</p>
              {order.shipping_postal_code && (
                <p className="text-sm text-gray-600">{order.shipping_postal_code}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold">Order Items</h2>
            <div className="space-y-3">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                      {item.selected_length && ` • Length: ${item.selected_length}"`}
                    </p>
                  </div>
                  <p className="font-semibold">{formatNGN(item.total_price_ngn)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="mb-8 rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">What happens next?</h3>
            <ul className="mt-2 space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  You will receive an order confirmation email at {order.customer_email}
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>We'll process your order and prepare it for shipping</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  You'll receive tracking information once your order ships
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Estimated delivery: 7-14 business days for international orders, 3-5 days for
                  local orders
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild variant="outline" className="sm:w-auto w-full">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            {order.user_id && (
              <Button asChild className="sm:w-auto w-full">
                <Link href="/account/orders">View My Orders</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
