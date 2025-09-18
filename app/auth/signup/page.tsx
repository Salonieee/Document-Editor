import SignupForm from "@/components/auth/signup-form"
import Link from "next/link"
import { SetupGuide } from "@/components/setup-guide"

export default function SignupPage() {
  // Check if environment variables are configured
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isConfigured) {
    return <SetupGuide />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join us to start creating and collaborating</p>
        </div>

        <SignupForm />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
