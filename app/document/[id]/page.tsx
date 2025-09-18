import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DocumentEditor from "@/components/document/document-editor"

interface DocumentPageProps {
  params: {
    id: string
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has access to this document
  const { data: document, error } = await supabase
    .from("documents")
    .select(`
      *,
      document_permissions (
        permission_level,
        user_id
      ),
      profiles:owner_id (
        full_name,
        email
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !document) {
    redirect("/dashboard")
  }

  // Check permissions
  const isOwner = document.owner_id === user.id
  const permission = document.document_permissions.find((p: { user_id: string }) => p.user_id === user.id)
  const hasAccess = isOwner || permission

  if (!hasAccess) {
    redirect("/dashboard")
  }

  const canEdit = isOwner || permission?.permission_level === "edit" || permission?.permission_level === "admin"

  return <DocumentEditor document={document} canEdit={canEdit} isOwner={isOwner} userId={user.id} />
}
