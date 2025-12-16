import { Suspense } from "react"
import { HeaderShell } from "@/components/header-shell"
import { Footer } from "@/components/footer"
import { LoginForm } from "@/components/auth/login-form"

export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string }> }) {
  const params = await searchParams
  const redirectTo = typeof params?.redirectTo === 'string' ? params.redirectTo : '/'
  return (
    <main className="min-h-screen bg-background">
      <HeaderShell />
      <div className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]"><p>Loading...</p></div>}>
          <LoginForm redirectTo={redirectTo} />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
