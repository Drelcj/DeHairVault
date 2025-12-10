"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    quote: "The quality is absolutely unmatched. My hair has never looked more natural and luxurious.",
    author: "Sarah M.",
    location: "Los Angeles, CA",
    rating: 5,
  },
  {
    quote: "Dehair Vault transformed my confidence. These extensions are worth every penny.",
    author: "Jessica T.",
    location: "New York, NY",
    rating: 5,
  },
  {
    quote: "Finally found a brand that delivers on its promises. Pure luxury.",
    author: "Amara K.",
    location: "Atlanta, GA",
    rating: 5,
  },
]

export function TestimonialSection() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-secondary/50 via-background to-champagne/30 dark:from-secondary/20 dark:via-background dark:to-muted/20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-accent tracking-widest uppercase">Testimonials</span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-medium mt-4 text-foreground">
              What Our Clients Say
            </h2>
          </div>

          {/* Testimonial Card */}
          <div className="relative">
            <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center shadow-lg">
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl lg:text-3xl font-light text-foreground leading-relaxed mb-8 text-balance">
                &ldquo;{testimonials[current].quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div>
                <p className="font-medium text-foreground">{testimonials[current].author}</p>
                <p className="text-sm text-muted-foreground">{testimonials[current].location}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                className="rounded-full border-2 hover:bg-secondary bg-transparent"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Previous testimonial</span>
              </Button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === current ? "bg-accent w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  >
                    <span className="sr-only">Go to testimonial {index + 1}</span>
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={next}
                className="rounded-full border-2 hover:bg-secondary bg-transparent"
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Next testimonial</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
