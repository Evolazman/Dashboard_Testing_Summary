"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Smartphone, Globe, Phone, MessageCircle } from "lucide-react"

const platformData = [
  {
    name: "LINE",
    value: 35,
    color: "bg-green-500",
    icon: MessageCircle,
    sessions: 847,
    growth: "+12%",
  },
  {
    name: "Web",
    value: 28,
    color: "bg-blue-500",
    icon: Globe,
    sessions: 678,
    growth: "+8%",
  },
  {
    name: "Phone",
    value: 22,
    color: "bg-purple-500",
    icon: Phone,
    sessions: 532,
    growth: "-3%",
  },
  {
    name: "Facebook",
    value: 15,
    color: "bg-indigo-500",
    icon: Smartphone,
    sessions: 363,
    growth: "+5%",
  },
]

export function TestingPlatforms() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">การกระจายแพลตฟอร์มการทดสอบ</CardTitle>
        <CardDescription className="text-xs sm:text-sm">เปอร์เซ็นต์การทดสอบที่ดำเนินการในแต่ละแพลตฟอร์ม</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Custom Pie Chart Alternative */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">สัดส่วนการใช้งาน</h4>
            {platformData.map((platform, index) => {
              const Icon = platform.icon
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-medium text-sm sm:text-base">{platform.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {platform.value}%
                      </Badge>
                      <span
                        className={`text-xs ${platform.growth.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                      >
                        {platform.growth}
                      </span>
                    </div>
                  </div>
                  <Progress value={platform.value} className="h-2">
                    <div className={`h-full ${platform.color} rounded-full transition-all`} />
                  </Progress>
                  <div className="text-xs text-muted-foreground text-right">{platform.sessions} เซสชัน</div>
                </div>
              )
            })}
          </div>

          {/* Platform Statistics */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">สถิติแพลตฟอร์ม</h4>
            <div className="grid gap-3">
              {platformData.map((platform, index) => {
                const Icon = platform.icon
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${platform.color}`} />
                      <div className="space-y-1">
                        <div className="font-medium text-sm sm:text-base">{platform.name}</div>
                        <div className="text-xs text-muted-foreground">{platform.sessions} เซสชัน</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        {platform.value}%
                      </Badge>
                      <div
                        className={`text-xs mt-1 ${platform.growth.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                      >
                        {platform.growth}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-lg sm:text-xl font-bold text-primary">
                    {platformData.reduce((sum, p) => sum + p.sessions, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">เซสชันทั้งหมด</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg sm:text-xl font-bold text-green-600">
                    {platformData.filter((p) => p.growth.startsWith("+")).length}
                  </div>
                  <div className="text-xs text-muted-foreground">แพลตฟอร์มที่เติบโต</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
