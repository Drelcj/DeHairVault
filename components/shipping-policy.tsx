import { Clock, Truck, Globe, Package } from "lucide-react"

export function ShippingPolicy() {
  return (
    <article id="shipping" className="scroll-mt-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--rose-gold)]/10 flex items-center justify-center">
          <Truck className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">Shipping Policy</h2>
          <p className="text-sm text-muted-foreground">Last updated: December 2024</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed mb-8">
          At Dehair Vault, we understand that receiving your luxury hair extensions promptly and in perfect condition is
          essential. We partner with premium carriers to ensure your order arrives safely, maintaining the exceptional
          quality you expect from us.
        </p>

        {/* Processing Time */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-xl font-medium text-foreground m-0">Processing Time</h3>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your
              order confirmation email. During peak seasons or promotional periods, processing may take an additional
              1-2 business days.
            </p>
            <ul className="list-none p-0 m-0 space-y-3">
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Standard Orders:</strong> 1-2 business days processing
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Custom Orders:</strong> 3-5 business days processing
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Express Processing:</strong> Same-day processing available for
                  orders placed before 12 PM EST (additional fee applies)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-xl font-medium text-foreground m-0">Shipping Methods</h3>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              We offer multiple shipping options to accommodate your needs. All shipments include tracking information
              and are packaged in our signature luxury boxes to protect your investment.
            </p>
            <div className="grid gap-4 mt-6">
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-foreground">Standard Shipping</span>
                  <span className="text-accent font-medium">$9.99</span>
                </div>
                <p className="text-sm">Delivery within 5-7 business days. Free on orders over $150.</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-foreground">Express Shipping</span>
                  <span className="text-accent font-medium">$19.99</span>
                </div>
                <p className="text-sm">Delivery within 2-3 business days. Tracking included.</p>
              </div>
              <div className="bg-gradient-to-r from-[var(--gold)]/10 to-[var(--rose-gold)]/10 border border-[var(--gold)]/20 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-foreground">Priority Overnight</span>
                  <span className="text-accent font-medium">$34.99</span>
                </div>
                <p className="text-sm">Next business day delivery. Signature required.</p>
              </div>
            </div>
          </div>
        </div>

        {/* International Shipping */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-xl font-medium text-foreground m-0">International Shipping</h3>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              We ship luxury hair extensions worldwide to bring the Dehair Vault experience to our international
              clientele. International orders may be subject to customs fees, duties, and taxes which are the
              responsibility of the recipient.
            </p>
            <div className="bg-secondary/50 rounded-xl p-4 mt-4">
              <h4 className="font-medium text-foreground mb-3">Estimated Delivery Times:</h4>
              <ul className="list-none p-0 m-0 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Canada</span>
                  <span className="text-foreground">5-10 business days</span>
                </li>
                <li className="flex justify-between">
                  <span>United Kingdom</span>
                  <span className="text-foreground">7-14 business days</span>
                </li>
                <li className="flex justify-between">
                  <span>Europe</span>
                  <span className="text-foreground">10-18 business days</span>
                </li>
                <li className="flex justify-between">
                  <span>Australia / New Zealand</span>
                  <span className="text-foreground">12-21 business days</span>
                </li>
                <li className="flex justify-between">
                  <span>Rest of World</span>
                  <span className="text-foreground">14-28 business days</span>
                </li>
              </ul>
            </div>
            <p className="text-sm italic">
              * Delivery times are estimates and may vary due to customs processing and local carrier delays.
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
