import { ScrollText } from "lucide-react"

export function TermsConditions() {
  return (
    <article id="terms" className="scroll-mt-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--rose-gold)]/10 flex items-center justify-center">
          <ScrollText className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">Terms & Conditions</h2>
          <p className="text-sm text-muted-foreground">Last updated: December 2024</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground leading-relaxed">
          Welcome to Dehair Vault. By accessing and using our website and services, you agree to be bound by these Terms
          and Conditions. Please read them carefully.
        </p>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg font-medium text-foreground mb-4">1. General Terms</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            By placing an order through our website, you warrant that you are at least 18 years of age and possess the
            legal authority to enter into a binding contract. All information provided during the ordering process must
            be accurate and complete.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg font-medium text-foreground mb-4">2. Product Information</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We strive to display our products as accurately as possible. However, colors may vary slightly due to
            monitor settings and photography lighting. All product descriptions, specifications, and prices are subject
            to change without notice.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg font-medium text-foreground mb-4">3. Intellectual Property</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            All content on this website, including text, graphics, logos, images, and software, is the property of
            Dehair Vault and is protected by intellectual property laws. Unauthorized use or reproduction is prohibited.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg font-medium text-foreground mb-4">4. Limitation of Liability</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Dehair Vault shall not be liable for any indirect, incidental, special, or consequential damages arising
            from the use of our products or services. Our total liability shall not exceed the amount paid for the
            specific product in question.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg font-medium text-foreground mb-4">5. Governing Law</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            These terms shall be governed by and construed in accordance with the laws of the United States. Any
            disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in our
            principal place of business.
          </p>
        </div>
      </div>
    </article>
  )
}
