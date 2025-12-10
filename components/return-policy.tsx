import { RotateCcw, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function ReturnPolicy() {
  return (
    <article id="returns" className="scroll-mt-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--rose-gold)]/10 flex items-center justify-center">
          <RotateCcw className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">Return Policy</h2>
          <p className="text-sm text-muted-foreground">Last updated: December 2024</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed mb-8">
          Your satisfaction is our priority. We offer a comprehensive return policy that reflects our confidence in the
          quality of our luxury hair extensions. Please review our guidelines below.
        </p>

        {/* Return Window */}
        <div className="bg-gradient-to-r from-[var(--gold)]/10 to-[var(--rose-gold)]/10 border border-[var(--gold)]/20 rounded-2xl p-6 mb-8">
          <h3 className="font-serif text-xl font-medium text-foreground mb-3">30-Day Return Window</h3>
          <p className="text-muted-foreground">
            We accept returns within 30 days of delivery. Items must be in their original, unopened packaging with all
            tags attached. A full refund will be issued to your original payment method.
          </p>
        </div>

        {/* Eligible / Not Eligible */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h4 className="font-medium text-foreground m-0">Eligible for Return</h4>
            </div>
            <ul className="list-none p-0 m-0 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                Unopened, sealed packages
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                Items with original tags attached
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                Defective or damaged products
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                Wrong items received
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h4 className="font-medium text-foreground m-0">Not Eligible for Return</h4>
            </div>
            <ul className="list-none p-0 m-0 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                Opened or used products
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                Custom color orders
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                Items without original packaging
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                Sale or clearance items
              </li>
            </ul>
          </div>
        </div>

        {/* Process */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-accent" />
            <h4 className="font-medium text-foreground m-0">How to Initiate a Return</h4>
          </div>
          <ol className="list-none p-0 m-0 space-y-4 text-muted-foreground">
            <li className="flex gap-4">
              <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm flex-shrink-0">
                1
              </span>
              <span>
                Contact our support team at support@dehairvault.com with your order number and reason for return.
              </span>
            </li>
            <li className="flex gap-4">
              <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm flex-shrink-0">
                2
              </span>
              <span>Receive your Return Merchandise Authorization (RMA) number and prepaid shipping label.</span>
            </li>
            <li className="flex gap-4">
              <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm flex-shrink-0">
                3
              </span>
              <span>
                Pack the item securely in its original packaging and ship within 7 days of receiving your RMA.
              </span>
            </li>
            <li className="flex gap-4">
              <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm flex-shrink-0">
                4
              </span>
              <span>Refund processed within 5-7 business days after we receive and inspect your return.</span>
            </li>
          </ol>
        </div>
      </div>
    </article>
  )
}
