export function ShopHero() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-[var(--gold)]/20 to-[var(--rose-gold)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[var(--champagne)]/30 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-accent font-medium mb-4">Premium Collections</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-6 leading-tight">
            Discover Your Perfect
            <span className="block italic text-accent">Hair Extensions</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Explore our curated collection of premium, ethically-sourced hair extensions. Each piece crafted for lasting
            elegance and effortless styling.
          </p>
        </div>
      </div>
    </section>
  )
}
