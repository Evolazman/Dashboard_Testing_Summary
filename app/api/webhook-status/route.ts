import { NextResponse } from "next/server"

export async function GET() {
  try {
    const webhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
      "http://localhost:5678/webhook-test/ab1b6138-5ee7-4aac-8522-39b5f1f3456e"

    if (!webhookUrl) {
      return NextResponse.json(
        {
          available: false,
          error: "N8N_WEBHOOK_URL environment variable is not set",
        },
        { status: 500 },
      )
    }

    // For localhost URLs, we'll do a simple connectivity check
    if (webhookUrl.includes("localhost") || webhookUrl.includes("127.0.0.1")) {
      try {
        // Try to make a simple GET request to check if the server is running
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(webhookUrl.replace("/webhook-test/", "/"), {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent": "CSV-Dashboard-Health-Check",
          },
        })

        clearTimeout(timeoutId)

        // If we get any response (even 404), the server is running
        return NextResponse.json({
          available: true,
          status: response.status,
          statusText: response.statusText,
          message: "n8n server is running",
          url: webhookUrl,
        })
      } catch (error) {
        // If it's a localhost URL and we can't connect, it's likely the server is down
        return NextResponse.json({
          available: false,
          error: "Cannot connect to n8n server. Make sure n8n is running on localhost:5678",
          details: error instanceof Error ? error.message : "Connection failed",
          url: webhookUrl,
        })
      }
    }

    // For remote URLs, try a HEAD request
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(webhookUrl, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "CSV-Dashboard-Health-Check",
        },
      })

      clearTimeout(timeoutId)

      return NextResponse.json({
        available: response.status < 500,
        status: response.status,
        statusText: response.statusText,
        url: webhookUrl,
      })
    } catch (error) {
      return NextResponse.json({
        available: false,
        error: "Webhook endpoint is not responding",
        details: error instanceof Error ? error.message : "Connection failed",
        url: webhookUrl,
      })
    }
  } catch (error) {
    console.error("Error in webhook status check:", error)
    return NextResponse.json(
      {
        available: false,
        error: "Internal server error while checking webhook status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
