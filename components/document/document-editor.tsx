"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import RichTextEditor from "@/components/editor/rich-text-editor"
import { CollaboratorAvatars } from "@/components/collaboration/collaborator-avatars"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Share2, Save, ArrowLeft, Moon, Sun, Users, Eye, Edit, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { ShareDialog } from "./share-dialog"
import { PermissionsDialog } from "./permissions-dialog"
import { toast } from "sonner"

interface DocumentEditorProps {
  document: any
  canEdit: boolean
  isOwner: boolean
  userId: string
}

export default function DocumentEditor({ document, canEdit, isOwner, userId }: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title)
  const [content, setContent] = useState(document.content)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)

  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()

  // Initialize editor content
  useEffect(() => {
    // Ensure content has the proper structure
    if (!content || !content.type) {
      setContent({
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
      })
    }
    setLoading(false)
  }, [content])

  // Update presence
  useEffect(() => {
    const updatePresence = async () => {
      try {
        await supabase.from("active_collaborators").upsert({
          document_id: document.id,
          user_id: userId,
          last_seen: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Failed to update presence:", error)
      }
    }

    updatePresence()
    const interval = setInterval(updatePresence, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [document.id, userId, supabase])

  const handleSave = async () => {
    if (!canEdit) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("documents")
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
          last_edited_by: userId,
        })
        .eq("id", document.id)

      if (error) {
        console.error("Save failed:", error)
        toast.error("Failed to save document")
      } else {
        setLastSaved(new Date())
        toast.success("Document saved")
      }
    } catch (error) {
      console.error("Save failed:", error)
      toast.error("Failed to save document")
    } finally {
      setSaving(false)
    }
  }

  const handleContentUpdate = (newContent: any) => {
    setContent(newContent)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading document...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  className="text-lg font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0 min-w-[200px]"
                  disabled={!canEdit}
                  placeholder="Document title"
                />
                <Badge variant={canEdit ? "default" : "secondary"}>
                  {canEdit ? <Edit className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  {canEdit ? "Editor" : "Viewer"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CollaboratorAvatars documentId={document.id} />

              {lastSaved && (
                <span className="text-sm text-muted-foreground">Saved {lastSaved.toLocaleTimeString()}</span>
              )}

              {canEdit && (
                <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={() => setShareDialogOpen(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              {isOwner && (
                <Button variant="ghost" size="sm" onClick={() => setPermissionsDialogOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Permissions
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="container mx-auto px-4 py-6">
        <RichTextEditor content={content} documentId={document.id} onUpdate={handleContentUpdate} editable={canEdit} />
      </main>

      {/* Dialogs */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        documentId={document.id}
        documentTitle={title}
      />

      {isOwner && (
        <PermissionsDialog
          open={permissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          documentId={document.id}
        />
      )}
    </div>
  )
}
