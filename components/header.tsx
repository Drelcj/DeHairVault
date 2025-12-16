"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, User, Menu, X, Moon, Sun, LogOut, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type HeaderProps = {
  isAuthed?: boolean
  isAdmin?: boolean
  name?: string | null
}

export function Header({ isAuthed = false, isAdmin = false, name }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isSigningOut, startTransition] = useTransition()
  const router = useRouter()

  const handleLogout = () => {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.refresh()
      router.push('/')
    })
  }

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent",
      )}
    >
      <nav className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl font-medium tracking-tight text-foreground">
              Dehair
            </span>
            <span className="font-[family-name:var(--font-playfair)] text-2xl lg:text-3xl font-light italic text-accent">
              Vault
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              href="/shop"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
            >
              Contact Us
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            {mounted && (
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-secondary">
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-gold" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {!isAuthed ? (
              <Button asChild variant="ghost" size="icon" className="hidden md:flex rounded-full hover:bg-secondary">
                <Link href="/login">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Link>
              </Button>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                    <Link href="/admin">
                      <Shield className="h-5 w-5" />
                      <span className="sr-only">Admin</span>
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-secondary"
                  onClick={handleLogout}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? 'Signing out...' : name ? `Hi, ${name.split(' ')[0]}` : 'Profile'}
                </Button>
              </div>
            )}

            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
              <span className="sr-only">Cart</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border">
            <div className="container px-6 py-8 flex flex-col gap-6">
              <Link
                href="/shop"
                className="text-lg font-medium text-foreground hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium text-foreground hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-lg font-medium text-foreground hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              {!isAuthed ? (
                <Link
                  href="/login"
                  className="text-lg font-medium text-foreground hover:text-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-lg font-medium text-foreground hover:text-accent transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    className="flex items-center gap-2 text-left text-lg font-medium text-foreground hover:text-accent transition-colors"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    disabled={isSigningOut}
                  >
                    <LogOut className="h-5 w-5" />
                    {isSigningOut ? 'Signing out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
