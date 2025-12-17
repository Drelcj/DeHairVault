import { Header } from '@/components/header'
import { getSessionUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Server component wrapper to hydrate Header with session/role info
export async function HeaderShell() {
  const session = await getSessionUser()
  const role = session?.profile?.role ?? null
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

  return (
    <Header
      isAuthed={Boolean(session?.user)}
      isAdmin={isAdmin}
      role={role}
      name={session?.profile?.full_name ?? session?.user?.email ?? null}
    />
  )
}
