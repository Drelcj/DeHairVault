import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSessionUser()
  const role = session?.profile?.role
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

  if (!isAdmin) {
    return redirect('/login?redirectTo=/admin')
  }

  const userName = session?.profile?.full_name || session?.profile?.email || session?.user?.email

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar userName={userName} />
      <div className="pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex-1">
            {/* Breadcrumb or page title can go here */}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-NG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
