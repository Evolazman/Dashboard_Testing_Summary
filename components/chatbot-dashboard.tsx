"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { TestSummary } from "./analytics/test-summary"
import { ChatbotPerformanceMetrics } from "./chatbot/chatbot-performance-metrics"
import { AsrDetails } from "./analytics/asr-details"
import { AiSummaryPerSession } from "./analytics/ai-summary-per-session"
import { DetectedIssues } from "./analytics/detected-issues"
import { ResponseTimeChart } from "./analytics/response-time-chart"
import { TestingPlatforms } from "./analytics/testing-platforms"
import { FrequentlyAskedQuestions } from "./analytics/frequently-asked-questions"
import { ExportPDFButton } from "./export-pdf-button"

// Filter context for sharing filters across components
export interface DashboardFilters {
  dateRange?: DateRange
  selectedTester: string
  selectedPlatform: string
  selectedIssue: string
}

export function ChatbotDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [selectedTester, setSelectedTester] = useState<string>("all")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [selectedIssue, setSelectedIssue] = useState<string>("all")
  const [filtersChanged, setFiltersChanged] = useState(0)

  // Create filters object to pass to components
  const filters: DashboardFilters = {
    dateRange: date,
    selectedTester,
    selectedPlatform,
    selectedIssue,
  }

  // Trigger re-render when filters change
  const handleFilterChange = () => {
    setFiltersChanged((prev) => prev + 1)
  }

  useEffect(() => {
    handleFilterChange()
  }, [date, selectedTester, selectedPlatform, selectedIssue])

  return (
    <div id="dashboard-content" className="space-y-6 sm:space-y-8">
      {/* Filters Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">ตัวกรองและช่วงวันที่</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            กรองข้อมูลตามช่วงวันที่ ผู้ทดสอบ แพลตฟอร์ม หรือประเภทปัญหา
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Date Range Picker */}
            
          </div>
        </CardContent>
      </Card>

      {/* Chatbot Performance Metrics - New Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">ตัวชี้วัดประสิทธิภาพ Chatbot</h2>
          <div className="text-xs sm:text-sm text-muted-foreground">
            อัปเดตล่าสุด: {new Date().toLocaleString("th-TH")}
          </div>
        </div>
        <ChatbotPerformanceMetrics filters={filters} key={filtersChanged} />
      </div>

      {/* Test Summary */}
      {/* <TestSummary filters={filters} key={filtersChanged} /> */}

      {/* Response Time Chart */}
      {/* <ResponseTimeChart filters={filters} key={filtersChanged} /> */}

      {/* Testing Platforms */}
      {/* <TestingPlatforms filters={filters} key={filtersChanged} /> */}

      {/* ASR Details */}
      {/* <AsrDetails filters={filters} key={filtersChanged} /> */}

      {/* AI Summary Per Session */}
      {/* <AiSummaryPerSession filters={filters} key={filtersChanged} /> */}

      {/* Detected Issues */}
      {/* <DetectedIssues filters={filters} key={filtersChanged} /> */}

      {/* Frequently Asked Questions */}
      {/* <FrequentlyAskedQuestions filters={filters} key={filtersChanged} /> */}
    </div>
  )
}
