import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/components/cart/cart-provider"
import { CurrencyProvider } from "@/contexts/currency-context"
import { cookies } from "next/headers"
import { CURRENCY_COOKIE_KEY, DEFAULT_CURRENCY, isSupportedCurrency } from "@/lib/currency/config"
import { getExchangeRatesSafe } from "@/lib/currency/rates"
import { CartSheet } from "@/components/cart/cart-sheet"
import { Toaster } from "sonner"
import { SITE_URL, buildMetadata } from "@/lib/seo/metadata"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

// Site-wide defaults; each public page overrides these via buildMetadata().
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata({
    title: "Dehair Vault | Luxury Hair Extensions",
    description:
      "Where elegance, confidence, and premium hair meet. Discover our exclusive collection of luxury hair extensions.",
  }),
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Currency cookie is set by proxy.ts on first visit (from the visitor's country)
  // and by the currency selector; rendering with it here keeps server and browser in sync.
  const cookieCurrency = (await cookies()).get(CURRENCY_COOKIE_KEY)?.value
  const initialCurrency = isSupportedCurrency(cookieCurrency) ? cookieCurrency : DEFAULT_CURRENCY
  const initialRates = await getExchangeRatesSafe()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${playfair.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CurrencyProvider initialCurrency={initialCurrency} initialRates={initialRates}>
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
