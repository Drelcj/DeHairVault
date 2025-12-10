export function BrandStatement() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent" />
            <div className="w-2 h-2 rounded-full bg-accent" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent" />
          </div>

          <blockquote className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-foreground text-balance">
            <span className="italic">&ldquo;</span>
            Where{" "}
            <span className="bg-gradient-to-r from-accent to-rose-gold bg-clip-text text-transparent font-medium">
              elegance
            </span>
            , confidence, and{" "}
            <span className="bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent font-medium">
              premium hair
            </span>{" "}
            meet.
            <span className="italic">&rdquo;</span>
          </blockquote>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent" />
            <div className="w-2 h-2 rounded-full bg-accent" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent" />
          </div>

          <p className="mt-10 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            At Dehair Vault, we believe every woman deserves to feel extraordinary. Our curated collection of luxury
            hair extensions is designed to elevate your natural beauty and unlock your inner confidence.
          </p>
        </div>
      </div>
    </section>
  )
}
