import type Stripe from 'stripe'

// ============================================================================
// PAYMENT METHOD SELECTION FOR CHECKOUT SESSIONS
// ============================================================================
// The Stripe webhook fulfills orders on checkout.session.completed, so only payment
// methods that are 'paid' at completion may ever be offered. Delayed methods
// (Bacs, SEPA, ACH, bank transfers, vouchers) must never appear.
//
// Card + Klarna are offered through a dashboard Payment Method Configuration so that
// Stripe's dynamic eligibility rules hide Klarna from shoppers whose country, currency
// or amount it can't serve. Because a configuration can be edited in the dashboard
// without a deploy, it is re-verified here: if anything outside the allowlist is
// switched on, we fall back to card only rather than risk showing a delayed method.

// Payment methods that confirm synchronously. Wallets and card brands are card rails.
export const IMMEDIATE_PAYMENT_METHODS: ReadonlySet<string> = new Set([
  'card',
  'cartes_bancaires',
  'jcb',
  'apple_pay',
  'google_pay',
  'klarna',
])

const CARD_ONLY: Pick<Stripe.Checkout.SessionCreateParams, 'payment_method_types'> = {
  payment_method_types: ['card'],
}

const VERIFY_TTL_MS = 5 * 60 * 1000

let verifiedCache: { configId: string; ok: boolean; checkedAt: number } | null = null

/**
 * List the payment methods a configuration would offer that aren't in the allowlist
 */
export function findDisallowedMethods(config: Stripe.PaymentMethodConfiguration): string[] {
  return Object.entries(config)
    .filter(([key, value]) => {
      if (!value || typeof value !== 'object' || !('available' in value)) return false
      return (value as { available: boolean }).available && !IMMEDIATE_PAYMENT_METHODS.has(key)
    })
    .map(([key]) => key)
}

async function isConfigSafe(stripe: Stripe, configId: string): Promise<boolean> {
  if (
    verifiedCache &&
    verifiedCache.configId === configId &&
    Date.now() - verifiedCache.checkedAt < VERIFY_TTL_MS
  ) {
    return verifiedCache.ok
  }

  let ok = false
  try {
    const config = await stripe.paymentMethodConfigurations.retrieve(configId)
    const disallowed = findDisallowedMethods(config)

    if (!config.active) {
      console.error(`[Stripe][PaymentMethods] Configuration ${configId} is not active`)
    } else if (disallowed.length > 0) {
      console.error(
        `[Stripe][PaymentMethods] Configuration ${configId} enables non-immediate methods; falling back to card only`,
        { disallowed }
      )
    } else {
      ok = true
    }
  } catch (error) {
    console.error(`[Stripe][PaymentMethods] Could not retrieve configuration ${configId}:`, error)
  }

  verifiedCache = { configId, ok, checkedAt: Date.now() }
  return ok
}

/**
 * Payment method params for a Checkout Session: the verified configuration when one is
 * set, otherwise an explicit card-only list. Never returns the account's default config.
 */
export async function getPaymentMethodParams(
  stripe: Stripe
): Promise<
  Pick<Stripe.Checkout.SessionCreateParams, 'payment_method_types' | 'payment_method_configuration'>
> {
  const configId = process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION_ID
  if (!configId) {
    console.warn('[Stripe][PaymentMethods] STRIPE_PAYMENT_METHOD_CONFIGURATION_ID not set; offering card only')
    return CARD_ONLY
  }

  return (await isConfigSafe(stripe, configId))
    ? { payment_method_configuration: configId }
    : CARD_ONLY
}

/**
 * Create a Checkout Session with the given payment method params. If that fails while using
 * the configuration, retry once immediately with card only so checkout never breaks.
 */
export async function createSessionWithFallback(
  stripe: Stripe,
  params: Omit<Stripe.Checkout.SessionCreateParams, 'payment_method_types' | 'payment_method_configuration'>,
  paymentMethodParams: Awaited<ReturnType<typeof getPaymentMethodParams>>
): Promise<Stripe.Checkout.Session> {
  try {
    return await stripe.checkout.sessions.create({ ...paymentMethodParams, ...params })
  } catch (error) {
    if (!paymentMethodParams.payment_method_configuration) throw error

    console.error(
      `[Stripe][PaymentMethods] Session creation failed with configuration ${paymentMethodParams.payment_method_configuration}; retrying with card only:`,
      error
    )
    return await stripe.checkout.sessions.create({ ...CARD_ONLY, ...params })
  }
}

/** Test-only: clear the verification cache */
export function resetPaymentMethodCache() {
  verifiedCache = null
}
