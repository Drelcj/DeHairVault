import { Header } from '@/components/header'
import { getSessionUser } from '@/lib/auth/session'

// Server component wrapper to hydrate Header with session/role info
export async function HeaderShell() {
  const session = await getSessionUser()
  const role = session?.profile?.role
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

  return (
    <Header
      isAuthed={Boolean(session?.user)}
      isAdmin={isAdmin}
      name={session?.profile?.full_name ?? session?.user?.email ?? null}
    />
  )
}
