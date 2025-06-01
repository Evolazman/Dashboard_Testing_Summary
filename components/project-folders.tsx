"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FolderOpen, FileText, Eye, Calendar, Settings, AlertCircle , Upload } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { CreateProjectDialog } from "./create-project-dialog"

interface ProjectWithFiles {
  id: string
  name: string
  description?: string
  fileCount: number
  lastUpdated: string
  status: string
  recentFiles: string[]
}

export function ProjectFolders() {
  const [projects, setProjects] = useState<ProjectWithFiles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjectsWithFiles = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching projects with files...")

      const response = await fetch("/api/projects-with-files")

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response not OK:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Response is not JSON:", responseText)
        throw new Error(`Expected JSON response, got: ${contentType}. Response: ${responseText.slice(0, 200)}...`)
      }

      const result = await response.json()
      console.log("API Response:", result)

      if (result.success) {
        setProjects(result.data || [])
      } else {
        setError(result.error || "Unknown error occurred")
      }
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลโปรเจกต์ได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectsWithFiles()
  }, [])

  const handleProjectCreated = () => {
    // Refresh the projects list
    fetchProjectsWithFiles()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            เกิดข้อผิดพลาด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-500 text-sm">{error}</p>
            <div className="flex gap-2">
              <Button onClick={fetchProjectsWithFiles} size="sm">
                ลองใหม่
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Current error:", error)
                  console.log("Projects state:", projects)
                }}
              >
                Debug Info
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Recent Update
              </CardTitle>
              <CardDescription>ยังไม่มีโปรเจกต์ในระบบ</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มีโปรเจกต์</h3>
            <p className="text-muted-foreground mb-4">เริ่มต้นด้วยการสร้างโปรเจกต์แรกของคุณ</p>
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Recent Update
            </CardTitle>
            <CardDescription>โปรเจกต์ที่มีการอัปเดตล่าสุดพร้อมจำนวนไฟล์</CardDescription>
          </div>
          <Button  variant="ghost" size="sm" className="text-primary">
            <Eye className="h-4 w-4 mr-1" />
            ดูทั้งหมด
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 5).map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Project Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-sm truncate flex-1">{project.name}</h3>
                    </div>
                    <Badge variant={project.status === "active" ? "default" : "secondary"} className="text-xs">
                      {project.status === "active" ? "ใช้งาน" : "ไม่ใช้งาน"}
                    </Badge>
                  </div>

                  {/* File Count */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>มี {project.fileCount} ไฟล์</span>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                  )}

                  {/* Recent Files Preview */}
                  {project.recentFiles.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">ไฟล์ล่าสุด:</p>
                      <div className="space-y-1">
                        {project.recentFiles.slice(0, 2).map((fileName, index) => (
                          <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                            <span className="truncate">{fileName}</span>
                          </div>
                        ))}
                        {project.recentFiles.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            และอีก {project.recentFiles.length - 2} ไฟล์
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="h-3 w-3" />
                    <span>
                      อัปเดต{" "}
                      {formatDistanceToNow(new Date(project.lastUpdated), {
                        addSuffix: true,
                        locale: th,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              จัดการโปรเจกต์
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
