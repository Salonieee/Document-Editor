"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Copy, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SetupGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🚀 Setup Required</h1>
          <p className="text-muted-foreground">Please configure your Supabase credentials to use the Document Editor</p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Environment variables are missing.</strong> Follow the steps below to set up your Supabase project.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          {/* Step 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge>1</Badge>
                Create a Supabase Project
              </CardTitle>
              <CardDescription>Set up your backend database and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    supabase.com <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  and sign up/sign in
                </li>
                <li>Click "New Project" and choose your organization</li>
                <li>Enter a project name and database password</li>
                <li>Wait for the project to be created (takes ~2 minutes)</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge>2</Badge>
                Get Your Project Credentials
              </CardTitle>
              <CardDescription>Copy your project URL and API keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>In your Supabase dashboard, go to "Settings" → "API"</li>
                <li>Copy the "Project URL" (looks like: https://abc123.supabase.co)</li>
                <li>Copy the "anon public" key</li>
                <li>Copy the "service_role" key (keep this secret!)</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge>3</Badge>
                Configure Authentication
              </CardTitle>
              <CardDescription>Disable email confirmation for easier testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>In your Supabase dashboard, go to "Authentication" → "Settings"</li>
                <li>Scroll down to "User Signups"</li>
                <li>Turn OFF "Enable email confirmations"</li>
                <li>Click "Save"</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge>4</Badge>
                Create Environment File
              </CardTitle>
              <CardDescription>Add your credentials to the project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Create a file called `.env.local` in your project root with:</p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                <div className="flex justify-between items-start">
                  <pre className="flex-1">{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`}</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`)
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Replace the placeholder values with your actual Supabase credentials
              </p>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge>5</Badge>
                Set Up Database
              </CardTitle>
              <CardDescription>Create the required database tables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>In your Supabase dashboard, go to "SQL Editor"</li>
                <li>Copy and run the SQL script from `scripts/001-initial-schema.sql`</li>
                <li>This will create all the necessary tables and security policies</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 6 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge>6</Badge>
                Restart Development Server
              </CardTitle>
              <CardDescription>Apply the new environment variables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                <pre>npm run dev</pre>
              </div>
              <p className="text-sm">After restarting, refresh this page to continue.</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={() => window.location.reload()} size="lg">
            I've completed the setup - Refresh Page
          </Button>
        </div>
      </div>
    </div>
  )
}
