import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const uploads = await DatabaseService.getFileUploads(10)

    return NextResponse.json({
      success: true,
      data: uploads,
    })
  } catch (error) {
    console.error("Error fetching file uploads:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch file uploads",
      },
      { status: 500 },
    )
  }
}
