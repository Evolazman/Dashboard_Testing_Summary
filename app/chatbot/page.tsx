import { ChatbotDashboard } from "@/components/chatbot-dashboard"

export default function ChatbotPage() {
  return (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">แดชบอร์ด Chatbot</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          ข้อมูลเชิงลึกและการวิเคราะห์ประสิทธิภาพของ Chatbot และระบบการสนทนาอัตโนมัติ
        </p>
      </div>
      <ChatbotDashboard />
    </div>
  )
}
