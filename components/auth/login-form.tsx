"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Initialize Supabase client
      const supabase = createClient()

      console.log("Attempting to sign in with:", email)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      console.log("Sign in response:", { data, error: signInError })

      if (signInError) {
        console.error("Sign in error:", signInError)

        // Handle specific error types
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Please confirm your email address before signing in.")
        } else if (signInError.message.includes("Too many requests")) {
          setError("Too many login attempts. Please wait a moment and try again.")
        } else {
          setError(signInError.message)
        }
      } else if (data.user) {
        console.log("Sign in successful, user:", data.user)

        // Wait a moment for the session to be established
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Redirect to dashboard
        window.location.href = "/dashboard"
      } else {
        console.log("No user returned")
        setError("Sign in failed - please try again")
      }
    } catch (err) {
      console.error("Unexpected error:", err)

      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch")) {
          setError("Network error - please check your internet connection and try again.")
        } else if (err.message.includes("Invalid Supabase URL")) {
          setError("Configuration error - please contact support.")
        } else {
          setError(`Error: ${err.message}`)
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your email and password to access your documents</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
