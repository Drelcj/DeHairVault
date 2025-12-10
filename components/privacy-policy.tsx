import { Shield, Lock, Eye, Database, Mail } from "lucide-react"

export function PrivacyPolicy() {
  return (
    <article id="privacy" className="scroll-mt-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--rose-gold)]/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">Privacy Policy</h2>
          <p className="text-sm text-muted-foreground">Last updated: December 2024</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed mb-8">
          At Dehair Vault, we are committed to protecting your privacy. This policy outlines how we collect, use, and
          safeguard your personal information when you visit our website or make a purchase.
        </p>

        <div className="grid gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-medium text-foreground m-0">Information We Collect</h3>
            </div>
            <ul className="list-none p-0 m-0 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Personal identification (name, email, phone number)
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Shipping and billing addresses
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Payment information (processed securely through our payment providers)
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Order history and preferences
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Website usage data and cookies
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-medium text-foreground m-0">How We Use Your Information</h3>
            </div>
            <ul className="list-none p-0 m-0 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Process and fulfill your orders
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Send order confirmations and shipping updates
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Provide customer support
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Send promotional emails (with your consent)
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Improve our website and services
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-medium text-foreground m-0">Data Security</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your personal information. All payment
              transactions are encrypted using SSL technology. We do not store your complete credit card information on
              our servers.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-medium text-foreground m-0">Your Rights</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              You have the right to access, correct, or delete your personal information at any time. To exercise these
              rights or if you have any questions about our privacy practices, please contact us.
            </p>
            <a href="/contact" className="inline-flex items-center text-sm font-medium text-accent hover:underline">
              Contact our Privacy Team →
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
