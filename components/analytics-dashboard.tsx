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
import { PerformanceMetrics } from "./analytics/performance-metrics"
import { AsrDetails } from "./analytics/asr-details"
import { AiSummaryPerSession } from "./analytics/ai-summary-per-session"
import { DetectedIssues } from "./analytics/detected-issues"
import { ResponseTimeChart } from "./analytics/response-time-chart"
import { TestingPlatforms } from "./analytics/testing-platforms"
import { FrequentlyAskedQuestions } from "./analytics/frequently-asked-questions"
import { TestCaseChart } from "./analytics/test-case-chart"
import { ExportPDFButton } from "./export-pdf-button"

// Filter context for sharing filters across components
export interface DashboardFilters {
  dateRange?: DateRange
  selectedTester: string
  selectedPlatform: string
  selectedIssue: string
}

export function AnalyticsDashboard() {
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

  // useEffect(() => {
  //   handleFilterChange()
  // }, [date, selectedTester, selectedPlatform, selectedIssue])

  return (
    <div id="dashboard-content" className="space-y-6 sm:space-y-8">
      {/* Filters Section */}
      <Card className="w-full ">
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
            <div className="flex flex-col space-y-2 md:col-span-2">
              <label className="text-xs sm:text-sm font-medium">ช่วงวันที่</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-xs sm:text-sm",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "dd MMM yyyy", { locale: th })} -{" "}
                          {format(date.to, "dd MMM yyyy", { locale: th })}
                        </>
                      ) : (
                        format(date.from, "dd MMM yyyy", { locale: th })
                      )
                    ) : (
                      <span>เลือกวันที่</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Tester Filter */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs sm:text-sm font-medium">ผู้ทดสอบ</label>
              <Select value={selectedTester} onValueChange={setSelectedTester}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="เลือกผู้ทดสอบ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ผู้ทดสอบทั้งหมด</SelectItem>
                  <SelectItem value="john-doe">จอห์น โด</SelectItem>
                  <SelectItem value="jane-smith">เจน สมิธ</SelectItem>
                  <SelectItem value="alex-johnson">อเล็กซ์ จอห์นสัน</SelectItem>
                  <SelectItem value="system">ระบบอัตโนมัติ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Platform Filter */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs sm:text-sm font-medium">แพลตฟอร์ม</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="เลือกแพลตฟอร์ม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">แพลตฟอร์มทั้งหมด</SelectItem>
                  <SelectItem value="LINE">LINE</SelectItem>
                  <SelectItem value="Web">เว็บ</SelectItem>
                  <SelectItem value="Phone">โทรศัพท์</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Issue Filter */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs sm:text-sm font-medium">ประเภทปัญหา</label>
              <Select value={selectedIssue} onValueChange={setSelectedIssue}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="เลือกปัญหา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ปัญหาทั้งหมด</SelectItem>
                  <SelectItem value="Slow Response">การตอบสนองช้า</SelectItem>
                  <SelectItem value="Irrelevant Answer">คำตอบไม่เกี่ยวข้อง</SelectItem>
                  <SelectItem value="Connection Error">ข้อผิดพลาดการเชื่อมต่อ</SelectItem>
                  <SelectItem value="Misunderstanding">ความเข้าใจผิด</SelectItem>
                  <SelectItem value="Timeout">หมดเวลา</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <div className="flex flex-col justify-end md:col-span-2 lg:col-span-1">
              <ExportPDFButton dashboardType="voicebot" className="w-full text-xs sm:text-sm" />
            </div>
          </div>

          {/* Quick Date Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate({ from: new Date(), to: new Date() })}
              className="text-xs"
            >
              วันนี้
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const yesterday = new Date(today)
                yesterday.setDate(yesterday.getDate() - 1)
                setDate({ from: yesterday, to: yesterday })
              }}
              className="text-xs"
            >
              เมื่อวาน
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)
                setDate({ from: weekAgo, to: today })
              }}
              className="text-xs"
            >
              7 วันที่แล้ว
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const monthAgo = new Date(today)
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                setDate({ from: monthAgo, to: today })
              }}
              className="text-xs"
            >
              30 วันที่แล้ว
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDate(undefined)
                setSelectedTester("all")
                setSelectedPlatform("all")
                setSelectedIssue("all")
              }}
              className="text-xs"
            >
              ล้างตัวกรอง
            </Button>
          </div>
        </CardContent>
      </Card>

      VoiceBot Performance Metrics - Updated Section Title
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">ตัวชี้วัดประสิทธิภาพ VoiceBot</h2>
          <div className="text-xs sm:text-sm text-muted-foreground">
            อัปเดตล่าสุด: {new Date().toLocaleString("th-TH")}
          </div>
        </div>
        <PerformanceMetrics filters={filters} key={filtersChanged} />
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

      {/* Test Case Chart */}
      {/* <TestCaseChart filters={filters} key={filtersChanged} /> */}

      {/* Frequently Asked Questions */}
      {/* <FrequentlyAskedQuestions filters={filters} key={filtersChanged} /> */}
    </div>
  )
}
