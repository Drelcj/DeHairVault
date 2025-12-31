import { RotateCcw, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"

export function ReturnPolicy() {
  return (
    <article id="returns" className="scroll-mt-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--rose-gold)]/10 flex items-center justify-center">
          <RotateCcw className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">Return &amp; Exchange Policy</h2>
          <p className="text-sm text-muted-foreground">Last updated: December 2024</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed mb-8">
          At Dehair Vault, we stand behind the quality of our premium hair extensions. We offer refunds and exchanges 
          when products do not perform as advertised or when incorrect items are received. Please review our guidelines below.
        </p>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-[var(--gold)]/10 to-[var(--rose-gold)]/10 border border-[var(--gold)]/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-xl font-medium text-foreground m-0">3-Day Complaint Window</h3>
          </div>
          <p className="text-muted-foreground">
            All complaints regarding returns or exchanges must be submitted within <strong className="text-foreground">3 days of receiving your order</strong>. 
            Please contact our support team immediately if you encounter any issues with your purchase.
          </p>
        </div>

        {/* Eligible / Not Eligible */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h4 className="font-medium text-foreground m-0">Eligible for Refund/Exchange</h4>
            </div>
            <ul className="list-none p-0 m-0 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                Hair fails to perform as advertised regarding bleaching capabilities
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                Hair does not meet the stated lifespan under proper care
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                Product received is different from what was ordered
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                Wrong texture, length, or grade received
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                Defective or damaged products upon arrival
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h4 className="font-medium text-foreground m-0">Not Eligible for Refund/Exchange</h4>
            </div>
            <ul className="list-none p-0 m-0 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                Products that have been tampered with or altered
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                Items not returned in original condition as sent
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                Complaints made after 3 days of receipt
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                Damage caused by improper care or styling
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                Custom pre-orders (wholesale bundles and wigs)
              </li>
            </ul>
          </div>
        </div>

        {/* Return Conditions */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-accent" />
            <h4 className="font-medium text-foreground m-0">Return Conditions</h4>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              To be eligible for a return or exchange, the following conditions must be met:
            </p>
            <ul className="list-none p-0 m-0 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Product must not be tampered with in any way</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Product must be returned exactly as it was sent</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Original packaging and tags must be intact</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Photo or video evidence of the issue must be provided</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Process */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-accent" />
            <h4 className="font-medium text-foreground m-0">How to Initiate a Return or Exchange</h4>
          </div>
          <ol className="list-none p-0 m-0 space-y-4 text-muted-foreground">
            <li className="flex gap-4">
              <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm flex-shrink-0">
                1
              </span>
              <span>
                Contact our support team at support@dehairvault.com within <strong className="text-foreground">3 days of receiving your order</strong> with your order number and detailed description of the issue.
              </span>
            </li>
            <li className="flex gap-4">
              <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm flex-shrink-0">
                2
              </span>
              <span>Provide clear photos or videos showing the issue with your hair product.</span>
            </li>
            <li className="flex gap-4">
              <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm flex-shrink-0">
                3
              </span>
              <span>Our team will review your claim and respond within 24-48 hours.</span>
            </li>
            <li className="flex gap-4">
              <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm flex-shrink-0">
                4
              </span>
              <span>If approved, you will receive a Return Merchandise Authorization (RMA) number and shipping instructions.</span>
            </li>
            <li className="flex gap-4">
              <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm flex-shrink-0">
                5
              </span>
              <span>Pack the item securely in its original packaging and ship within 7 days of receiving your RMA.</span>
            </li>
            <li className="flex gap-4">
              <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm flex-shrink-0">
                6
              </span>
              <span>Refund or exchange processed within 5-7 business days after we receive and inspect your return.</span>
            </li>
          </ol>
        </div>
      </div>
    </article>
  )
}
