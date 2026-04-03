"use client"

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  RotateCcw,
  Boxes,
  ChevronRight,
  Store,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'

type AdminSidebarProps = {
  userName?: string | null
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/returns', label: 'Returns', icon: RotateCcw },
]

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.refresh()
      router.push('/')
    })
  }

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-sm">DH</span>
          </div>
          <span className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-foreground">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-4 space-y-2">
        <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setIsOpen(false)}>
          <Link href="/shop">
            <Store className="h-4 w-4" />
            View Storefront
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setIsOpen(false)
            handleLogout()
          }}
          disabled={isPending}
        >
          <LogOut className="h-4 w-4" />
          {isPending ? 'Signing out...' : 'Sign Out'}
        </Button>
        {userName && (
          <p className="px-2 text-xs text-muted-foreground truncate">
            Signed in as {userName}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-full lg:w-64 border-r border-border bg-card">
        {renderSidebarContent()}
      </aside>

      {/* Mobile drawer */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="fixed left-4 top-4 z-50 rounded-md border border-border bg-card p-2 text-muted-foreground shadow-md hover:bg-muted hover:text-foreground"
              aria-label="Open admin menu"
            >
              <span className="sr-only">Open admin menu</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="lg:hidden p-0"> 
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
