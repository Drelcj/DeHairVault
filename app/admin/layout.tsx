import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getSessionUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSessionUser()
  const role = session?.profile?.role
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

  if (!isAdmin) {
    return redirect('/login?redirectTo=/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="font-semibold">DeHair Vault Admin</Link>
          <nav className="flex items-center gap-3 text-sm">
            <NavLink href="/admin">Dashboard</NavLink>
            <NavLink href="/admin/products">Products</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">View Storefront</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const isActive = false // simple placeholder; could be upgraded with usePathname
  return (
    <Link
      href={href}
      className={cn(
        'rounded-md px-3 py-2 transition-colors hover:bg-gray-100',
        isActive && 'bg-gray-100 font-semibold'
      )}
    >
      {children}
    </Link>
  )
}
