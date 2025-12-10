"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, CheckCircle } from "lucide-react"

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-border">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-accent" />
        </div>
        <h3 className="font-serif text-2xl font-medium text-foreground mb-3">Message Sent</h3>
        <p className="text-muted-foreground mb-6">Thank you for reaching out. Our team will respond within 24 hours.</p>
        <Button
          variant="outline"
          onClick={() => setIsSubmitted(false)}
          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-8 lg:p-10">
      <h2 className="font-serif text-2xl lg:text-3xl font-medium text-foreground mb-2">Send Us a Message</h2>
      <p className="text-muted-foreground mb-8">Fill out the form below and we&apos;ll get back to you shortly.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            required
            className="h-12 bg-background border-border focus:border-accent focus:ring-accent/20 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            required
            className="h-12 bg-background border-border focus:border-accent focus:ring-accent/20 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="subject" className="text-sm font-medium text-foreground">
            Subject
          </Label>
          <Input
            id="subject"
            type="text"
            placeholder="How can we help?"
            required
            className="h-12 bg-background border-border focus:border-accent focus:ring-accent/20 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="message" className="text-sm font-medium text-foreground">
            Message
          </Label>
          <Textarea
            id="message"
            placeholder="Tell us more about your inquiry..."
            rows={5}
            required
            className="bg-background border-border focus:border-accent focus:ring-accent/20 rounded-lg resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 mt-2 bg-gradient-to-r from-[var(--gold)] via-accent to-[var(--rose-gold)] text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send Message
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
