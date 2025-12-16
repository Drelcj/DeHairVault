import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <SignupForm />
      </div>
      <Footer />
    </main>
  )
}
