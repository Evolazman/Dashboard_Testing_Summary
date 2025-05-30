import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    console.log("GET /api/projects called") // Debug log
    const projects = await DatabaseService.getProjects()
    console.log("Projects fetched:", projects.length) // Debug log

    return NextResponse.json({
      success: true,
      data: projects,
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/projects called") // Debug log

    const body = await request.json()
    console.log("Request body:", body) // Debug log

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Project name is required",
        },
        { status: 400 },
      )
    }

    const projectData = {
      name: body.name.trim(),
      description: body.description?.trim() || null,
    }

    console.log("Creating project with data:", projectData) // Debug log

    const project = await DatabaseService.createProject(projectData)
    console.log("Project created successfully:", project) // Debug log

    return NextResponse.json({
      success: true,
      data: project,
      message: "Project created successfully",
    })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
