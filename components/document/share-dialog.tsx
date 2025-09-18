"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Check, Search, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string
  documentTitle: string
}

interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
}

export function ShareDialog({ open, onOpenChange, documentId, documentTitle }: ShareDialogProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<"view" | "edit">("view")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)

  const supabase = createClient()
  const shareUrl = `${window.location.origin}/document/${documentId}`

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setSearching(true)
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, email, full_name, avatar_url")
          .or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
          .limit(10)

        setSearchResults(data || [])
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, supabase])

  const handleShare = async (userEmail?: string, userId?: string) => {
    const targetEmail = userEmail || email
    const targetUserId = userId

    if (!targetEmail) return

    setLoading(true)
    try {
      let profileId = targetUserId

      // If we don't have the user ID, look it up by email
      if (!profileId) {
        const { data: profiles } = await supabase.from("profiles").select("id").eq("email", targetEmail).single()

        if (!profiles) {
          toast.error("User not found. They need to create an account first.")
          return
        }
        profileId = profiles.id
      }

      // Check if permission already exists
      const { data: existingPermission } = await supabase
        .from("document_permissions")
        .select("id, permission_level")
        .eq("document_id", documentId)
        .eq("user_id", profileId)
        .single()

      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from("document_permissions")
          .update({ permission_level: permission })
          .eq("id", existingPermission.id)

        if (error) {
          toast.error("Failed to update permission")
        } else {
          toast.success(`Permission updated for ${targetEmail}`)
        }
      } else {
        // Add new permission
        const { error } = await supabase.from("document_permissions").upsert({
          document_id: documentId,
          user_id: profileId,
          permission_level: permission,
        })

        if (error) {
          toast.error("Failed to share document")
        } else {
          toast.success(`Document shared with ${targetEmail}`)
        }
      }

      setEmail("")
      setSearchQuery("")
      setSearchResults([])
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{documentTitle}"</DialogTitle>
          <DialogDescription>Share this document with others by email or link.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Share via link</Label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly />
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Search and invite users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{user.full_name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.full_name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={permission} onValueChange={(value: "view" | "edit") => setPermission(value)}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => handleShare(user.email, user.id)} disabled={loading}>
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searching && <div className="text-center py-4 text-sm text-muted-foreground">Searching users...</div>}

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">No users found</div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Invite by email</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
              <Select value={permission} onValueChange={(value: "view" | "edit") => setPermission(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => handleShare()} disabled={loading || !email}>
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
