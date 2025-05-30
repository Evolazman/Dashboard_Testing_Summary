import { FileUploadForm } from "@/components/file-upload-form"
import { RecentUploads } from "@/components/recent-uploads"
import { WebhookStatus } from "@/components/webhook-status"
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/webhook")

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">แดชบอร์ดอัปโหลดไฟล์ CSV</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          อัปโหลดไฟล์ CSV และส่งไปยัง webhook ของ n8n พร้อมข้อมูลเพิ่มเติม
        </p>
      </div>

      <WebhookStatus />

      <div className="rounded-lg border p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">อัปโหลดไฟล์ใหม่</h2>
        <FileUploadForm />
      </div>

      <RecentUploads />
    </div>
  )
}
