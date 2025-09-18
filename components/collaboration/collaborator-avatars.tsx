"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface Collaborator {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  last_seen: string
}

interface CollaboratorAvatarsProps {
  documentId: string
}

export function CollaboratorAvatars({ documentId }: CollaboratorAvatarsProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchCollaborators = async () => {
      const { data } = await supabase
        .from("active_collaborators")
        .select(`
          user_id,
          last_seen,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("document_id", documentId)
        .gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 minutes

      if (data) {
        const activeCollaborators = data.map((item: { profiles: { id: any; full_name: any; email: any; avatar_url: any }; last_seen: any }) => ({
          id: item.profiles.id,
          full_name: item.profiles.full_name,
          email: item.profiles.email,
          avatar_url: item.profiles.avatar_url,
          last_seen: item.last_seen,
        }))
        setCollaborators(activeCollaborators)
      }
    }

    fetchCollaborators()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`collaborators:${documentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_collaborators",
          filter: `document_id=eq.${documentId}`,
        },
        () => {
          fetchCollaborators()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [documentId, supabase])

  if (collaborators.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {collaborators.slice(0, 3).map((collaborator) => (
          <Avatar key={collaborator.id} className="border-2 border-background w-8 h-8 text-gray-500">
            <AvatarImage src={collaborator.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">
              {collaborator.full_name?.charAt(0) || collaborator.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <Badge variant="secondary" className="text-xs">
        <Users className="w-3 h-3 mr-1" />
        {collaborators.length} active
      </Badge>
    </div>
  )
}
