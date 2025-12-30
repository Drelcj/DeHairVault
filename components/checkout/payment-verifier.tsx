'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'

interface PaymentVerifierProps {
  orderNumber: string
}

export function PaymentVerifier({ orderNumber }: PaymentVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const searchParams = useSearchParams()
  const { refreshCart } = useCart()

  useEffect(() => {
    const verifyPayment = async () => {
      // Get the reference from URL params
      // Paystack adds: reference or trxref
      // Stripe adds: session_id (if configured in success_url)
      const paystackReference = searchParams.get('reference') || searchParams.get('trxref')
      const stripeSessionId = searchParams.get('session_id')
      
      if (!paystackReference && !stripeSessionId) {
        // No payment reference in URL - order might already be verified via webhook
        setIsVerifying(false)
        setVerificationStatus('success')
        // Still refresh cart to ensure it's cleared
        await refreshCart()
        return
      }

      try {
        let response: Response

        if (paystackReference) {
          // Verify Paystack payment
          response = await fetch('/api/checkout/paystack/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              reference: paystackReference,
              orderNumber,
            }),
          })
        } else if (stripeSessionId) {
          // Verify Stripe payment
          response = await fetch('/api/checkout/stripe/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: stripeSessionId,
              orderNumber,
            }),
          })
        } else {
          setVerificationStatus('success')
          await refreshCart()
          setIsVerifying(false)
          return
        }

        const data = await response.json()

        if (data.verified || data.alreadyProcessed) {
          setVerificationStatus('success')
          // Refresh cart to ensure it's cleared
          await refreshCart()
        } else {
          console.error('Payment verification failed:', data)
          setVerificationStatus('failed')
        }
      } catch (error) {
        console.error('Error verifying payment:', error)
        setVerificationStatus('failed')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams, orderNumber, refreshCart])

  if (isVerifying) {
    return (
      <div className="mb-6 flex justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Verifying payment...</span>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-center">
        <p className="text-sm text-yellow-800">
          We couldn't verify your payment automatically. Don't worry - if payment was successful, 
          your order will be confirmed shortly. Please contact support if you have any concerns.
        </p>
      </div>
    )
  }

  // Success - don't show anything, the page already has success UI
  return null
}
