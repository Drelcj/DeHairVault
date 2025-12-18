import { redirect } from 'next/navigation'
import { HeaderShell } from '@/components/header-shell'
import { Footer } from '@/components/footer'
import { getSessionUser } from '@/lib/auth/session'
import { getCart } from '@/lib/actions/cart'
import { CheckoutForm } from '@/components/checkout/checkout-form'

export const metadata = {
  title: 'Checkout | Dehair Vault',
  description: 'Complete your order securely',
}

export default async function CheckoutPage() {
  // Require authentication
  const session = await getSessionUser()
  
  if (!session?.user) {
    redirect('/login?redirectTo=/checkout')
  }

  // Fetch cart for authenticated user
  const cart = await getCart()

  // Redirect to shop if cart is empty
  if (!cart || cart.items.length === 0) {
    redirect('/shop')
  }

  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      
      {/* Checkout Hero/Header Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-6 lg:px-12">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl font-medium text-foreground">
            Checkout
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Complete your order and prepare to receive your luxury hair
          </p>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <CheckoutForm cart={cart} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
