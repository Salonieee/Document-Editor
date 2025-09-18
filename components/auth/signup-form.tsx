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

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()

      console.log("Attempting to sign up with:", email)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      console.log("Sign up response:", { data, error: signUpError })

      if (signUpError) {
        console.error("Sign up error:", signUpError)

        // Handle specific error types
        if (signUpError.message.includes("User already registered")) {
          setError("An account with this email already exists. Please sign in instead.")
        } else if (signUpError.message.includes("Password should be at least")) {
          setError("Password must be at least 6 characters long.")
        } else if (signUpError.message.includes("Invalid email")) {
          setError("Please enter a valid email address.")
        } else {
          setError(signUpError.message)
        }
      } else if (data.user) {
        console.log("Sign up successful, user:", data.user)

        // Wait a moment for the session to be established
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Redirect to dashboard
        window.location.href = "/dashboard"
      } else {
        console.log("No user returned from signup")
        setError("Sign up failed - please try again")
      }
    } catch (err) {
      console.error("Unexpected signup error:", err)

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
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up to start creating and collaborating on documents</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your full name"
            />
          </div>
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
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
