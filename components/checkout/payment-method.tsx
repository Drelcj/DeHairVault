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
        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-medium text-foreground">Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred payment method
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Stripe Option */}
        <div
          className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
            value === 'stripe'
              ? 'border-accent bg-accent/5 shadow-md'
              : 'border-border hover:border-accent/50'
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
              className="mt-1 h-4 w-4 border-border text-accent focus:ring-accent"
            />
            <div className="flex-1">
              <Label className="text-base font-semibold text-foreground cursor-pointer">
                International Cards
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Pay with Visa, Mastercard, or American Express
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs font-medium text-muted-foreground">Powered by</span>
                <span className="text-sm font-bold text-[#635BFF]">Stripe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Paystack Option */}
        <div
          className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
            value === 'paystack'
              ? 'border-accent bg-accent/5 shadow-md'
              : 'border-border hover:border-accent/50'
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
              className="mt-1 h-4 w-4 border-border text-accent focus:ring-accent"
            />
            <div className="flex-1">
              <Label className="text-base font-semibold text-foreground cursor-pointer">
                Nigerian/African Cards
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Pay with local bank cards and mobile money
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs font-medium text-muted-foreground">Powered by</span>
                <span className="text-sm font-bold text-[#00C3F7]">Paystack</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {value === 'stripe' && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium">International Payment</p>
          <p className="mt-1">
            Your payment will be processed in USD via Stripe. Exchange rates apply.
          </p>
        </div>
      )}

      {value === 'paystack' && (
        <div className="rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 p-3 text-sm text-teal-800 dark:text-teal-200">
          <p className="font-medium">Local Payment</p>
          <p className="mt-1">
            Your payment will be processed in NGN via Paystack. Best rates for African cards.
          </p>
        </div>
      )}
    </div>
  )
}
