import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient("https://jbagpbxlzjnguapnrlth.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYWdwYnhsempuZ3VhcG5ybHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzI0NzYsImV4cCI6MjA2MzgwODQ3Nn0.Ka63YE0M-5dbYRbsFo5DpbdNf8fSxQMhKqKkw-VDu8Q")

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agentType = searchParams.get("agent_type")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const fileUploadId = searchParams.get("file_upload_id")

    // Build the query with filters
    let query = supabase.from("dashboard_summary").select(`
        *,
        file_uploads!inner(
          id,
          project_id,
          file_name,
          original_file_name,
          agent_type,
          platform,
          tester_name,
          created_at,
          projects!inner(
            id,
            name,
            description
          )
        )
      `)

    // Apply agent type filter
    if (agentType && agentType !== "all") {
      query = query.eq("agent_type", agentType)
    }

    // Apply date range filter
    if (from && to) {
      query = query
        .gte("date_recorded", new Date(from).toISOString().split("T")[0])
        .lte("date_recorded", new Date(to).toISOString().split("T")[0])
    } else if (from) {
      query = query.gte("date_recorded", new Date(from).toISOString().split("T")[0])
    } else if (to) {
      query = query.lte("date_recorded", new Date(to).toISOString().split("T")[0])
    }

    // Apply file upload filter
    if (fileUploadId) {
      query = query.eq("file_upload_id", fileUploadId)
    }

    // Order by date and created_at
    query = query.order("date_recorded", { ascending: false }).order("created_at", { ascending: false })

    const { data: summaries, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: summaries || [],
    })
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard summary",
      },
      { status: 500 },
    )
  }
}
