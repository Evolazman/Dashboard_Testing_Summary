import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jbagpbxlzjnguapnrlth.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYWdwYnhsempuZ3VhcG5ybHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzI0NzYsImV4cCI6MjA2MzgwODQ3Nn0.Ka63YE0M-5dbYRbsFo5DpbdNf8fSxQMhKqKkw-VDu8Q"
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}
