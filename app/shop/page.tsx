import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ShopHero } from "@/components/shop-hero"
import { ShopContent } from "@/components/shop-content"

export const metadata = {
  title: "Shop Collections | Dehair Vault",
  description:
    "Explore our premium collection of luxury hair extensions. Find your perfect match in texture, length, and style.",
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ShopHero />
      <ShopContent />
      <Footer />
    </main>
  )
}
