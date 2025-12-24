import { createClient, createServiceClient } from '@/lib/supabase/server'

const SUPABASE_ENV_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const
const MISSING_SUPABASE_ENV = SUPABASE_ENV_KEYS.filter((key) => !process.env[key])
const HAS_SUPABASE_ENV = MISSING_SUPABASE_ENV.length === 0
const IS_DEV = process.env.NODE_ENV !== 'production'

export type SessionProfile = {
  id: string
  role: string | null
  full_name: string | null
  email: string | null
}

export type SessionUser = {
  user: NonNullable<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>['data']['user']
  profile: SessionProfile | null
}

// Server-side lookup that joins auth user with public.users profile (includes role)
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Use service client to bypass RLS for profile lookup
    const serviceClient = createServiceClient()
    const { data: profile } = await serviceClient
      .from('users')
      .select('id, role, full_name, email')
      .eq('id', user.id)
      .single()

    const metadataRole =
      (user.user_metadata as { role?: string | null })?.role ??
      (user.app_metadata as { role?: string | null })?.role ??
      null

    const resolvedRole = profile?.role ?? metadataRole ?? null
    const resolvedFullName = profile?.full_name ?? (user.user_metadata as { full_name?: string | null })?.full_name ?? null

    // Self-heal: if profile row is missing or role is empty, upsert a minimal profile using available metadata
    let ensuredProfile = profile ?? null
    if (!profile || !profile.role) {
      const fallbackRole = resolvedRole ?? 'CUSTOMER'
      const { data: upsertedProfile } = await serviceClient
        .from('users')
        .upsert(
          {
            id: user.id,
            email: user.email ?? null,
            full_name: resolvedFullName,
            role: fallbackRole,
            preferred_currency: 'NGN',
          },
          { onConflict: 'id' },
        )
        .select('id, role, full_name, email')
        .single()

      ensuredProfile = upsertedProfile ?? profile ?? null
    }

    return {
      user,
      profile: ensuredProfile
        ? {
            id: ensuredProfile.id,
            role: ensuredProfile.role ?? resolvedRole,
            full_name: ensuredProfile.full_name ?? resolvedFullName,
            email: ensuredProfile.email ?? user.email ?? null,
          }
        : {
            id: user.id,
            role: resolvedRole,
            full_name: resolvedFullName,
            email: user.email ?? null,
          },
    }
  } catch (error) {
    if (!HAS_SUPABASE_ENV) {
      if (IS_DEV) {
        console.warn(`Supabase env vars missing (${MISSING_SUPABASE_ENV.join(', ')}); skipping session lookup.`)
      }
    } else if (IS_DEV) {
      console.error('Failed to fetch session user', error)
    }
    return null
  }
}
