import { HeaderShell } from "@/components/header-shell"
import { Footer } from "@/components/footer"
import { ContactHero } from "@/components/contact-hero"
import { ContactForm } from "@/components/contact-form"
import { ContactInfo } from "@/components/contact-info"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata = buildMetadata({
  title: "Contact Us | Dehair Vault",
  description:
    "Get in touch with Dehair Vault for help choosing your hair, order questions, wholesale enquiries, and aftercare advice.",
  path: "/contact",
})

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <ContactHero />
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
