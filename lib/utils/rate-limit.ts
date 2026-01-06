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

// Note: setInterval doesn't work well in serverless environments
// The store will naturally be cleared when the function instance is recycled
// For production, use Redis/Upstash with TTL

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
  
  // Clean up expired entries for this key
  const existingEntry = rateLimitStore.get(key)
  if (existingEntry && existingEntry.resetTime < now) {
    rateLimitStore.delete(key)
  }
  
  let entry = rateLimitStore.get(key)
  
  if (!entry) {
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
