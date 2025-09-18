"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Search, MoreVertical, Trash2, Share2, Moon, Sun, LogOut, AlertCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface DashboardProps {
  documents: any[]
  userId: string
}

export default function Dashboard({ documents, userId }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()

  const filteredDocuments = documents.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const createDocument = async () => {
    setLoading(true)
    setError("")

    try {
      console.log("Creating document for user:", userId)

      // Simple document data without complex logic
      const documentData = {
        title: documents.length === 0 ? "Welcome to Document Editor" : "Untitled Document",
        owner_id: userId,
        content:
          documents.length === 0
            ? {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Welcome to your collaborative document editor! Start writing here...",
                      },
                    ],
                  },
                ],
              }
            : {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Start writing your document here...",
                      },
                    ],
                  },
                ],
              },
      }

      console.log("Document data to insert:", documentData)

      // Simple insert without complex select
      const { data, error } = await supabase.from("documents").upsert(documentData).select("id, title").single()

      console.log("Insert result:", { data, error })

      if (error) {
        console.error("Database error:", error)

        // Handle specific error types
        if (error.code === "42P01") {
          setError("Database tables not found. Please run the database setup script.")
        } else if (error.code === "42501" || error.message.includes("permission denied")) {
          setError("Permission denied. Please check your database policies.")
        } else if (error.message.includes("relation") && error.message.includes("does not exist")) {
          setError("Database tables missing. Please run the setup script in your Supabase SQL editor.")
        } else if (error.message.includes("infinite recursion")) {
          setError("Database policy error. Please run the fixed database schema.")
        } else if (error.message.includes("RLS")) {
          setError("Row Level Security error. Please check your database policies.")
        } else {
          setError(`Database error: ${error.message} (Code: ${error.code || "unknown"})`)
        }

        toast.error("Failed to create document")
      } else if (data) {
        console.log("Document created successfully:", data)
        toast.success("Document created successfully!")

        // Force a page refresh to show the new document
        window.location.href = `/document/${data.id}`
      } else {
        setError("No data returned from database")
        toast.error("Failed to create document")
      }
    } catch (err) {
      console.error("Unexpected error:", err)

      if (err instanceof Error) {
        if (err.message.includes("infinite recursion")) {
          setError("Database configuration error. Please run the fixed database schema.")
        } else {
          setError(`Error: ${err.message}`)
        }
      } else {
        setError("An unexpected error occurred")
      }

      toast.error("An error occurred while creating the document")
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", documentId).eq("owner_id", userId) // Only owner can delete

      if (error) {
        console.error("Delete error:", error)
        toast.error("Failed to delete document")
      } else {
        toast.success("Document deleted")
        // Refresh the page to update the document list
        window.location.reload()
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("An error occurred")
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const testDatabaseConnection = async () => {
    try {
      console.log("Testing database connection...")

      // Simple test query
      const { data, error } = await supabase.from("documents").select("id").limit(1)

      if (error) {
        console.error("Database test failed:", error)
        if (error.message.includes("infinite recursion")) {
          setError("Database policy recursion detected. Please run the fixed schema script.")
        } else {
          setError(`Database connection failed: ${error.message}`)
        }
      } else {
        console.log("Database test successful")
        setError("")
        toast.success("Database connection is working!")
      }
    } catch (err) {
      console.error("Database test error:", err)
      setError("Failed to connect to database")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Document Editor</h1>
              <Button onClick={createDocument} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "New Document"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={testDatabaseConnection}>
                  Test Database
                </Button>
                <Button variant="outline" size="sm" onClick={() => setError("")}>
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle
                      className="text-base truncate cursor-pointer"
                      onClick={() => router.push(`/document/${document.id}`)}
                    >
                      {document.title}
                    </CardTitle>
                    <CardDescription className="text-xs">Owned by you</CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/document/${document.id}`)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteDocument(document.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
<span>
  {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(document.updated_at))}
</span>
                  <Badge variant="default" className="text-xs">
                    Owner
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && !error && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms." : "Create your first document to get started."}
            </p>
            {!searchQuery && (
              <div className="space-y-2">
                <Button onClick={createDocument} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
                <div>
                  <Button variant="outline" size="sm" onClick={testDatabaseConnection}>
                    Test Database Connection
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
