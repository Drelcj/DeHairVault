import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
// SECURITY: Whitelist allowed folder names to prevent path traversal
const ALLOWED_FOLDERS = ['products', 'categories', 'banners', 'avatars']

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.')
  }

  return { cloudName, apiKey, apiSecret }
}

// Signs a Cloudinary upload request using SHA-1 of sorted params + API secret
function signUpload(params: Record<string, string>, apiSecret: string): string {
  const sortedString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  return crypto.createHash('sha1').update(sortedString + apiSecret).digest('hex')
}

// Inserts f_auto,q_auto into a Cloudinary secure_url
// Input:  https://res.cloudinary.com/cloud/image/upload/v123/products/foo.jpg
// Output: https://res.cloudinary.com/cloud/image/upload/f_auto,q_auto/v123/products/foo.jpg
function applyTransforms(url: string): string {
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Role check — use service client to bypass RLS on users table (same pattern as session.ts)
    const serviceClient = createServiceClient()
    const { data: roleRow } = await serviceClient
      .from('users')
      .select('role')
      .eq('id', auth.user.id)
      .single<{ role: string | null }>()

    if (!roleRow || (roleRow.role !== 'ADMIN' && roleRow.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate Cloudinary config up front
    let config: ReturnType<typeof getCloudinaryConfig>
    try {
      config = getCloudinaryConfig()
    } catch (e: any) {
      console.error('[Upload] Cloudinary config error:', e.message)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const rawFolder = (formData.get('folder') as string) || 'products'

    // SECURITY: Validate folder against whitelist
    const folder = ALLOWED_FOLDERS.includes(rawFolder) ? rawFolder : 'products'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    const { cloudName, apiKey, apiSecret } = config
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const cloudinaryFolder = `dehairvault/${folder}`

    const signParams: Record<string, string> = {
      folder: cloudinaryFolder,
      timestamp,
    }
    const signature = signUpload(signParams, apiSecret)

    // Build the multipart request for Cloudinary
    const uploadForm = new FormData()
    uploadForm.append('file', new Blob([await file.arrayBuffer()], { type: file.type }), file.name)
    uploadForm.append('api_key', apiKey)
    uploadForm.append('timestamp', timestamp)
    uploadForm.append('signature', signature)
    uploadForm.append('folder', cloudinaryFolder)

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadForm }
    )

    const result = await cloudinaryRes.json()

    if (!cloudinaryRes.ok) {
      const msg = result?.error?.message || 'Cloudinary upload failed'
      console.error('[Upload] Cloudinary error:', msg)
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // Apply f_auto,q_auto transforms to the returned URL
    const optimisedUrl = applyTransforms(result.secure_url as string)

    return NextResponse.json({
      success: true,
      url: optimisedUrl,
      publicId: result.public_id,
    })
  } catch (error: any) {
    console.error('[Upload] Unexpected error:', error?.message || error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
