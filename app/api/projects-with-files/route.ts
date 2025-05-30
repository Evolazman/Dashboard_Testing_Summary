import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("API: Starting to fetch projects with files...")

    // Get projects with file counts - sort by updated_at descending
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at
      `)
      .order("updated_at", { ascending: false })

    if (projectsError) {
      console.error("Error fetching projects:", projectsError)
      throw projectsError
    }

    console.log("API: Projects fetched:", projectsData?.length || 0)

    if (!projectsData || projectsData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get file counts for each project separately to avoid join issues
    const projectsWithFiles = await Promise.all(
      projectsData.map(async (project) => {
        try {
          // Count files for this project
          const { count: fileCount, error: countError } = await supabase
            .from("file_uploads")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id)

          if (countError) {
            console.error(`Error counting files for project ${project.id}:`, countError)
          }

          // Get recent files for this project
          const { data: recentFilesData, error: filesError } = await supabase
            .from("file_uploads")
            .select("file_name, created_at")
            .eq("project_id", project.id)
            .order("created_at", { ascending: false })
            .limit(5)

          if (filesError) {
            console.error(`Error fetching recent files for project ${project.id}:`, filesError)
          }

          return {
            id: project.id,
            name: project.name,
            description: project.description,
            status: "active", // Always set to active since column doesn't exist
            lastUpdated: project.updated_at,
            fileCount: fileCount || 0,
            recentFiles: recentFilesData?.map((file) => file.file_name) || [],
          }
        } catch (error) {
          console.error(`Error processing project ${project.id}:`, error)
          return {
            id: project.id,
            name: project.name,
            description: project.description,
            status: "active",
            lastUpdated: project.updated_at,
            fileCount: 0,
            recentFiles: [],
          }
        }
      }),
    )

    console.log("API: Projects with files processed:", projectsWithFiles.length)

    return NextResponse.json({
      success: true,
      data: projectsWithFiles,
    })
  } catch (error) {
    console.error("API Error in projects-with-files:", error)

    // Return a proper JSON error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch projects with files",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
}
