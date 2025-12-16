import { HeaderShell } from "@/components/header-shell"
import { Footer } from "@/components/footer"
import { SignupForm } from "@/components/auth/signup-form"

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <div className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <SignupForm />
      </div>
      <Footer />
    </main>
  )
}
