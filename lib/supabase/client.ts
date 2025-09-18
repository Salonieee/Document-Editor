import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check if environment variables are missing
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Missing Supabase environment variables!")
      console.error("Please create a .env.local file with your Supabase credentials.")
      console.error("See .env.example for the required format.")

      // Return a mock client that will show helpful errors
      return {
        auth: {
          signInWithPassword: () =>
            Promise.resolve({
              data: null,
              error: { message: "Supabase not configured. Please add your environment variables." },
            }),
          signUp: () =>
            Promise.resolve({
              data: null,
              error: { message: "Supabase not configured. Please add your environment variables." },
            }),
          signOut: () => Promise.resolve({ error: null }),
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          select: () => ({ data: [], error: null }),
          insert: () => ({ data: null, error: { message: "Supabase not configured" } }),
          update: () => ({ data: null, error: { message: "Supabase not configured" } }),
          delete: () => ({ data: null, error: { message: "Supabase not configured" } }),
        }),
      } as any
    }

    // Validate URL format
    if (!supabaseUrl.includes(".supabase.co")) {
      console.error("❌ Invalid Supabase URL format!")
      console.error("Expected format: https://your-project-id.supabase.co")
      console.error("Current URL:", supabaseUrl)
    }

    console.log("✅ Creating Supabase client with URL:", supabaseUrl)

    try {
      supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    } catch (error) {
      console.error("❌ Failed to create Supabase client:", error)
      throw error
    }
  }
  return supabaseClient
}
