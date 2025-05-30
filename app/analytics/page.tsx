import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function VoiceBotPage() {
  return (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">แดชบอร์ด VoiceBot</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          ข้อมูลเชิงลึกและการวิเคราะห์ที่ครอบคลุมจากเซสชันการทดสอบ VoiceBot และระบบเสียงอัตโนมัติของคุณ
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  )
}
