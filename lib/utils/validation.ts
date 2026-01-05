/**
 * Password validation utilities
 * SECURITY: Enforces strong password policy
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] }
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password1', '12345678', 'qwerty123', 'letmein',
    'welcome1', 'monkey123', 'dragon12', 'master12', 'hello123'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}
