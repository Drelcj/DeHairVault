import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { BrandStatement } from "@/components/brand-statement"
import { FeaturedCollections } from "@/components/featured-collections"
import { FeaturesSection } from "@/components/features-section"
import { TestimonialSection } from "@/components/testimonial-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <BrandStatement />
      <FeaturedCollections />
      <FeaturesSection />
      <TestimonialSection />
      <NewsletterSection />
      <Footer />
    </main>
  )
}
