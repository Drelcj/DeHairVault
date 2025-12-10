export function PoliciesHero() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-[var(--gold)]/10 to-[var(--rose-gold)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-gradient-to-tl from-[var(--champagne)]/20 to-transparent rounded-full blur-3xl" />

      <div className="relative container mx-auto px-6 lg:px-12 text-center">
        <span className="inline-block text-sm font-medium tracking-[0.3em] uppercase text-accent mb-4">
          Your Trust Matters
        </span>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-6 text-balance">
          Customer Care & Policies
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Everything you need to know about shopping with Dehair Vault. We believe in complete transparency and are here
          to support your journey to luxury.
        </p>
      </div>
    </section>
  )
}
