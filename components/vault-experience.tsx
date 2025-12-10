import { Users, Shield, Gift, HeartHandshake } from "lucide-react"

const experiences = [
  {
    icon: Users,
    title: "Personalized Consultation",
    description: "Our hair experts guide you to the perfect match for your lifestyle, texture, and desired look.",
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Every purchase is backed by our satisfaction promise. We stand behind every strand we sell.",
  },
  {
    icon: Gift,
    title: "Luxury Packaging",
    description: "From the moment you receive your order, experience the thrill of true luxury unboxing.",
  },
  {
    icon: HeartHandshake,
    title: "Ongoing Support",
    description: "Our relationship doesn't end at checkout. We're here for styling tips, care advice, and more.",
  },
]

export function VaultExperience() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-muted/50" />

      {/* Decorative orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-medium tracking-widest uppercase text-sm">The Vault Experience</span>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mt-4 mb-6 text-balance">
            More Than a Brand—
            <span className="italic text-accent">A Partnership</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            When you choose Dehair Vault, you&apos;re not just buying hair—you&apos;re joining a community that
            celebrates beauty, confidence, and self-love. Our customer-centered service ensures your journey with us is
            nothing short of exceptional.
          </p>
        </div>

        {/* Experience Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:from-accent/30 group-hover:to-accent/10 transition-colors">
                  <exp.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-medium text-foreground mb-3">
                  {exp.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{exp.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Quote */}
        <div className="mt-20 text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border border-accent/20">
            <blockquote className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl italic text-foreground max-w-2xl">
              &ldquo;Welcome to the Vault—where your crown awaits.&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}
