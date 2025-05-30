"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { FileCheck, FileX, Calendar, Filter } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

type Upload = {
  id: string
  file_name: string
  original_file_name: string
  project_id: string
  agent_id: string
  status: "success" | "error"
  created_at: string
  projects?: { name: string }
  agents?: { name: string }
}

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc" | "status"

export function RecentUploads() {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [filteredUploads, setFilteredUploads] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const fetchUploads = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/file-uploads")
      const result = await response.json()

      if (result.success) {
        setUploads(result.data)
        setFilteredUploads(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error("Error fetching uploads:", err)
      setError("ไม่สามารถโหลดข้อมูลการอัปโหลดได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUploads()
  }, [])

  // Apply sorting and filtering
  useEffect(() => {
    let filtered = [...uploads]

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((upload) => upload.status === filterStatus)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name_asc":
          return a.file_name.localeCompare(b.file_name)
        case "name_desc":
          return b.file_name.localeCompare(a.file_name)
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    setFilteredUploads(filtered)
  }, [uploads, sortBy, filterStatus])

  // Listen for new uploads from the form component
  useEffect(() => {
    const handleNewUpload = () => {
      fetchUploads() // Refresh data from database
    }

    window.addEventListener("new-upload" as any, handleNewUpload)
    return () => window.removeEventListener("new-upload" as any, handleNewUpload)
  }, [])

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
        </CardContent>
      </Card>
    )
  }

  if (uploads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>การอัปโหลดล่าสุด</CardTitle>
          <CardDescription>การอัปโหลดไฟล์ล่าสุดของคุณจะปรากฏที่นี่</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">ยังไม่มีการอัปโหลด</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>การอัปโหลดล่าสุด</CardTitle>
        <CardDescription>การอัปโหลดไฟล์ล่าสุดของคุณไปยัง webhook</CardDescription>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">ล่าสุดก่อน</SelectItem>
                <SelectItem value="oldest">เก่าสุดก่อน</SelectItem>
                <SelectItem value="name_asc">ชื่อไฟล์ A-Z</SelectItem>
                <SelectItem value="name_desc">ชื่อไฟล์ Z-A</SelectItem>
                <SelectItem value="status">สถานะ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="success">สำเร็จ</SelectItem>
                <SelectItem value="error">ล้มเหลว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground flex items-center">
            แสดง {filteredUploads.length} จาก {uploads.length} ไฟล์
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อไฟล์</TableHead>
              <TableHead>โปรเจกต์</TableHead>
              <TableHead>เอเจนต์</TableHead>
              <TableHead>เวลา</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUploads.map((upload) => (
              <TableRow key={upload.id}>
                <TableCell className="font-medium">{upload.file_name}</TableCell>
                <TableCell>{upload.projects?.name || "ไม่ระบุ"}</TableCell>
                <TableCell>{upload.agents?.name || "ไม่ระบุ"}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(upload.created_at), { addSuffix: true, locale: th })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(upload.created_at).toLocaleString("th-TH")}
                  </div>
                </TableCell>
                <TableCell>
                  {upload.status === "success" ? (
                    <div className="flex items-center text-green-600">
                      <FileCheck className="h-4 w-4 mr-1" />
                      <span>สำเร็จ</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <FileX className="h-4 w-4 mr-1" />
                      <span>ล้มเหลว</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
