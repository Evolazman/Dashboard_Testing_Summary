import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const [faqs, keywords] = await Promise.all([DatabaseService.getFAQs(), DatabaseService.getKeywords()])

    return NextResponse.json({
      success: true,
      data: {
        faqs,
        keywords,
      },
    })
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch FAQs",
      },
      { status: 500 },
    )
  }
}
