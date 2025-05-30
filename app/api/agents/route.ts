import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const agents = await DatabaseService.getAgents()

    return NextResponse.json({
      success: true,
      data: agents,
    })
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch agents",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const agent = await DatabaseService.createAgent(body)

    return NextResponse.json({
      success: true,
      data: agent,
    })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create agent",
      },
      { status: 500 },
    )
  }
}
