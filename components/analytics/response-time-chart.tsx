"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap } from "lucide-react"

const responseTimeData = [
  { time: "00:00", chatbot: 1.2, voicebot: 2.1 },
  { time: "04:00", chatbot: 1.1, voicebot: 1.9 },
  { time: "08:00", chatbot: 1.8, voicebot: 2.8 },
  { time: "12:00", chatbot: 2.1, voicebot: 3.2 },
  { time: "16:00", chatbot: 1.9, voicebot: 2.9 },
  { time: "20:00", chatbot: 1.4, voicebot: 2.3 },
]

const averageResponseData = [
  { platform: "Chatbot", avgTime: 1.6, sessions: 847, color: "bg-blue-500" },
  { platform: "Voice Bot", avgTime: 2.5, sessions: 400, color: "bg-green-500" },
]

export function ResponseTimeChart() {
  const maxTime = Math.max(...responseTimeData.flatMap((d) => [d.chatbot, d.voicebot]))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Response Time Trends</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">เวลาตอบสนองเฉลี่ยตลอดทั้งวัน (วินาที)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {responseTimeData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium">{data.time}</span>
                  <div className="flex gap-2 sm:gap-4">
                    <span className="text-blue-600">Chatbot: {data.chatbot}s</span>
                    <span className="text-green-600">Voice: {data.voicebot}s</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs text-blue-600">Chatbot</div>
                    <Progress value={(data.chatbot / maxTime) * 100} className="h-2 bg-blue-100">
                      <div className="h-full bg-blue-500 rounded-full transition-all" />
                    </Progress>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-green-600">Voice Bot</div>
                    <Progress value={(data.voicebot / maxTime) * 100} className="h-2 bg-green-100">
                      <div className="h-full bg-green-500 rounded-full transition-all" />
                    </Progress>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Performance Comparison</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">เปรียบเทียบประสิทธิภาพ Chatbot vs Voice Bot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {averageResponseData.map((platform, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm sm:text-base">{platform.platform}</h4>
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {platform.sessions} sessions
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span>เวลาตอบสนองเฉลี่ย</span>
                  <span className="font-bold">{platform.avgTime} วินาที</span>
                </div>
                <Progress value={(platform.avgTime / 4) * 100} className="h-3">
                  <div className={`h-full ${platform.color} rounded-full transition-all`} />
                </Progress>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-green-600">เร็ว</div>
                  <div className="text-muted-foreground">{"<"} 1.5s</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-yellow-600">ปานกลาง</div>
                  <div className="text-muted-foreground">1.5-2.5s</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-red-600">ช้า</div>
                  <div className="text-muted-foreground">{">"} 2.5s</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
