import { Crown, Heart, Gem } from "lucide-react"

const missionPoints = [
  {
    icon: Crown,
    title: "Identity",
    description:
      "Your hair is a crown you never take off. We craft extensions that become an extension of who you are.",
  },
  {
    icon: Heart,
    title: "Power",
    description:
      "Confidence radiates from within, but exceptional hair amplifies it. Feel unstoppable every single day.",
  },
  {
    icon: Gem,
    title: "Self-Expression",
    description: "Whether bold or subtle, your style tells your story. We provide the canvas for your masterpiece.",
  },
]

export function MissionSection() {
  return (
    <section id="story" className="py-20 lg:py-32 relative overflow-hidden scroll-mt-24">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Placeholder */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-muted to-secondary" />
              <img
                src="/elegant-woman-with-luxurious-flowing-hair--profess.jpg"
                alt="Woman showcasing luxurious hair extensions"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </div>
            {/* Decorative border */}
            <div className="absolute -inset-4 border border-accent/20 rounded-3xl -z-10" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="text-accent font-medium tracking-widest uppercase text-sm">Our Mission</span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mt-4 mb-6 text-balance">
              A Statement of Identity, Power & Self-Expression
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              We founded Dehair Vault with a singular vision: to empower every woman to feel extraordinary. Our mission
              goes beyond selling hair—we&apos;re creating transformative experiences that unlock your inner confidence.
            </p>

            {/* Mission Points */}
            <div className="space-y-6">
              {missionPoints.map((point, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/10 transition-colors">
                    <point.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{point.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
