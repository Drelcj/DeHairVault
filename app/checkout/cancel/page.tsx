import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: { reason?: string }
}) {
  const reason = searchParams.reason || 'cancelled'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          {/* Warning Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-12 w-12 text-yellow-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {reason === 'failed' ? 'Payment Failed' : 'Payment Cancelled'}
            </h1>
            <p className="mt-2 text-gray-600">
              {reason === 'failed'
                ? 'Your payment could not be processed. Please try again.'
                : 'Your payment was cancelled. No charges have been made.'}
            </p>
          </div>

          {/* Information Box */}
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <h2 className="mb-3 font-semibold text-yellow-900">What happened?</h2>
            <div className="space-y-2 text-sm text-yellow-800">
              {reason === 'failed' ? (
                <>
                  <p>
                    • Your payment could not be completed. This might be due to insufficient
                    funds, incorrect card details, or bank restrictions.
                  </p>
                  <p>• Please check your payment information and try again.</p>
                  <p>
                    • If the problem persists, contact your bank or try a different payment
                    method.
                  </p>
                </>
              ) : (
                <>
                  <p>• You cancelled the payment process before it was completed.</p>
                  <p>• Your cart items are still saved and ready for checkout.</p>
                  <p>• No charges have been made to your account.</p>
                </>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mb-8 rounded-lg bg-gray-50 p-6">
            <h2 className="mb-3 font-semibold">Need Help?</h2>
            <p className="mb-4 text-sm text-gray-600">
              If you're experiencing issues with payment, we're here to help:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Try a different payment method (Stripe or Paystack)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Verify your card details and billing address</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Contact your bank to ensure international payments are enabled</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Contact our support team at{' '}
                  <a href="mailto:support@dehairvault.com" className="text-blue-600 underline">
                    support@dehairvault.com
                  </a>
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild className="sm:w-auto w-full">
              <Link href="/checkout">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="sm:w-auto w-full">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
