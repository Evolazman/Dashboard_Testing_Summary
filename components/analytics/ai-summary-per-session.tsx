"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, MessageSquare, Clock, Star, Filter, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardFilters } from "../analytics-dashboard"

interface TestSession {
  id: string
  session_id: string
  platform: string
  duration_seconds: number
  summary: string
  ux_evaluation: string
  recommendations: string[]
  tester_name?: string
  created_at: string
}

type SortOption = "newest" | "oldest" | "duration_desc" | "duration_asc" | "platform"

interface AiSummaryPerSessionProps {
  filters?: DashboardFilters
}

export function AiSummaryPerSession({ filters }: AiSummaryPerSessionProps) {
  const [sessionData, setSessionData] = useState<TestSession[]>([])
  const [filteredData, setFilteredData] = useState<TestSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [filterPlatform, setFilterPlatform] = useState<string>("all")
  const [filterEvaluation, setFilterEvaluation] = useState<string>("all")

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true)

        // Build query parameters based on filters
        const params = new URLSearchParams()

        if (filters?.dateRange?.from) {
          params.append("from", filters.dateRange.from.toISOString())
        }
        if (filters?.dateRange?.to) {
          params.append("to", filters.dateRange.to.toISOString())
        }
        if (filters?.selectedPlatform && filters.selectedPlatform !== "all") {
          params.append("platform", filters.selectedPlatform)
        }
        if (filters?.selectedTester && filters.selectedTester !== "all") {
          params.append("tester", filters.selectedTester)
        }

        const response = await fetch(`/api/analytics/test-sessions?${params.toString()}`)
        const result = await response.json()

        if (result.success) {
          setSessionData(result.data)
          setFilteredData(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลเซสชันได้")
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [filters])

  // Apply sorting and filtering
  useEffect(() => {
    let filtered = [...sessionData]

    // Apply platform filter
    if (filterPlatform !== "all") {
      filtered = filtered.filter((session) => session.platform === filterPlatform)
    }

    // Apply evaluation filter
    if (filterEvaluation !== "all") {
      filtered = filtered.filter((session) => session.ux_evaluation === filterEvaluation)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "duration_desc":
          return b.duration_seconds - a.duration_seconds
        case "duration_asc":
          return a.duration_seconds - b.duration_seconds
        case "platform":
          return a.platform.localeCompare(b.platform)
        default:
          return 0
      }
    })

    setFilteredData(filtered)
  }, [sessionData, sortBy, filterPlatform, filterEvaluation])

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes} นาที ${remainingSeconds} วินาที`
  }

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString("th-TH")
  }

  const getUniqueValues = (key: keyof TestSession) => {
    return [...new Set(sessionData.map((session) => session[key]))]
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
            {[1, 2, 3].map((i) => (
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
          <CardTitle>เกิดข้อผิดพลาด</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (sessionData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Summary Per Session
          </CardTitle>
          <CardDescription>ยังไม่มีข้อมูลเซสชันการทดสอบในช่วงเวลาที่เลือก</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">ลองเปลี่ยนช่วงวันที่หรือตัวกรองอื่นๆ</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Summary Per Session
        </CardTitle>
        <CardDescription>
          Detailed analysis of individual testing sessions with UX evaluation and recommendations
        </CardDescription>

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
                <SelectItem value="duration_desc">ระยะเวลานานสุด</SelectItem>
                <SelectItem value="duration_asc">ระยะเวลาสั้นสุด</SelectItem>
                <SelectItem value="platform">แพลตฟอร์ม A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="แพลตฟอร์ม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {getUniqueValues("platform").map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <Select value={filterEvaluation} onValueChange={setFilterEvaluation}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="คะแนน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {getUniqueValues("ux_evaluation").map((evaluation) => (
                  <SelectItem key={evaluation} value={evaluation}>
                    {evaluation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground flex items-center">
            แสดง {filteredData.length} จาก {sessionData.length} เซสชัน
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {filteredData.map((session) => (
              <Card key={session.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {/* Session Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{session.platform}</Badge>
                        <span className="text-sm text-muted-foreground">{formatTimestamp(session.created_at)}</span>
                        {session.tester_name && (
                          <Badge variant="secondary" className="text-xs">
                            {session.tester_name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDuration(session.duration_seconds)}</span>
                      </div>
                    </div>

                    {/* UX Evaluation */}
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">UX Evaluation:</span>
                      <Badge className={getEvaluationColor(session.ux_evaluation)}>{session.ux_evaluation}</Badge>
                    </div>

                    {/* Session Summary */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Session Summary</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{session.summary}</p>
                    </div>

                    {/* AI Recommendations */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">AI-Generated Recommendations</h4>
                      <ul className="space-y-1">
                        {session.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        View Full Session Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

const getEvaluationColor = (evaluation: string) => {
  switch (evaluation) {
    case "Good":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Fair":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Poor":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}
