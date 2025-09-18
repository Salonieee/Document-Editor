import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Dashboard from "@/components/dashboard/dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Ensure user profile exists
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If profile doesn't exist, create it
  if (profileError && profileError.code === "PGRST116") {
    console.log("Creating missing profile for user:", user.id)

    const { error: insertError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.email!,
    })

    if (insertError) {
      console.error("Failed to create profile:", insertError)
      // Continue anyway, the app might still work
    }
  }

  // Fetch documents with simpler query to avoid recursion
  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select(`
      *,
      profiles:owner_id (
        full_name,
        email
      )
    `)
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })

  if (documentsError) {
    console.error("Error fetching documents:", documentsError)
  }

  return <Dashboard documents={documents || []} userId={user.id} />
}
