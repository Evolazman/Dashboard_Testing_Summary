"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, Loader2, Settings, Maximize } from "lucide-react"
import { exportToPDF, type ExportOptions } from "@/lib/pdf-export"
import { useToast } from "@/hooks/use-toast"

interface ExportPDFButtonProps {
  dashboardType: "chatbot" | "voicebot"
  className?: string
}

export function ExportPDFButton({ dashboardType, className }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (options: ExportOptions = {}) => {
    try {
      setIsExporting(true)

      const filename = dashboardType === "chatbot" ? "chatbot-dashboard" : "voicebot-dashboard"

      await exportToPDF("dashboard-content", {
        filename,
        orientation: "portrait",
        format: "a4",
        quality: 0.95,
        ...options,
      })

      toast({
        title: "ส่งออก PDF สำเร็จ",
        description: `ไฟล์ ${filename} ถูกดาวน์โหลดเรียบร้อยแล้ว (ขนาดใหญ่ขึ้น)`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออก PDF ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`flex items-center gap-2 ${className}`} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              <span className="hidden sm:inline">��ำลังส่งออก...</span>
              <span className="sm:hidden">ส่งออก...</span>
            </>
          ) : (
            <>
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">ส่งออก PDF</span>
              <span className="sm:hidden">PDF</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={() => handleExport()}>
          <FileText className="mr-2 h-4 w-4" />
          PDF ขนาดใหญ่ (A4 Portrait)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport({ quality: 1.0 })}>
          <Maximize className="mr-2 h-4 w-4" />
          PDF คุณภาพสูงสุด (A4)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport({ orientation: "landscape" })}>
          <FileText className="mr-2 h-4 w-4" />
          PDF แนวนอน (A4 Landscape)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport({ format: "a3" })}>
          <FileText className="mr-2 h-4 w-4" />
          PDF ขนาดใหญ่พิเศษ (A3)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport({ format: "a3", orientation: "landscape", quality: 1.0 })}>
          <Settings className="mr-2 h-4 w-4" />
          PDF A3 แนวนอน (ใหญ่ที่สุด)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
