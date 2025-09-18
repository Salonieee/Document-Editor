"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Permission {
  id: string
  permission_level: string
  user_id: string
  profiles: {
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface PermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string
}

export function PermissionsDialog({ open, onOpenChange, documentId }: PermissionsDialogProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchPermissions()
    }
  }, [open])

  const fetchPermissions = async () => {
    const { data } = await supabase
      .from("document_permissions")
      .select(`
        id,
        permission_level,
        user_id,
        profiles:user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("document_id", documentId)

    if (data) {
      setPermissions(data)
    }
  }

  const updatePermission = async (permissionId: string, newLevel: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("document_permissions")
        .update({ permission_level: newLevel })
        .eq("id", permissionId)

      if (error) {
        toast.error("Failed to update permission")
      } else {
        toast.success("Permission updated")
        fetchPermissions()
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const removePermission = async (permissionId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("document_permissions").delete().eq("id", permissionId)

      if (error) {
        toast.error("Failed to remove permission")
      } else {
        toast.success("Access removed")
        fetchPermissions()
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>Control who can access and edit this document.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collaborators yet.</p>
          ) : (
            permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={permission.profiles.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {permission.profiles.full_name?.charAt(0) || permission.profiles.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{permission.profiles.full_name}</p>
                    <p className="text-xs text-muted-foreground">{permission.profiles.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={permission.permission_level}
                    onValueChange={(value) => updatePermission(permission.id, value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" size="sm" onClick={() => removePermission(permission.id)} disabled={loading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
