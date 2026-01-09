import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/components/cart/cart-provider"
import { CurrencyProvider } from "@/contexts/currency-context"
import { CartSheet } from "@/components/cart/cart-sheet"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Dehair Vault | Luxury Hair Extensions",
  description:
    "Where elegance, confidence, and premium hair meet. Discover our exclusive collection of luxury hair extensions.",
  generator: 'v0.app',
  metadataBase: new URL('https://dehairvault.com/'),
  openGraph: {
    title: 'Dehair Vault | Luxury Hair Extensions',
    description: 'Where elegance, confidence, and premium hair meet. Discover our exclusive collection of luxury hair extensions.',
    type: 'website',
    url: 'https://dehairvault.com/',
    siteName: 'Dehair Vault',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Dehair Vault - Luxury Hair Extensions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dehair Vault | Luxury Hair Extensions',
    description: 'Where elegance, confidence, and premium hair meet. Discover our exclusive collection of luxury hair extensions.',
    images: ['/og-default.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${playfair.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CurrencyProvider>
            <CartProvider>
              {children}
              <CartSheet />
              <Toaster position="top-right" />
            </CartProvider>
          </CurrencyProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
