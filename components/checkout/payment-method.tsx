'use client'

import { Label } from '@/components/ui/label'

interface PaymentMethodProps {
  value: 'stripe' | 'paystack'
  onChange: (method: 'stripe' | 'paystack') => void
}

export function PaymentMethod({ value, onChange }: PaymentMethodProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Payment Method</h3>
        <p className="text-sm text-gray-500">
          Select your preferred payment method
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Stripe Option */}
        <div
          className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
            value === 'stripe'
              ? 'border-black bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onChange('stripe')}
        >
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              name="payment-method"
              value="stripe"
              checked={value === 'stripe'}
              onChange={() => onChange('stripe')}
              className="mt-1 h-4 w-4 border-gray-300 text-black focus:ring-black"
            />
            <div className="flex-1">
              <Label className="text-base font-semibold">
                International Cards
              </Label>
              <p className="mt-1 text-sm text-gray-500">
                Pay with Visa, Mastercard, or American Express
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-600">Powered by</span>
                <span className="text-sm font-bold text-[#635BFF]">Stripe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Paystack Option */}
        <div
          className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
            value === 'paystack'
              ? 'border-black bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onChange('paystack')}
        >
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              name="payment-method"
              value="paystack"
              checked={value === 'paystack'}
              onChange={() => onChange('paystack')}
              className="mt-1 h-4 w-4 border-gray-300 text-black focus:ring-black"
            />
            <div className="flex-1">
              <Label className="text-base font-semibold">
                Nigerian/African Cards
              </Label>
              <p className="mt-1 text-sm text-gray-500">
                Pay with local bank cards and mobile money
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-600">Powered by</span>
                <span className="text-sm font-bold text-[#00C3F7]">Paystack</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {value === 'stripe' && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-medium">International Payment</p>
          <p className="mt-1">
            Your payment will be processed in USD via Stripe. Exchange rates apply.
          </p>
        </div>
      )}

      {value === 'paystack' && (
        <div className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">
          <p className="font-medium">Local Payment</p>
          <p className="mt-1">
            Your payment will be processed in NGN via Paystack. Best rates for African cards.
          </p>
        </div>
      )}
    </div>
  )
}
