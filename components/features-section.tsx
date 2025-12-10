import { Shield, Sparkles, Heart, Award } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Premium Quality",
    description: "100% virgin human hair, meticulously sourced and quality tested",
  },
  {
    icon: Sparkles,
    title: "Lasting Luxury",
    description: "Extensions that maintain their luster wash after wash",
  },
  {
    icon: Heart,
    title: "Ethically Sourced",
    description: "Responsibly obtained hair with full transparency",
  },
  {
    icon: Award,
    title: "Expert Crafted",
    description: "Hand-tied and expertly processed by master artisans",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={feature.title} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-champagne dark:from-secondary dark:to-muted mb-6 group-hover:from-accent/20 group-hover:to-gold/20 transition-all duration-300">
                <feature.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-medium text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
