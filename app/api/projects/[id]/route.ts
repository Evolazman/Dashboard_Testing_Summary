import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: "Project ID is required",
        },
        { status: 400 },
      )
    }

    // ลบไฟล์อัปโหลดที่เกี่ยวข้องกับโปรเจกต์ก่อน
    const { error: fileDeleteError } = await DatabaseService.supabase
      .from("file_uploads")
      .delete()
      .eq("project_id", projectId)

    if (fileDeleteError) {
      console.error("Error deleting file uploads:", fileDeleteError)
      throw new Error("Failed to delete associated files")
    }

    // ลบ test sessions ที่เกี่ยวข้อง (ถ้ามี)
    const { error: sessionDeleteError } = await DatabaseService.supabase
      .from("test_sessions")
      .delete()
      .eq("project_id", projectId)

    if (sessionDeleteError) {
      console.error("Error deleting test sessions:", sessionDeleteError)
      // ไม่ throw error เพราะอาจจะไม่มี test sessions
    }

    // ลบโปรเจกต์
    const { error: deleteError } = await DatabaseService.supabase.from("projects").delete().eq("id", projectId)

    if (deleteError) {
      console.error("Error deleting project:", deleteError)
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: "Project and all associated data deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete project",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    const { data, error } = await DatabaseService.supabase.from("projects").select("*").eq("id", projectId).single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        status: "active", // Add default status
      },
    })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch project",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const body = await request.json()

    const updateData = {
      name: body.name,
      description: body.description,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await DatabaseService.supabase
      .from("projects")
      .update(updateData)
      .eq("id", projectId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        status: "active",
      },
    })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update project",
      },
      { status: 500 },
    )
  }
}
