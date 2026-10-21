import { HeaderShell } from "@/components/header-shell"
import { HeroSlider } from "@/components/hero-slider"
import { BrandStatement } from "@/components/brand-statement"
import { FeaturedCollections } from "@/components/featured-collections"
import { FeaturesSection } from "@/components/features-section"
import { TestimonialSection } from "@/components/testimonial-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeaderShell />
      <HeroSlider />
      <BrandStatement />
      <FeaturedCollections />
      <FeaturesSection />
      <TestimonialSection />
      <NewsletterSection />
      <Footer />
    </main>
  )
}
