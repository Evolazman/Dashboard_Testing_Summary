"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderOpen, FileText, Calendar, Settings, Plus, Edit, Trash2, MoreHorizontal, Filter } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { CreateProjectDialog } from "./create-project-dialog"
import { EditProjectDialog } from "./edit-project-dialog"
import { DeleteProjectDialog } from "./delete-project-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectWithFiles {
  id: string
  name: string
  description?: string
  fileCount: number
  lastUpdated: string
  status: string
  recentFiles: string[]
}

type SortOption = "updated_desc" | "updated_asc" | "name_asc" | "name_desc" | "files_desc" | "files_asc"

export function ProjectManagement() {
  const [projects, setProjects] = useState<ProjectWithFiles[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithFiles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("updated_desc")

  const fetchProjectsWithFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/projects-with-files")
      const result = await response.json()

      if (result.success) {
        setProjects(result.data)
        setFilteredProjects(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError("ไม่สามารถโหลดข้อมูลโปรเจกต์ได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectsWithFiles()
  }, [])

  // Apply sorting
  useEffect(() => {
    const sorted = [...projects].sort((a, b) => {
      switch (sortBy) {
        case "updated_desc":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case "updated_asc":
          return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        case "name_asc":
          return a.name.localeCompare(b.name)
        case "name_desc":
          return b.name.localeCompare(a.name)
        case "files_desc":
          return b.fileCount - a.fileCount
        case "files_asc":
          return a.fileCount - b.fileCount
        default:
          return 0
      }
    })
    setFilteredProjects(sorted)
  }, [projects, sortBy])

  const handleProjectCreated = () => {
    fetchProjectsWithFiles()
  }

  const handleProjectUpdated = () => {
    fetchProjectsWithFiles()
  }

  const handleProjectDeleted = () => {
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
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
          <CardTitle className="text-red-600">เกิดข้อผิดพลาด</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchProjectsWithFiles} className="mt-4">
            ลองใหม่
          </Button>
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
              <Settings className="h-5 w-5" />
              จัดการโปรเจกต์
            </CardTitle>
            <CardDescription>สร้าง แก้ไข และลบโปรเจกต์ของคุณ</CardDescription>
          </div>
          <CreateProjectDialog onProjectCreated={handleProjectCreated} />
        </div>

        {/* Sorting Controls */}
        {projects.length > 0 && (
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated_desc">อัปเดตล่าสุดก่อน</SelectItem>
                  <SelectItem value="updated_asc">อัปเดตเก่าสุดก่อน</SelectItem>
                  <SelectItem value="name_asc">ชื่อ A-Z</SelectItem>
                  <SelectItem value="name_desc">ชื่อ Z-A</SelectItem>
                  <SelectItem value="files_desc">ไฟล์มากสุดก่อน</SelectItem>
                  <SelectItem value="files_asc">ไฟล์น้อยสุดก่อน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">แสดง {filteredProjects.length} โปรเจกต์</div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มีโปรเจกต์</h3>
            <p className="text-muted-foreground mb-4">เริ่มต้นด้วยการสร้างโปรเจกต์แรกของคุณ</p>
            <CreateProjectDialog
              onProjectCreated={handleProjectCreated}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  สร้างโปรเจกต์แรก
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อโปรเจกต์</TableHead>
                    <TableHead>คำอธิบาย</TableHead>
                    <TableHead>จำนวนไฟล์</TableHead>
                    <TableHead>อัปเดตล่าสุด</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-primary" />
                          <span className="font-medium">{project.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{project.description || "ไม่มีคำอธิบาย"}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{project.fileCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(project.lastUpdated), {
                                addSuffix: true,
                                locale: th,
                              })}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(project.lastUpdated).toLocaleString("th-TH")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge  variant={project.status === "active" ? "default" : "secondary"}>
                          {project.status === "active" ? "ใช้งาน" : "ไม่ใช้งาน"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <EditProjectDialog
                              projectId={project.id}
                              projectName={project.name}
                              projectDescription={project.description}
                              onProjectUpdated={handleProjectUpdated}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  แก้ไข
                                </DropdownMenuItem>
                              }
                            />
                            <DropdownMenuSeparator />
                            <DeleteProjectDialog
                              projectId={project.id}
                              projectName={project.name}
                              fileCount={project.fileCount}
                              onProjectDeleted={handleProjectDeleted}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  ลบ
                                </DropdownMenuItem>
                              }
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Project Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <FolderOpen className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold truncate">{project.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={project.status === "active" ? "default" : "secondary"} className="text-xs">
                            {project.status === "active" ? "ใช้งาน" : "ไม่ใช้งาน"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <EditProjectDialog
                                projectId={project.id}
                                projectName={project.name}
                                projectDescription={project.description}
                                onProjectUpdated={handleProjectUpdated}
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    แก้ไข
                                  </DropdownMenuItem>
                                }
                              />
                              <DropdownMenuSeparator />
                              <DeleteProjectDialog
                                projectId={project.id}
                                projectName={project.name}
                                fileCount={project.fileCount}
                                onProjectDeleted={handleProjectDeleted}
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    ลบ
                                  </DropdownMenuItem>
                                }
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Description */}
                      {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{project.fileCount} ไฟล์</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(project.lastUpdated), {
                                addSuffix: true,
                                locale: th,
                              })}
                            </span>
                          </div>
                          <div className="text-xs">{new Date(project.lastUpdated).toLocaleString("th-TH")}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
