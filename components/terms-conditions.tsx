import { ScrollText, ShoppingBag, Package, Truck, CreditCard, AlertTriangle, Scale } from "lucide-react"

export function TermsConditions() {
  return (
    <article id="terms" className="scroll-mt-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--rose-gold)]/10 flex items-center justify-center">
          <ScrollText className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">Terms &amp; Conditions</h2>
          <p className="text-sm text-muted-foreground">Last updated: December 2024</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground leading-relaxed">
          Welcome to Dehair Vault. By accessing and using our website and services, you agree to be bound by these Terms
          and Conditions. Please read them carefully before making a purchase.
        </p>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg font-medium text-foreground mb-4">1. General Terms</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            By placing an order through our website, you warrant that you are at least 18 years of age and possess the
            legal authority to enter into a binding contract. All information provided during the ordering process must
            be accurate and complete. Dehair Vault reserves the right to refuse service to anyone at our discretion.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-lg font-medium text-foreground m-0">2. Product Information &amp; Quality Grades</h3>
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
            <p>
              Our hair is primarily sourced from Vietnam, Philippines, India, Burma, Cambodia, and China. We offer four 
              premium grades of hair, each with specific characteristics:
            </p>
            <div className="bg-secondary/50 rounded-xl p-4 space-y-4">
              <div>
                <h4 className="font-medium text-foreground">Raw Baby Hair</h4>
                <p className="text-sm">Sourced from 1-2 donors under 15 years. Bleaches to 613/60. Lifespan: 10+ years. Available in 6&quot;-26&quot; lengths only. Not available in double or super double drawn.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Raw / Single Donor</h4>
                <p className="text-sm">Sourced from one healthy donor. Bleaches up to 613. Lifespan: 9+ years. Not available in double or super double drawn.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">VIP Virgin Hair</h4>
                <p className="text-sm">Sourced from 2-3 donors. Lifts to honey blonde or higher. Lifespan: 5-6+ years. Available in double and super double drawn.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Regular Virgin / Remy Hair</h4>
                <p className="text-sm">Sourced from 4+ donors. Bleaches to color #27. Lifespan: 2-3+ years. Available in double and super double drawn.</p>
              </div>
            </div>
            <p>
              Colors may vary slightly due to monitor settings and photography lighting. All product descriptions and prices 
              are subject to change without notice.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-lg font-medium text-foreground m-0">3. Wholesale &amp; Pre-Orders</h3>
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
            <p>
              Wholesale bundles and wigs are available <strong className="text-foreground">strictly by pre-order</strong>.
            </p>
            <ul className="list-none p-0 m-0 space-y-2">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Minimum Order Quantity (MOQ):</strong> 6 bundles and 2 closures OR 3 wigs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Pre-Order Processing:</strong> 4 weeks from confirmation to shipping</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Regular Order Processing:</strong> 1-2 weeks from confirmation to shipping</span>
              </li>
            </ul>
            <p>
              Pre-orders and wholesale orders are non-refundable once production has commenced. Please ensure all specifications 
              are correct before confirming your order.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-lg font-medium text-foreground m-0">4. Shipping &amp; Delivery</h3>
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
            <p>
              We exclusively use <strong className="text-foreground">DHL</strong> for international shipping and trusted 
              local logistics for deliveries within Nigeria. We provide nationwide delivery across Nigeria.
            </p>
            <ul className="list-none p-0 m-0 space-y-2">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                All shipments include tracking information
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Local delivery: 3-5 business days
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                International delivery: 7-14 business days
              </li>
            </ul>
            <p>
              Customs duties, taxes, and import fees for international orders are the responsibility of the buyer.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-lg font-medium text-foreground m-0">5. Payments &amp; Pricing</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            All prices are listed in Nigerian Naira (NGN). We accept major credit/debit cards and bank transfers through 
            our secure payment processors. Payment must be received in full before orders are processed. Prices are subject 
            to change without prior notice, but confirmed orders will be honored at the price quoted at the time of purchase.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-lg font-medium text-foreground m-0">6. Returns &amp; Refunds</h3>
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
            <p>Eligibility for a refund or exchange is based on the following conditions:</p>
            <ul className="list-none p-0 m-0 space-y-2">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                The hair fails to perform as advertised regarding bleaching or lifespan
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                The hair received is different from what was ordered
              </li>
            </ul>
            <p className="font-medium text-foreground">
              Important: Complaints must be made within 3 days of receipt. The product must not be tampered with and must 
              be returned exactly as it was sent.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg font-medium text-foreground mb-4">7. Intellectual Property</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            All content on this website, including text, graphics, logos, images, and software, is the property of
            Dehair Vault and is protected by intellectual property laws. Unauthorized use, reproduction, or distribution 
            of our content is strictly prohibited.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-lg font-medium text-foreground m-0">8. Limitation of Liability</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Dehair Vault shall not be liable for any indirect, incidental, special, or consequential damages arising
            from the use of our products or services. Our total liability shall not exceed the amount paid for the
            specific product in question. We are not responsible for delays caused by shipping carriers, customs, or 
            circumstances beyond our control.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg font-medium text-foreground mb-4">9. Governing Law</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            These terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. 
            Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the Nigerian courts.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg font-medium text-foreground mb-4">10. Contact Information</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            If you have any questions about these Terms and Conditions, please contact us at support@dehairvault.com or 
            through our contact page. We aim to respond to all inquiries within 24-48 hours.
          </p>
        </div>
      </div>
    </article>
  )
}
