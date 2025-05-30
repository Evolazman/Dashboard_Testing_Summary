import { supabase } from "./supabase"

// Types for database tables
export interface Project {
  id: string
  name: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  name: string
  type: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface TestSession {
  id: string
  session_id: string
  project_id: string
  agent_id: string
  platform: string
  duration_seconds: number
  summary?: string
  ux_evaluation?: string
  recommendations?: string[]
  tester_name?: string
  created_at: string
  updated_at: string
}

export interface PerformanceMetric {
  id: string
  metric_name: string
  metric_value: number
  current_count: number
  total_count: number
  agent_type: string
  date_recorded: string
  created_at: string
}

export interface Issue {
  id: string
  issue_type: string
  description: string
  frequency: number
  impact_level: string
  platforms: string[]
  trend: string
  change_percentage: number
  created_at: string
  updated_at: string
}

export interface FAQ {
  id: string
  question: string
  category?: string
  frequency: number
  keywords?: string[]
  percentage?: number
  created_at: string
  updated_at: string
}

export interface Keyword {
  id: string
  keyword: string
  count: number
  size_class?: string
  created_at: string
  updated_at: string
}

export interface ResponseTime {
  id: string
  time_slot: string
  chatbot_time: number
  voicebot_time: number
  date_recorded: string
  created_at: string
}

export interface PlatformStatistic {
  id: string
  platform_name: string
  usage_percentage: number
  session_count: number
  growth_percentage?: number
  icon_name?: string
  color_class?: string
  date_recorded: string
  created_at: string
}

export interface TestCase {
  id: string
  category: string
  value: number
  count: number
  color_class?: string
  text_color_class?: string
  trend: string
  change_percentage: number
  created_at: string
  updated_at: string
}

export interface FileUpload {
  id: string
  file_name: string
  original_file_name: string
  project_id: string
  agent_id: string
  file_content?: string
  file_size?: number
  webhook_url?: string
  status: string
  created_at: string
}

export interface ASRDetail {
  id: string
  metric_name: string
  metric_value: number
  description?: string
  color_class?: string
  date_recorded: string
  created_at: string
}

// Database functions
export class DatabaseService {
  static supabase = supabase

  // Projects - Simplified to avoid status column issues
  static async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description, created_at, updated_at")
      .order("updated_at", { ascending: false }) // Sort by most recently updated

    if (error) throw error

    // Add default status for compatibility
    return (data || []).map((project) => ({
      ...project,
      status: "active",
    }))
  }

  static async createProject(project: Omit<Project, "id" | "created_at" | "updated_at" | "status">): Promise<Project> {
    try {
      console.log("DatabaseService.createProject called with:", project) // Debug log

      // Validate input
      if (!project.name || !project.name.trim()) {
        throw new Error("Project name is required")
      }

      const projectData = {
        name: project.name.trim(),
        description: project.description?.trim() || null,
      }

      console.log("Inserting project data:", projectData) // Debug log

      const { data, error } = await supabase.from("projects").insert([projectData]).select().single()

      if (error) {
        console.error("Supabase error:", error) // Debug log
        throw error
      }

      if (!data) {
        throw new Error("No data returned from database")
      }

      console.log("Project created in database:", data) // Debug log

      return {
        ...data,
        status: "active", // Add default status for compatibility
      }
    } catch (error) {
      console.error("Error in DatabaseService.createProject:", error)
      throw error
    }
  }

  // Projects - เพิ่มฟังก์ชันลบแบบ cascade
  static async deleteProjectCascade(projectId: string): Promise<void> {
    try {
      // ลบไฟล์อัปโหลดที่เกี่ยวข้องก่อน
      const { error: fileDeleteError } = await supabase.from("file_uploads").delete().eq("project_id", projectId)

      if (fileDeleteError) {
        console.error("Error deleting file uploads:", fileDeleteError)
        throw new Error("Failed to delete associated files")
      }

      // ลบ test sessions ที่เกี่ยวข้อง (ถ้ามี)
      const { error: sessionDeleteError } = await supabase.from("test_sessions").delete().eq("project_id", projectId)

      if (sessionDeleteError) {
        console.error("Error deleting test sessions:", sessionDeleteError)
        // ไม่ throw error เพราะอาจจะไม่มี test sessions
      }

      // ลบโปรเจกต์
      const { error: projectDeleteError } = await supabase.from("projects").delete().eq("id", projectId)

      if (projectDeleteError) {
        console.error("Error deleting project:", projectDeleteError)
        throw projectDeleteError
      }

      console.log(`Project ${projectId} and all associated data deleted successfully`)
    } catch (error) {
      console.error("Error in deleteProjectCascade:", error)
      throw error
    }
  }

  static async getProjectWithFileCount(projectId: string): Promise<{ project: Project; fileCount: number } | null> {
    try {
      // ดึงข้อมูลโปรเจกต์
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (projectError || !project) {
        return null
      }

      // นับจำนวนไฟล์
      const { count: fileCount, error: countError } = await supabase
        .from("file_uploads")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId)

      if (countError) {
        console.error("Error counting files:", countError)
      }

      return {
        project: { ...project, status: "active" },
        fileCount: fileCount || 0,
      }
    } catch (error) {
      console.error("Error getting project with file count:", error)
      return null
    }
  }

  // Agents - Simplified to avoid status column issues
  static async getAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from("agents")
      .select("id, name, type, description, created_at, updated_at")
      .order("created_at", { ascending: false }) // Sort by most recently created

    if (error) throw error

    // Add default status for compatibility
    return (data || []).map((agent) => ({
      ...agent,
      status: "active",
    }))
  }

  static async createAgent(agent: Omit<Agent, "id" | "created_at" | "updated_at">): Promise<Agent> {
    // Create without status column
    const agentData = {
      name: agent.name,
      type: agent.type,
      description: agent.description,
    }

    const { data, error } = await supabase.from("agents").insert([agentData]).select().single()

    if (error) throw error

    return {
      ...data,
      status: "active",
    }
  }

  // Test Sessions - Sort by created_at descending (newest first)
  static async getTestSessions(): Promise<TestSession[]> {
    const { data, error } = await supabase.from("test_sessions").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createTestSession(session: Omit<TestSession, "id" | "created_at" | "updated_at">): Promise<TestSession> {
    const { data, error } = await supabase.from("test_sessions").insert([session]).select().single()

    if (error) throw error
    return data
  }

  // Performance Metrics - Sort by date_recorded and created_at
  static async getPerformanceMetrics(agentType?: string): Promise<PerformanceMetric[]> {
    let query = supabase
      .from("performance_metrics")
      .select("*")
      .order("date_recorded", { ascending: false })
      .order("created_at", { ascending: false })

    if (agentType) {
      query = query.eq("agent_type", agentType)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getChatbotPerformanceMetrics(): Promise<PerformanceMetric[]> {
    const { data, error } = await supabase
      .from("chatbot_performance_metrics")
      .select("*")
      .order("date_recorded", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Issues - Sort by frequency (highest first) and updated_at
  static async getIssues(): Promise<Issue[]> {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("frequency", { ascending: false })
      .order("updated_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // FAQs - Sort by frequency (highest first) and updated_at
  static async getFAQs(): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("frequency", { ascending: false })
      .order("updated_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Keywords - Sort by count (highest first) and updated_at
  static async getKeywords(): Promise<Keyword[]> {
    const { data, error } = await supabase
      .from("keywords")
      .select("*")
      .order("count", { ascending: false })
      .order("updated_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Response Times - Sort by time_slot and date_recorded
  static async getResponseTimes(): Promise<ResponseTime[]> {
    const { data, error } = await supabase
      .from("response_times")
      .select("*")
      .order("date_recorded", { ascending: false })
      .order("time_slot")

    if (error) throw error
    return data || []
  }

  // Platform Statistics - Sort by usage_percentage and date_recorded
  static async getPlatformStatistics(): Promise<PlatformStatistic[]> {
    const { data, error } = await supabase
      .from("platform_statistics")
      .select("*")
      .order("date_recorded", { ascending: false })
      .order("usage_percentage", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Test Cases - Sort by value and updated_at
  static async getTestCases(): Promise<TestCase[]> {
    const { data, error } = await supabase
      .from("test_cases")
      .select("*")
      .order("value", { ascending: false })
      .order("updated_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // File Uploads - Sort by created_at descending (newest first)
  static async createFileUpload(upload: Omit<FileUpload, "id" | "created_at">): Promise<FileUpload> {
    const { data, error } = await supabase.from("file_uploads").insert([upload]).select().single()

    if (error) throw error
    return data
  }

  static async getFileUploads(limit = 10): Promise<FileUpload[]> {
    const { data, error } = await supabase
      .from("file_uploads")
      .select(`
        *,
        projects(name),
        agents(name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // ASR Details - Sort by date_recorded and created_at
  static async getASRDetails(): Promise<ASRDetail[]> {
    const { data, error } = await supabase
      .from("asr_details")
      .select("*")
      .order("date_recorded", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }
}
