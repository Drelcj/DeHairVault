import { Shield, Lock, Eye, Database, Mail, Globe, UserCheck, Trash2 } from "lucide-react"

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
          At Dehair Vault, we are committed to protecting your privacy and personal information. This policy outlines 
          how we collect, use, store, and safeguard your data when you visit our website or make a purchase. By using 
          our services, you consent to the practices described in this policy.
        </p>

        <div className="grid gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-medium text-foreground m-0">Information We Collect</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              We collect information necessary to process your orders and provide you with the best possible service:
            </p>
            <ul className="list-none p-0 m-0 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Personal identification (full name, email address, phone number)
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Shipping and billing addresses for order fulfillment
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Payment information (processed securely through our payment providers - we do not store card details)
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Order history and product preferences
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Communication records (emails, support tickets, inquiries)
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Website usage data and cookies for site functionality
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-medium text-foreground m-0">How We Use Your Information</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your information is used solely for legitimate business purposes:
            </p>
            <ul className="list-none p-0 m-0 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Process and fulfill your orders, including pre-orders and wholesale orders
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Send order confirmations, shipping updates, and delivery notifications
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Coordinate with DHL and local logistics partners for delivery
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Provide customer support and handle return/exchange requests
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Send promotional emails and updates (only with your consent)
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Improve our website, products, and services
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Comply with legal obligations and prevent fraud
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-medium text-foreground m-0">Information Sharing</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              We do not sell, trade, or rent your personal information. We only share your data with:
            </p>
            <ul className="list-none p-0 m-0 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Shipping Partners:</strong> DHL and local logistics providers (for delivery purposes only)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Payment Processors:</strong> Secure payment gateways to process your transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Legal Authorities:</strong> When required by law or to protect our rights</span>
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
              our servers - all payment data is processed securely through our trusted payment providers. Our website 
              is regularly monitored for security vulnerabilities, and we maintain strict access controls to protect 
              your data.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-medium text-foreground m-0">Your Rights</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-none p-0 m-0 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Correction:</strong> Request correction of inaccurate or incomplete data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing communications at any time</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-medium text-foreground m-0">Data Retention</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
              policy, including order fulfillment, customer service, and legal compliance. Order records are kept for 
              a minimum of 7 years for accounting and legal purposes. You may request deletion of your account and 
              personal data at any time, subject to our legal obligations.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-serif text-lg font-medium text-foreground mb-4">Cookies &amp; Tracking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our website uses cookies to enhance your browsing experience, remember your preferences, and analyze 
              site traffic. You can control cookie settings through your browser preferences. Disabling cookies may 
              affect some website functionality, including the shopping cart and checkout process.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-serif text-lg font-medium text-foreground mb-4">Policy Updates</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal 
              requirements. Any significant changes will be posted on this page with an updated revision date. 
              We encourage you to review this policy periodically.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-medium text-foreground m-0">Contact Us</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, wish to exercise your rights, or have concerns about 
              how we handle your data, please contact us:
            </p>
            <div className="bg-secondary/50 rounded-xl p-4 text-sm">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Email:</strong> privacy@dehairvault.com
              </p>
              <p className="text-muted-foreground mt-2">
                <strong className="text-foreground">Response Time:</strong> We aim to respond within 48 hours
              </p>
            </div>
            <a href="/contact" className="inline-flex items-center text-sm font-medium text-accent hover:underline mt-4">
              Contact our Privacy Team →
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
