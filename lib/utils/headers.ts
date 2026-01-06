/**
 * HTTP header utilities
 * These are pure utility functions that can be used anywhere
 */

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
