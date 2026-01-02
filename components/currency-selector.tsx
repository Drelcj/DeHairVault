'use client'

import { useCurrency, type SupportedCurrency } from '@/contexts/currency-context'
import { Globe } from 'lucide-react'

const CURRENCY_OPTIONS: { code: SupportedCurrency; label: string; flag: string }[] = [
  { code: 'NGN', label: 'Naira', flag: '🇳🇬' },
  { code: 'USD', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'GBP', label: 'Pound', flag: '🇬🇧' },
  { code: 'EUR', label: 'Euro', flag: '🇪🇺' },
  { code: 'CAD', label: 'CAD', flag: '🇨🇦' },
  { code: 'GHS', label: 'Cedi', flag: '🇬🇭' },
]

interface CurrencySelectorProps {
  variant?: 'default' | 'compact' | 'minimal'
  className?: string
}

export function CurrencySelector({ variant = 'default', className = '' }: CurrencySelectorProps) {
  const { currency, setCurrency, isLoading } = useCurrency()

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Globe className="h-4 w-4 animate-pulse" />
        <span className="text-sm">...</span>
      </div>
    )
  }

  const currentOption = CURRENCY_OPTIONS.find(opt => opt.code === currency)

  if (variant === 'minimal') {
    return (
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
        className={`bg-transparent border-none text-sm font-medium text-foreground cursor-pointer focus:outline-none focus:ring-0 ${className}`}
        aria-label="Select currency"
      >
        {CURRENCY_OPTIONS.map((option) => (
          <option key={option.code} value={option.code} className="bg-background text-foreground">
            {option.flag} {option.code}
          </option>
        ))}
      </select>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
          className="appearance-none bg-secondary/50 hover:bg-secondary border border-border rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
          aria-label="Select currency"
        >
          {CURRENCY_OPTIONS.map((option) => (
            <option key={option.code} value={option.code} className="bg-background text-foreground">
              {option.flag} {option.code}
            </option>
          ))}
        </select>
        <Globe className="absolute right-2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    )
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
        className="appearance-none bg-secondary/50 hover:bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors min-w-[140px]"
        aria-label="Select currency"
      >
        {CURRENCY_OPTIONS.map((option) => (
          <option key={option.code} value={option.code} className="bg-background text-foreground">
            {option.flag} {option.code} - {option.label}
          </option>
        ))}
      </select>
      <Globe className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}
