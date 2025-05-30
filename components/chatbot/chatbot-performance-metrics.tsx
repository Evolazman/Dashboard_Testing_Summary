"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardFilters } from "../chatbot-dashboard"

interface ChatbotPerformanceMetricsProps {
  filters?: DashboardFilters
}

interface MetricData {
  title: string
  titleThai: string
  percentage: number
  current: number
  total: number
  color: string
  bgColor: string
  borderColor: string
}

export function ChatbotPerformanceMetrics({ filters }: ChatbotPerformanceMetricsProps) {
  const [metricsData, setMetricsData] = useState<MetricData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)

        // Build query parameters based on filters
        const params = new URLSearchParams()
        params.append("agent_type", "chatbot")

        if (filters?.dateRange?.from) {
          params.append("from", filters.dateRange.from.toISOString())
        }
        if (filters?.dateRange?.to) {
          params.append("to", filters.dateRange.to.toISOString())
        }

        const response = await fetch(`/api/dashboard-summary?${params.toString()}`)
        const result = await response.json()

        if (result.success && result.data.length > 0) {
          const summary = result.data[0] // Get the first (latest) summary

          // Transform dashboard_summary data to component format
          const transformedData: MetricData[] = [
            {
              title: "Success Rate",
              titleThai: "อัตราความสำเร็จ",
              percentage: Number(summary.success_rate) || 0,
              current: summary.success_current || 0,
              total: summary.success_total || 0,
              color: "text-green-600",
              bgColor: "bg-green-50 dark:bg-green-950/20",
              borderColor: "border-green-200 dark:border-green-900",
            },
            {
              title: "Error Rate Count",
              titleThai: "จำนวนข้อผิดพลาด",
              percentage:
                summary.error_total > 0 ? Math.round((summary.error_rate_count / summary.error_total) * 100) : 0,
              current: summary.error_rate_count || 0,
              total: summary.error_total || 0,
              color: "text-red-600",
              bgColor: "bg-red-50 dark:bg-red-950/20",
              borderColor: "border-red-200 dark:border-red-900",
            },
            {
              title: "SASI Score",
              titleThai: "คะแนน SASI",
              percentage: Number(summary.sasi_score) || 0,
              current: summary.sasi_current || 0,
              total: summary.sasi_total || 0,
              color: "text-blue-600",
              bgColor: "bg-blue-50 dark:bg-blue-950/20",
              borderColor: "border-blue-200 dark:border-blue-900",
            },
            {
              title: "SUS Score",
              titleThai: "คะแนน SUS",
              percentage: Number(summary.sus_score) || 0,
              current: summary.sus_current || 0,
              total: summary.sus_total || 0,
              color: "text-purple-600",
              bgColor: "bg-purple-50 dark:bg-purple-950/20",
              borderColor: "border-purple-200 dark:border-purple-900",
            },
          ]

          setMetricsData(transformedData)
        } else {
          setError("ไม่พบข้อมูลสำหรับ Chatbot")
        }
      } catch (err) {
        console.error("Error fetching metrics:", err)
        setError("ไม่สามารถโหลดข้อมูลได้")
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [filters])

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
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

  return (
    <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metricsData.map((metric, index) => (
        <Card key={index} className={`${metric.bgColor} ${metric.borderColor} border-2 w-full`}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-center truncate">
              {metric.title}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground text-center truncate">{metric.titleThai}</p>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Large Percentage Display */}
            <div className="text-center">
              <div className={`text-3xl sm:text-4xl lg:text-6xl font-bold ${metric.color}`}>
                {metric.title === "Error Rate Count" ? metric.current : `${metric.percentage}%`}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={metric.percentage} className="h-2" />
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                {metric.title === "Error Rate Count"
                  ? `จากทั้งหมด ${metric.total.toLocaleString()} รายการ`
                  : `จากข้อมูล ${metric.current.toLocaleString()}/${metric.total.toLocaleString()}`}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs text-muted-foreground">
              {metric.title === "Error Rate Count" ? (
                <>
                  <div className="text-center">
                    <div className="font-semibold text-xs sm:text-sm text-red-600">
                      {metric.current.toLocaleString()}
                    </div>
                    <div className="text-xs">ข้อผิดพลาด</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-xs sm:text-sm text-green-600">
                      {(metric.total - metric.current).toLocaleString()}
                    </div>
                    <div className="text-xs">ปกติ</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="font-semibold text-xs sm:text-sm">{metric.current.toLocaleString()}</div>
                    <div className="text-xs">สำเร็จ</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-xs sm:text-sm">
                      {(metric.total - metric.current).toLocaleString()}
                    </div>
                    <div className="text-xs">ไม่สำเร็จ</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
