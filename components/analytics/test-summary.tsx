"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare, AlertTriangle, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardFilters } from "../analytics-dashboard"

interface SummaryData {
  totalTests: number
  issuesDetected: number
  averageSessionDuration: string
  commonQuestionTypes: Array<{
    type: string
    count: number
  }>
}

interface TestSummaryProps {
  filters?: DashboardFilters
}

export function TestSummary({ filters }: TestSummaryProps) {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSummaryData() {
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

        const response = await fetch(`/api/dashboard-summary?${params.toString()}`)
        const result = await response.json()

        if (result.success && result.data.length > 0) {
          // Aggregate data from all summaries
          const summaries = result.data

          const totalTests = summaries.reduce((sum: number, summary: any) => sum + (summary.total_tests || 0), 0)
          const issuesDetected = summaries.reduce((sum: number, summary: any) => sum + (summary.total_issues || 0), 0)

          // Calculate average session duration
          const totalDuration = summaries.reduce(
            (sum: number, summary: any) => sum + (summary.avg_session_duration || 0),
            0,
          )
          const avgDurationSeconds = summaries.length > 0 ? Math.floor(totalDuration / summaries.length) : 0
          const avgMinutes = Math.floor(avgDurationSeconds / 60)
          const avgSeconds = avgDurationSeconds % 60
          const averageSessionDuration = `${avgMinutes} นาที ${avgSeconds} วินาที`

          // Get common question types from all summaries
          const allQuestionTypes: string[] = []
          summaries.forEach((summary: any) => {
            if (summary.common_question_types) {
              allQuestionTypes.push(...summary.common_question_types)
            }
          })

          // Count frequency of question types
          const questionTypeCounts: { [key: string]: number } = {}
          allQuestionTypes.forEach((type) => {
            questionTypeCounts[type] = (questionTypeCounts[type] || 0) + 1
          })

          const commonQuestionTypes = Object.entries(questionTypeCounts)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

          setSummaryData({
            totalTests,
            issuesDetected,
            averageSessionDuration,
            commonQuestionTypes,
          })
        } else {
          setError("ไม่พบข้อมูลสรุป")
        }
      } catch (err) {
        console.error("Error fetching summary data:", err)
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล")
      } finally {
        setLoading(false)
      }
    }

    fetchSummaryData()
  }, [filters])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
        <Skeleton className="h-32 w-full md:col-span-2 lg:col-span-4" />
      </div>
    )
  }

  if (error || !summaryData) {
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">การทดสอบทั้งหมด</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.totalTests.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">เซสชันการทดสอบ</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ปัญหาที่ตรวจพบ</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.issuesDetected}</div>
          <p className="text-xs text-muted-foreground">ปัญหาทั้งหมด</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ระยะเวลาเซสชันเฉลี่ย</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.averageSessionDuration}</div>
          <p className="text-xs text-muted-foreground">เวลาเฉลี่ยต่อเซสชัน</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ประเภทคำถาม</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.commonQuestionTypes.length}</div>
          <p className="text-xs text-muted-foreground">หมวดหมู่ที่ติดตาม</p>
        </CardContent>
      </Card>

      {/* Common Question Types - Full Width */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>ประเภทคำถามที่พบบ่อย</CardTitle>
          <CardDescription>การกระจายของหมวดหมู่คำถามในเซสชันการทดสอบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {summaryData.commonQuestionTypes.map((type, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {type.type}: {type.count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
