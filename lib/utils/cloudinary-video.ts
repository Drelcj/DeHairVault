/**
 * Cloudinary Video URL Transformer
 * 
 * Converts Cloudinary video URLs to use web-compatible formats.
 * The .mov format (Apple QuickTime/HEVC) isn't supported by most browsers,
 * so we transform URLs to use f_auto (auto-format) or explicit mp4.
 */

/**
 * Transforms a Cloudinary video URL to use a web-compatible format.
 * 
 * Cloudinary URL structure:
 * https://res.cloudinary.com/{cloud_name}/video/upload/{transformations}/{public_id}.{extension}
 * 
 * This function:
 * 1. Detects if it's a Cloudinary URL
 * 2. Adds f_auto transformation for automatic format selection
 * 3. Falls back to changing extension to .mp4 if needed
 * 
 * @param url - The original video URL
 * @returns The transformed URL with web-compatible format
 */
export function getWebCompatibleVideoUrl(url: string): string {
  if (!url) return url
  
  // Check if it's a Cloudinary URL
  const isCloudinary = url.includes('cloudinary.com') || url.includes('res.cloudinary')
  
  if (!isCloudinary) {
    // For non-Cloudinary URLs, just return as-is
    // The browser will handle format support
    return url
  }
  
  // Check if it already has f_auto transformation
  if (url.includes('f_auto') || url.includes('f_mp4') || url.includes('f_webm')) {
    return url
  }
  
  // Parse Cloudinary URL and add f_auto transformation
  // URL format: https://res.cloudinary.com/{cloud}/video/upload/{existing_transforms}/{public_id}.{ext}
  
  try {
    const uploadIndex = url.indexOf('/upload/')
    
    if (uploadIndex !== -1) {
      // Insert f_auto,vc_auto (auto format + auto video codec) after /upload/
      const beforeUpload = url.substring(0, uploadIndex + 8) // includes '/upload/'
      const afterUpload = url.substring(uploadIndex + 8)
      
      // Check if there are already transformations
      // Transformations come before the public_id and don't start with 'v' followed by numbers
      const parts = afterUpload.split('/')
      
      // Add our transformations at the start
      const transformations = 'f_auto,vc_auto,q_auto'
      
      // Reconstruct URL with transformations
      return `${beforeUpload}${transformations}/${afterUpload}`
    }
    
    // Fallback: Replace extension with .mp4
    return url.replace(/\.(mov|avi|wmv|flv|m4v)(\?.*)?$/i, '.mp4$2')
    
  } catch {
    // If parsing fails, try simple extension replacement
    return url.replace(/\.(mov|avi|wmv|flv|m4v)(\?.*)?$/i, '.mp4$2')
  }
}

/**
 * Checks if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false
  
  // Check for common video file extensions
  const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg', '.avi', '.m4v', '.mkv']
  const hasVideoExtension = videoExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  )
  
  // Check for Cloudinary video URLs
  const isCloudinaryVideo = url.includes('cloudinary.com') && 
    (url.includes('/video/') || hasVideoExtension)
  
  return hasVideoExtension || isCloudinaryVideo
}

/**
 * Gets the appropriate MIME type for a video URL
 * After transformation, most videos will be mp4 or webm
 */
export function getVideoMimeType(url: string): string {
  // After f_auto transformation, Cloudinary serves the best format
  // But we can hint at the expected type
  if (url.includes('.webm') || url.includes('f_webm')) return 'video/webm'
  if (url.includes('.ogg')) return 'video/ogg'
  // Default to mp4 as it's the most widely supported
  return 'video/mp4'
}
