"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    setEmail("")
  }

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-rose-gold opacity-90" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-champagne/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-foreground/20 mb-6">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>

          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-medium text-primary-foreground mb-4">
            Join the Vault
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Subscribe for exclusive access to new collections, VIP discounts, and luxury hair care tips.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-14 px-6 rounded-full bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-primary-foreground"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium group"
            >
              Subscribe
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <p className="text-primary-foreground/60 text-sm mt-4">Join 10,000+ women who trust Dehair Vault</p>
        </div>
      </div>
    </section>
  )
}
