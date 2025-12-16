import { HeaderShell } from "@/components/header-shell"
import { Footer } from "@/components/footer"
import { AboutHero } from "@/components/about-hero"
import { MissionSection } from "@/components/mission-section"
import { QualitySection } from "@/components/quality-section"
import { VaultExperience } from "@/components/vault-experience"
import { AboutCta } from "@/components/about-cta"

export const metadata = {
  title: "About Us | Dehair Vault",
  description:
    "Investing in elegance that lasts. Discover our mission, unmatched quality, and the Dehair Vault experience.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <AboutHero />
      <MissionSection />
      <QualitySection />
      <VaultExperience />
      <AboutCta />
      <Footer />
    </main>
  )
}
