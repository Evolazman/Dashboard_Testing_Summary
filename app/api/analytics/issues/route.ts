import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const issues = await DatabaseService.getIssues()

    return NextResponse.json({
      success: true,
      data: issues,
    })
  } catch (error) {
    console.error("Error fetching issues:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch issues",
      },
      { status: 500 },
    )
  }
}
