import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const platform = searchParams.get("platform")
    const tester = searchParams.get("tester")

    // Build the query with filters
    let query = DatabaseService.supabase.from("test_sessions").select("*")

    // Apply date range filter
    if (from && to) {
      query = query.gte("created_at", new Date(from).toISOString()).lte("created_at", new Date(to).toISOString())
    } else if (from) {
      query = query.gte("created_at", new Date(from).toISOString())
    } else if (to) {
      query = query.lte("created_at", new Date(to).toISOString())
    }

    // Apply platform filter
    if (platform && platform !== "all") {
      query = query.eq("platform", platform)
    }

    // Apply tester filter
    if (tester && tester !== "all") {
      query = query.eq("tester_name", tester)
    }

    // Order by created_at descending
    query = query.order("created_at", { ascending: false })

    const { data: sessions, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: sessions || [],
    })
  } catch (error) {
    console.error("Error fetching test sessions:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch test sessions",
      },
      { status: 500 },
    )
  }
}
