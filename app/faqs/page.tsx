import type { Metadata } from "next"
import Link from "next/link"
import { HeaderShell } from "@/components/header-shell"
import { Footer } from "@/components/footer"
import { 
  HelpCircle, 
  MapPin, 
  ShoppingBag, 
  Gem, 
  Truck, 
  Scissors, 
  RotateCcw,
  ChevronRight
} from "lucide-react"

export const metadata: Metadata = {
  title: "FAQs | Dehair Vault",
  description: "Frequently asked questions about our premium hair extensions, quality grades, shipping, and returns.",
}

const faqSections = [
  {
    id: "origin",
    title: "Product Origin & Availability",
    icon: MapPin,
    questions: [
      {
        q: "Where does your hair come from?",
        a: "Our hair is primarily sourced from Vietnam, Philippines, India, Burma, Cambodia, and a small amount from China. We work directly with ethical suppliers to ensure the highest quality hair."
      },
      {
        q: "Do you offer wholesale options?",
        a: "Yes! Wholesale bundles and wigs are available strictly by pre-order. The minimum order quantity (MOQ) is 6 bundles and 2 closures OR 3 wigs."
      }
    ]
  },
  {
    id: "quality",
    title: "Hair Quality & Grades",
    icon: Gem,
    questions: [
      {
        q: "What is Raw Baby Hair?",
        a: "Raw Baby Hair is our highest quality grade, sourced from 1-2 donors under the age of 15. It can be bleached to 613/60 and has a lifespan of 10+ years with proper care. Available in all textures including body wave, curls, and natural straight. Limited to 6\"-26\" lengths only. Not available in double or super double drawn."
      },
      {
        q: "What is Raw / Single Donor hair?",
        a: "Raw / Single Donor hair comes from one healthy donor. It can be bleached up to 613 and lasts 9+ years. Available in natural brown or black and all textures. Not available in double or super double drawn."
      },
      {
        q: "What is VIP Virgin Hair?",
        a: "VIP Virgin Hair is sourced from 2-3 donors. It can lift to honey blonde or higher and has a lifespan of 5-6+ years. Available in natural brown or black, all textures, and both double drawn and super double drawn options."
      },
      {
        q: "What is Regular Virgin / Remy Hair?",
        a: "Regular Virgin / Remy Hair comes from 4+ donors. It can be bleached to color #27 and lasts 2-3+ years. It's our most budget-friendly option and available in both double drawn and super double drawn."
      },
      {
        q: "What's the difference between Single Drawn, Double Drawn, and Super Double Drawn?",
        a: "Single Drawn hair is thinner at the ends (natural taper). Double Drawn hair is thicker with more volume throughout. Super Double Drawn offers maximum thickness and uniformity from top to bottom."
      },
      {
        q: "Which quality should I choose?",
        a: "Raw Baby Hair is best for those seeking the highest quality, rare, and longest-lasting hair. Single Donor is ideal for high bleaching capacity and longevity. VIP Virgin Hair is versatile and great for coloring. Regular Virgin/Remy is perfect if you want budget-friendly hair that's still versatile for dyeing."
      }
    ]
  },
  {
    id: "wigs",
    title: "Wig Bundles & Quantities",
    icon: Scissors,
    questions: [
      {
        q: "How many bundles do I need for a wig?",
        a: "For wigs 18\" and below, you'll need 2-3 bundles + 1 closure. For 20\" and above, we recommend 3 bundles or more to achieve full coverage and volume."
      }
    ]
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    icon: Truck,
    questions: [
      {
        q: "What shipping carriers do you use?",
        a: "We exclusively use DHL for secure international delivery and trusted local logistics partners for deliveries within Nigeria. We provide nationwide delivery across Nigeria."
      },
      {
        q: "How long does order processing take?",
        a: "Regular orders are processed and shipped within 1-2 weeks from confirmation. Pre-orders (wholesale) take 4 weeks from confirmation to shipping."
      },
      {
        q: "What are the estimated delivery times?",
        a: "Local delivery within Nigeria takes 3-5 business days. International delivery takes 7-14 business days. Delivery times may vary due to customs processing and local carrier delays."
      }
    ]
  },
  {
    id: "wholesale",
    title: "Wholesale Orders",
    icon: ShoppingBag,
    questions: [
      {
        q: "What is the minimum order for wholesale?",
        a: "The minimum order quantity (MOQ) for wholesale is 6 bundles and 2 closures OR 3 wigs."
      },
      {
        q: "How do I place a wholesale order?",
        a: "Wholesale orders are strictly by pre-order. Contact us through our contact page or email to discuss your requirements and get a quote."
      }
    ]
  },
  {
    id: "returns",
    title: "Returns & Exchanges",
    icon: RotateCcw,
    questions: [
      {
        q: "What is your return policy?",
        a: "You are eligible for a refund or exchange if the hair fails to perform as advertised regarding bleaching or lifespan, or if the hair received is different from what was ordered."
      },
      {
        q: "How long do I have to make a complaint?",
        a: "All complaints must be made within 3 days of receipt. The product must not be tampered with and must be returned exactly as it was sent."
      },
      {
        q: "What items are not eligible for return?",
        a: "Products that have been tampered with, altered, or not returned in original condition are not eligible. Custom pre-orders (wholesale bundles and wigs) are also non-refundable once production has begun."
      }
    ]
  }
]

export default function FAQsPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[var(--gold)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--rose-gold)]/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-sm font-medium tracking-[0.2em] uppercase text-accent mb-6">
              Help Center
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-tight mb-6">
              Frequently Asked
              <span className="block italic text-accent">Questions</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Find answers to common questions about our premium hair extensions, quality grades, shipping, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap justify-center gap-3">
            {faqSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors text-sm"
              >
                <section.icon className="h-4 w-4" />
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto space-y-16">
            {faqSections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--rose-gold)]/10 flex items-center justify-center">
                    <section.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.questions.map((item, index) => (
                    <div key={index} className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <HelpCircle className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground mb-3">{item.q}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-accent/5 to-[var(--gold)]/5 border-t border-accent/10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-8">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium transition-colors"
            >
              Contact Support
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
