"use client"

import { useState, useEffect } from "react"
import { FileText, Truck, RotateCcw, Shield, ScrollText } from "lucide-react"
import { cn } from "@/lib/utils"

const policyLinks = [
  {
    id: "shipping",
    label: "Shipping Policy",
    icon: Truck,
  },
  {
    id: "returns",
    label: "Return Policy",
    icon: RotateCcw,
  },
  {
    id: "terms",
    label: "Terms & Conditions",
    icon: ScrollText,
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    icon: Shield,
  },
]

export function PoliciesSidebar() {
  const [activeSection, setActiveSection] = useState("shipping")

  useEffect(() => {
    const handleScroll = () => {
      const sections = policyLinks.map((link) => document.getElementById(link.id))
      const scrollPosition = window.scrollY + 200

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(policyLinks[i].id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 120
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      })
    }
  }

  return (
    <nav className="lg:sticky lg:top-28">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <FileText className="h-5 w-5 text-accent" />
          <h2 className="font-serif text-lg font-medium text-foreground">Quick Navigation</h2>
        </div>

        <ul className="space-y-2">
          {policyLinks.map((link) => {
            const Icon = link.icon
            const isActive = activeSection === link.id

            return (
              <li key={link.id}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-[var(--gold)]/20 to-[var(--rose-gold)]/10 text-foreground border border-[var(--gold)]/30"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors",
                      isActive ? "text-accent" : "text-muted-foreground",
                    )}
                  />
                  <span className="text-sm font-medium">{link.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Help Card */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="bg-gradient-to-br from-[var(--champagne)] to-[var(--cream)] dark:from-[var(--gold)]/10 dark:to-transparent rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-1">Need Help?</p>
            <p className="text-xs text-muted-foreground mb-3">Our team is here to assist you with any questions.</p>
            <a href="/contact" className="inline-flex text-xs font-medium text-accent hover:underline">
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
