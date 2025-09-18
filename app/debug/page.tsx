"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connectionTest, setConnectionTest] = useState<string>("Testing...")

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient()

        // Test basic connection
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setConnectionTest(`❌ Connection failed: ${error.message}`)
        } else {
          setConnectionTest("✅ Connection successful")
          setSession(data.session)
          setUser(data.session?.user || null)
        }
      } catch (err) {
        setConnectionTest(`❌ Connection error: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    testConnection()

    // Set up auth state listener
    try {
      const supabase = createClient()
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event: any, session: { user: any }) => {
        console.log("Auth state changed:", event, session)
        setSession(session)
        setUser(session?.user || null)
      })

      return () => subscription.unsubscribe()
    } catch (err) {
      console.error("Failed to set up auth listener:", err)
    }
  }, [])

  const testSignOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      } else {
        console.log("Signed out successfully")
      }
    } catch (err) {
      console.error("Sign out failed:", err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading debug information...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Authentication Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Environment Variables */}
          <div>
            <h3 className="font-semibold mb-2">Environment Variables:</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span>Supabase URL:</span>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                  <Badge variant="default">✅ {process.env.NEXT_PUBLIC_SUPABASE_URL}</Badge>
                ) : (
                  <Badge variant="destructive">❌ Missing</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Supabase Anon Key:</span>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                  <Badge variant="default">
                    ✅ Set ({process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...)
                  </Badge>
                ) : (
                  <Badge variant="destructive">❌ Missing</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Connection Test */}
          <div>
            <h3 className="font-semibold mb-2">Connection Test:</h3>
            <p className="font-mono text-sm">{connectionTest}</p>
          </div>

          {/* User Status */}
          <div>
            <h3 className="font-semibold mb-2">Authentication Status:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>User Authenticated:</span>
                <Badge variant={user ? "default" : "secondary"}>{user ? "✅ Yes" : "❌ No"}</Badge>
              </div>

              {user && (
                <div className="ml-4 space-y-1 text-sm">
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>ID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>Email Confirmed:</strong> {user.email_confirmed_at ? "✅ Yes" : "❌ No"}
                  </p>
                  <p>
                    <strong>Created:</strong> {new Date(user.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div>
            <h3 className="font-semibold mb-2">Session Details:</h3>
            {session ? (
              <div className="space-y-2">
                <Badge variant="default">✅ Active Session</Badge>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">View Session Data</summary>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto mt-2 max-h-64">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <Badge variant="secondary">❌ No Active Session</Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {user && (
              <Button onClick={testSignOut} variant="outline">
                Test Sign Out
              </Button>
            )}
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
