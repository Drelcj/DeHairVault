import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PoliciesHero } from "@/components/policies-hero"
import { PoliciesSidebar } from "@/components/policies-sidebar"
import { ShippingPolicy } from "@/components/shipping-policy"
import { ReturnPolicy } from "@/components/return-policy"
import { TermsConditions } from "@/components/terms-conditions"
import { PrivacyPolicy } from "@/components/privacy-policy"

export const metadata: Metadata = {
  title: "Customer Care & Policies | Dehair Vault",
  description: "Learn about our shipping, returns, terms & conditions, and privacy policies at Dehair Vault.",
}

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <PoliciesHero />

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Sticky Sidebar Navigation */}
            <aside className="lg:w-72 flex-shrink-0">
              <PoliciesSidebar />
            </aside>

            {/* Content Area */}
            <div className="flex-1 max-w-4xl">
              <div className="space-y-20">
                <ShippingPolicy />
                <ReturnPolicy />
                <TermsConditions />
                <PrivacyPolicy />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
