export function ContactHero() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-[var(--gold)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--rose-gold)]/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-sm font-medium tracking-[0.2em] uppercase text-accent mb-6">
            Get in Touch
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-tight mb-6">
            We&apos;re Here to Help
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Have a question about our products or need styling advice? Our dedicated team is ready to assist you on your
            luxury hair journey.
          </p>
        </div>
      </div>
    </section>
  )
}
