import { Mail, Phone, Clock, MapPin } from "lucide-react"

export function ContactInfo() {
  return (
    <div className="flex flex-col gap-8">
      {/* Service Promise */}
      <div className="relative bg-gradient-to-br from-[var(--gold)]/10 via-accent/5 to-[var(--rose-gold)]/10 rounded-2xl p-8 lg:p-10 border border-[var(--gold)]/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--gold)]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <h3 className="font-serif text-2xl lg:text-3xl font-medium text-foreground mb-4 relative z-10">
          Dedicated to Excellence
        </h3>
        <p className="text-muted-foreground leading-relaxed relative z-10">
          We are dedicated to delivering excellence. Our team typically responds within 24 hours. Your satisfaction and
          confidence in our products is our highest priority.
        </p>
      </div>

      {/* Contact Details */}
      <div className="bg-card rounded-2xl border border-border p-8 lg:p-10">
        <h3 className="font-serif text-xl font-medium text-foreground mb-6">Contact Information</h3>

        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email Us</p>
              <a
                href="mailto:support@dehairvault.com"
                className="text-foreground font-medium hover:text-accent transition-colors"
              >
                support@dehairvault.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Call Us</p>
              <a href="tel:+447943855973" className="text-foreground font-medium hover:text-accent transition-colors">
                +44 (0) 7943-855973
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Hours</p>
              <p className="text-foreground font-medium">Mon - Fri: 9AM - 6PM EST</p>
              <p className="text-muted-foreground text-sm">Weekend support available</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="text-foreground font-medium">Calvary Road, Colchester</p>
              <p className="text-muted-foreground text-sm">United Kingdom</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Prompt */}
      <div className="bg-secondary/50 rounded-2xl p-8 text-center">
        <h4 className="font-serif text-lg font-medium text-foreground mb-2">Have Questions?</h4>
        <p className="text-muted-foreground text-sm mb-4">
          Check out our frequently asked questions for quick answers.
        </p>
        <a
          href="/faq"
          className="inline-flex items-center text-sm font-medium text-accent hover:underline underline-offset-4"
        >
          View FAQ
          <span className="ml-1">→</span>
        </a>
      </div>
    </div>
  )
}
