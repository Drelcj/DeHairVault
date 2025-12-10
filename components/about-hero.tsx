import { Sparkles } from "lucide-react"

export function AboutHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-muted" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-accent/5 to-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent tracking-wide uppercase">Our Story</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground leading-tight mb-6 text-balance">
          Investing in Elegance
          <br />
          <span className="italic text-accent">That Lasts</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
          At Dehair Vault, we believe that luxury hair is not just an accessory—it&apos;s a statement of identity,
          power, and self-expression.
        </p>

        {/* Decorative Line */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent/50" />
          <div className="w-2 h-2 rounded-full bg-accent" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent/50" />
        </div>
      </div>
    </section>
  )
}
