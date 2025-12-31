import { Clock, Truck, Globe, Package, MapPin } from "lucide-react"

export function ShippingPolicy() {
  return (
    <article id="shipping" className="scroll-mt-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--rose-gold)]/10 flex items-center justify-center">
          <Truck className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">Shipping &amp; Delivery Policy</h2>
          <p className="text-sm text-muted-foreground">Last updated: December 2024</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed mb-8">
          At Dehair Vault, we ensure your premium hair extensions reach you safely and promptly. We partner with trusted 
          carriers to deliver your orders securely, maintaining the exceptional quality you expect from us.
        </p>

        {/* Shipping Partners */}
        <div className="bg-gradient-to-r from-[var(--gold)]/10 to-[var(--rose-gold)]/10 border border-[var(--gold)]/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Package className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-xl font-medium text-foreground m-0">Our Shipping Partners</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            We exclusively use <strong className="text-foreground">DHL</strong> for secure international and domestic delivery, 
            ensuring your order is handled with care and arrives on time. For local deliveries within Nigeria, we use trusted 
            local logistics partners to provide fast and reliable service.
          </p>
          <p className="text-muted-foreground">
            All shipments include tracking information so you can monitor your order every step of the way.
          </p>
        </div>

        {/* Processing Time */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-xl font-medium text-foreground m-0">Processing Time</h3>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              Processing times vary based on the type of order. We work diligently to prepare your order with the utmost care.
            </p>
            <div className="grid gap-4 mt-6">
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-foreground">Regular Orders</span>
                  <span className="text-accent font-medium">1-2 Weeks</span>
                </div>
                <p className="text-sm">Standard orders are processed and shipped within 1-2 weeks from order confirmation.</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-foreground">Pre-Orders (Wholesale)</span>
                  <span className="text-accent font-medium">4 Weeks</span>
                </div>
                <p className="text-sm">Wholesale bundles and wigs are made-to-order. Allow 4 weeks from confirmation to shipping.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Coverage */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-xl font-medium text-foreground m-0">Delivery Coverage</h3>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              We provide <strong className="text-foreground">nationwide delivery</strong> across Nigeria and ship internationally 
              to customers worldwide.
            </p>
            <ul className="list-none p-0 m-0 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Local Delivery (Nigeria):</strong> Delivered via trusted local logistics partners for fast service</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">International Delivery:</strong> Shipped exclusively via DHL for secure, tracked delivery</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Estimated Delivery Times */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-xl font-medium text-foreground m-0">Estimated Delivery Times</h3>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              After your order has been processed and shipped, estimated delivery times are as follows:
            </p>
            <div className="bg-secondary/50 rounded-xl p-4 mt-4">
              <ul className="list-none p-0 m-0 space-y-3 text-sm">
                <li className="flex justify-between">
                  <span>Within Nigeria (Local)</span>
                  <span className="text-foreground font-medium">3-5 business days</span>
                </li>
                <li className="flex justify-between">
                  <span>West Africa</span>
                  <span className="text-foreground font-medium">5-7 business days</span>
                </li>
                <li className="flex justify-between">
                  <span>United States / Canada</span>
                  <span className="text-foreground font-medium">7-14 business days</span>
                </li>
                <li className="flex justify-between">
                  <span>United Kingdom / Europe</span>
                  <span className="text-foreground font-medium">7-14 business days</span>
                </li>
                <li className="flex justify-between">
                  <span>Rest of World</span>
                  <span className="text-foreground font-medium">10-21 business days</span>
                </li>
              </ul>
            </div>
            <p className="text-sm italic">
              * Delivery times are estimates and may vary due to customs processing and local carrier delays.
            </p>
          </div>
        </div>

        {/* International Shipping */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-xl font-medium text-foreground m-0">International Shipping Information</h3>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              We ship our premium hair extensions worldwide to bring the Dehair Vault experience to our international 
              clientele. International orders may be subject to customs fees, duties, and taxes which are the 
              responsibility of the recipient.
            </p>
            <div className="bg-secondary/50 rounded-xl p-4">
              <h4 className="font-medium text-foreground mb-3">Important Notes:</h4>
              <ul className="list-none p-0 m-0 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  All international shipments are sent via DHL with full tracking
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  Customs duties and import taxes are the buyer&apos;s responsibility
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  Signature may be required upon delivery
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  Please ensure your shipping address is complete and accurate
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
