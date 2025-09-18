import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Users, Shield, Palette } from "lucide-react"
import { SetupGuide } from "@/components/setup-guide"

export default async function HomePage() {
  // Check if environment variables are configured
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isConfigured) {
    return <SetupGuide />
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("Error checking user:", error)
    // Continue to show the landing page if there's an error
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">Collaborative Document Editor</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Create, edit, and collaborate on documents in real-time. Inspired by MS Word with modern web technologies.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Rich Text Editing</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Full-featured text editor with formatting, images, and media support
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-300">Work together with live updates and presence indicators</p>
          </div>

          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Access Control</h3>
            <p className="text-gray-600 dark:text-gray-300">Granular permissions with view and edit access levels</p>
          </div>

          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Palette className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Dark Mode</h3>
            <p className="text-gray-600 dark:text-gray-300">Beautiful dark theme optimized for comfortable editing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
