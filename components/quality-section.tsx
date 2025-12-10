import { Feather, Clock, Sparkles } from "lucide-react"

const qualityFeatures = [
  {
    icon: Feather,
    title: "Softness",
    description: "Each strand is selected for its silky, natural texture that blends seamlessly with your own hair.",
  },
  {
    icon: Clock,
    title: "Longevity",
    description: "Premium quality means your investment lasts. With proper care, enjoy months of flawless beauty.",
  },
  {
    icon: Sparkles,
    title: "Effortless Styling",
    description: "Heat-friendly and versatile, our hair responds beautifully to curling, straightening, and coloring.",
  },
]

export function QualitySection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="text-accent font-medium tracking-widest uppercase text-sm">Unmatched Quality</span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mt-4 mb-6 text-balance">
              Every Strand, Carefully Selected
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Quality is not just a promise—it&apos;s our obsession. We travel the world to source the finest raw hair,
              ensuring each bundle meets our exacting standards for texture, strength, and natural beauty.
            </p>

            {/* Quality Features */}
            <div className="grid sm:grid-cols-3 gap-6">
              {qualityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center mb-4 group-hover:from-accent/30 transition-colors">
                    <feature.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-accent/10" />
              <img
                src="/close-up-of-luxurious-silky-hair-texture--high-end.jpg"
                alt="Close-up of premium quality hair texture"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -inset-4 border border-accent/20 rounded-3xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

            {/* Stats overlay */}
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-card/90 backdrop-blur-sm rounded-xl border border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-accent">100%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Virgin Hair</div>
                </div>
                <div>
                  <div className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-accent">12+</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Months Wear</div>
                </div>
                <div>
                  <div className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-accent">5★</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Rated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
