"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, TrendingUp, TrendingDown } from "lucide-react"

const testCaseData = [
  {
    category: "ไม่สะดวก ผิดไทม์ (แจ้งขาดก่อน -> วิน...)",
    value: 85,
    count: 234,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    trend: "up",
    change: 12,
  },
  {
    category: "ไม่สะดวก ผิดไทม์ (แจ้งวันก่อน -> บลา...)",
    value: 95,
    count: 287,
    color: "bg-red-500",
    textColor: "text-red-600",
    trend: "down",
    change: -5,
  },
  {
    category: "ไม่สะดวก ผิดไทม์ (แจ้งวัน + บลา) วาง...",
    value: 72,
    count: 198,
    color: "bg-purple-500",
    textColor: "text-purple-600",
    trend: "up",
    change: 8,
  },
  {
    category: "สะดวก-ยืนยัน-วางสาย",
    value: 45,
    count: 123,
    color: "bg-green-400",
    textColor: "text-green-600",
    trend: "up",
    change: 15,
  },
  {
    category: "ยกเลิก วางรอผิดไทม์ วางสาย",
    value: 38,
    count: 98,
    color: "bg-green-600",
    textColor: "text-green-700",
    trend: "down",
    change: -3,
  },
  {
    category: "อื่นๆ",
    value: 62,
    count: 156,
    color: "bg-gray-400",
    textColor: "text-gray-600",
    trend: "up",
    change: 7,
  },
]

export function TestCaseChart() {
  const maxValue = Math.max(...testCaseData.map((item) => item.value))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TestTube className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="truncate">Test Case</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          การวิเคราะห์ผลการทดสอบตามประเภทของ Test Case ต่างๆ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Bar Chart Visualization */}
          <div className="grid gap-3">
            {testCaseData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium truncate pr-2 flex-1" title={item.category}>
                    {item.category.length > 30 ? `${item.category.substring(0, 30)}...` : item.category}
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs px-1 sm:px-2">
                      {item.count}
                    </Badge>
                    {item.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${item.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      {item.change > 0 ? "+" : ""}
                      {item.change}%
                    </span>
                  </div>
                </div>

                {/* Custom Bar Chart */}
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 sm:h-8">
                    <div
                      className={`${item.color} h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    >
                      <span className="text-white text-xs font-semibold">{item.value}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-right">{item.count} กรณี</div>
              </div>
            ))}
          </div>

          {/* Summary Statistics */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-bold text-primary">
                  {testCaseData.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Test Case ทั้งหมด</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  {testCaseData.filter((item) => item.trend === "up").length}
                </div>
                <div className="text-xs text-muted-foreground">เพิ่มขึ้น</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-bold text-red-600">
                  {testCaseData.filter((item) => item.trend === "down").length}
                </div>
                <div className="text-xs text-muted-foreground">ลดลง</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-bold text-blue-600">
                  {Math.round(testCaseData.reduce((sum, item) => sum + item.value, 0) / testCaseData.length)}
                </div>
                <div className="text-xs text-muted-foreground">คะแนนเฉลี่ย</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">หมายเหตุ:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>ไม่สะดวก ผิดไทม์ (แจ้งขาดก่อน)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>ไม่สะดวก ผิดไทม์ (แจ้งวันก่อน)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>ไม่สะดวก ผิดไทม์ (แจ้งวัน + บลา)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>สะดวก-ยืนยัน-วางสาย</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
