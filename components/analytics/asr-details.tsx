"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mic, Volume2, MessageSquare, Clock } from "lucide-react"

export function AsrDetails() {
  const asrMetrics = [
    {
      icon: Mic,
      title: "การรู้จำเสียง",
      value: "95.2%",
      description: "ความแม่นยำในการรู้จำเสียงพูด",
      progress: 95.2,
      color: "text-blue-600",
    },
    {
      icon: Volume2,
      title: "คุณภาพเสียง",
      value: "88.7%",
      description: "คุณภาพของเสียงที่รับเข้ามา",
      progress: 88.7,
      color: "text-green-600",
    },
    {
      icon: MessageSquare,
      title: "ความเข้าใจบริบท",
      value: "91.3%",
      description: "ความสามารถในการเข้าใจบริบทการสนทนา",
      progress: 91.3,
      color: "text-purple-600",
    },
    {
      icon: Clock,
      title: "เวลาประมวลผล",
      value: "1.2 วินาที",
      description: "เวลาเฉลี่ยในการประมวลผลเสียง",
      progress: 85,
      color: "text-orange-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-6 w-6" />
          รายละเอียด ASR (Automatic Speech Recognition)
        </CardTitle>
        <CardDescription>ประสิทธิภาพและตัวชี้วัดของระบบรู้จำเสียงอัตโนมัติ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {asrMetrics.map((metric, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <div className="flex-1">
                  <h4 className="font-semibold">{metric.title}</h4>
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {metric.value}
                </Badge>
              </div>
              <Progress value={metric.progress} className="h-2" />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">สรุปประสิทธิภาพ ASR</h4>
          <p className="text-sm text-muted-foreground">
            ระบบ ASR มีประสิทธิภาพโดยรวมอยู่ในระดับดี โดยมีความแม่นยำในการรู้จำเสียงสูงถึง 95.2% และสามารถประมวลผลเสียงได้ในเวลาเฉลี่ย 1.2
            วินาที ซึ่งเป็นไปตามมาตรฐานที่กำหนด
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
