import { Suspense } from "react"
import { HeaderShell } from "@/components/header-shell"
import { Footer } from "@/components/footer"
import { ShopHero } from "@/components/shop-hero"
import { ShopContent } from "@/components/shop-content"

export const metadata = {
  title: "Shop Collections | Dehair Vault",
  description:
    "Explore our premium collection of luxury hair extensions. Find your perfect match in texture, length, and style.",
}

// Loading fallback for the shop content
function ShopContentSkeleton() {
  return (
    <section className="pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-12">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-5 w-full bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
          <div className="flex-1 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <ShopHero />
      <Suspense fallback={<ShopContentSkeleton />}>
        <ShopContent />
      </Suspense>
      <Footer />
    </main>
  )
}
