"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardFilters } from "../analytics-dashboard"

interface Issue {
  type: string
  frequency: number
  impact: string
  trend: string
  change: number
}

interface DetectedIssuesProps {
  filters?: DashboardFilters
}

export function DetectedIssues({ filters }: DetectedIssuesProps) {
  const [issuesData, setIssuesData] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIssues() {
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
          // Aggregate issues from all summaries
          const allIssues: Issue[] = []

          result.data.forEach((summary: any) => {
            if (summary.detected_issues && Array.isArray(summary.detected_issues)) {
              allIssues.push(...summary.detected_issues)
            }
          })

          // Group and aggregate issues by type
          const issueMap: { [key: string]: Issue } = {}
          allIssues.forEach((issue) => {
            if (issueMap[issue.type]) {
              issueMap[issue.type].frequency += issue.frequency
            } else {
              issueMap[issue.type] = { ...issue }
            }
          })

          const aggregatedIssues = Object.values(issueMap)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5)

          setIssuesData(aggregatedIssues)
        } else {
          setError("ไม่พบข้อมูลปัญหา")
        }
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลปัญหาได้")
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [filters])

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">เกิดข้อผิดพลาด: {error}</p>
      </div>
    )
  }

  if (issuesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Detected Issues
          </CardTitle>
          <CardDescription>ยังไม่มีข้อมูลปัญหาในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">ยังไม่มีปัญหาที่ตรวจพบในระบบ</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxFrequency = Math.max(...issuesData.map((issue) => issue.frequency))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Top 5 Most Frequent Issues</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">ปัญหาที่ตรวจพบในเซสชันการทดสอบ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom Progress Bar Chart */}
          <div className="space-y-3">
            {issuesData.map((issue, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium truncate pr-2 flex-1">{issue.type}</span>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs px-1 sm:px-2">
                      {issue.frequency}
                    </Badge>
                    {issue.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    )}
                    <span className={`text-xs ${issue.trend === "up" ? "text-red-500" : "text-green-500"}`}>
                      {issue.change > 0 ? "+" : ""}
                      {issue.change}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={(issue.frequency / maxFrequency) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">{issue.frequency} ครั้ง</div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-bold text-red-600">
                  {issuesData.reduce((sum, issue) => sum + issue.frequency, 0)}
                </div>
                <div className="text-xs text-muted-foreground">ปัญหาทั้งหมด</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-bold text-orange-600">
                  {issuesData.filter((issue) => issue.trend === "up").length}
                </div>
                <div className="text-xs text-muted-foreground">ปัญหาที่เพิ่มขึ้น</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">รายละเอียดปัญหาที่พบบ่อย</CardTitle>
          <CardDescription className="text-xs sm:text-sm">การวิเคราะห์เชิงลึกของปัญหาทั่วไปและผลกระทบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {issuesData.map((issue, index) => (
              <div key={index} className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs sm:text-sm font-medium leading-relaxed flex-1">{issue.type}</p>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {issue.frequency}x
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">ผลกระทบ:</span>
                    <Badge variant={issue.impact === "High" ? "destructive" : "secondary"} className="text-xs">
                      {issue.impact}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">แนวโน้ม:</span>
                    <Badge variant="outline" className="text-xs">
                      {issue.trend === "up" ? "เพิ่มขึ้น" : issue.trend === "down" ? "ลดลง" : "คงที่"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
