import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <LoginForm />
      </div>
      <Footer />
    </main>
  )
}
