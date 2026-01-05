/**
 * Environment variable validation
 * SECURITY: Ensures all required secrets are configured before the app starts
 * 
 * Import this file in your app's entry point to validate env vars at startup
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

const requiredForPayments = [
  'PAYSTACK_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const

const requiredForProduction = [
  'NEXT_PUBLIC_APP_URL',
] as const

interface EnvValidationResult {
  isValid: boolean
  missing: string[]
  warnings: string[]
}

export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = []
  const warnings: string[] = []
  const isProduction = process.env.NODE_ENV === 'production'

  // Check required env vars
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  // Check payment env vars (warn in dev, error in prod)
  for (const envVar of requiredForPayments) {
    if (!process.env[envVar]) {
      if (isProduction) {
        missing.push(envVar)
      } else {
        warnings.push(`${envVar} is not set. Payment features will not work.`)
      }
    }
  }

  // Check production-only env vars
  if (isProduction) {
    for (const envVar of requiredForProduction) {
      if (!process.env[envVar]) {
        missing.push(envVar)
      }
    }
  }

  // Security warnings
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('example') ||
      process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('placeholder')) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY appears to be a placeholder value')
  }

  if (isProduction && process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
    warnings.push('NEXT_PUBLIC_APP_URL is set to localhost in production')
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Validate and log results at startup
 * Call this in instrumentation.ts or a server-side initialization file
 */
export function validateEnvOnStartup(): void {
  const result = validateEnvironment()
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:')
    result.warnings.forEach(w => console.warn(`   - ${w}`))
  }
  
  if (!result.isValid) {
    console.error('❌ Missing required environment variables:')
    result.missing.forEach(m => console.error(`   - ${m}`))
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variables: ${result.missing.join(', ')}`
      )
    }
  } else {
    console.log('✅ Environment validation passed')
  }
}
