'use server'

/**
 * Simple in-memory rate limiter for server actions
 * For production, consider using Redis or Upstash Rate Limit
 * 
 * SECURITY: Protects against brute-force attacks on authentication endpoints
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean every minute

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Check rate limit for a given identifier (e.g., IP address, user ID)
 * @param identifier - Unique identifier for the rate limit (e.g., IP, email)
 * @param options - Rate limit configuration
 * @returns Whether the request is allowed
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 5, windowMs: 60000 }
): Promise<RateLimitResult> {
  const now = Date.now()
  const key = `ratelimit:${identifier}`
  
  let entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + options.windowMs,
    }
    rateLimitStore.set(key, entry)
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetTime: entry.resetTime,
    }
  }
  
  if (entry.count >= options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }
  
  entry.count++
  rateLimitStore.set(key, entry)
  
  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and standard proxies
 */
export function getClientIP(headers: Headers): string {
  // Check various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP (client IP) from the chain
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }
  
  // Vercel-specific
  const vercelIP = headers.get('x-vercel-forwarded-for')
  if (vercelIP) {
    return vercelIP.split(',')[0].trim()
  }
  
  // Cloudflare
  const cfIP = headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP.trim()
  }
  
  return 'unknown'
}
