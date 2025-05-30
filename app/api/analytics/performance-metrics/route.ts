import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agentType = searchParams.get("agent_type")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const platform = searchParams.get("platform")
    const tester = searchParams.get("tester")

    // Build the query with filters
    let query = DatabaseService.supabase.from("performance_metrics").select("*")

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

    // Apply agent type filter
    if (agentType) {
      query = query.eq("agent_type", agentType)
    }

    // Apply platform filter (if we had a platform column)
    // This would need to be implemented based on your schema

    // Apply tester filter (if we had a tester column)
    // This would need to be implemented based on your schema

    // Order by date and created_at
    query = query.order("date_recorded", { ascending: false }).order("created_at", { ascending: false })

    const { data: metrics, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: metrics || [],
    })
  } catch (error) {
    console.error("Error fetching performance metrics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch performance metrics",
      },
      { status: 500 },
    )
  }
}
