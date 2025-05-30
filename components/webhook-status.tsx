"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type WebhookStatus = "available" | "unavailable" | "unknown" | "checking"

export function WebhookStatus() {
  const [status, setStatus] = useState<WebhookStatus>("unknown")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    try {
      setStatus("checking")
      setError(null)

      // Make a request to our API route instead of directly to the webhook
      const response = await fetch("/api/webhook-status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (response.ok) {
        setStatus(result.available ? "available" : "unavailable")
        if (result.error) {
          setError(result.error)
        }
      } else {
        setStatus("unavailable")
        setError(result.error || "ไม่สามารถตรวจสอบสถานะ webhook ได้")
      }

      setLastChecked(new Date())
    } catch (error) {
      console.error("Error checking webhook status:", error)
      setStatus("unknown")
      setError(error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ")
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    // Only check status on mount, not automatically
    // This prevents the error from showing immediately
    checkStatus()
  }, [])

  if (status === "checking" && !lastChecked) {
    return <Skeleton className="h-16 w-full" />
  }

  return (
    <div className="mb-6">
      {status === "available" ? (
        <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Webhook พร้อมใช้งาน</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>n8n webhook ของคุณเชื่อมต่อแล้วและพร้อมรับข้อมูล</span>
            {lastChecked && (
              <Button
                variant="ghost"
                size="sm"
                onClick={checkStatus}
                disabled={status === "checking"}
                className="text-xs"
              >
                {status === "checking" ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  <>ตรวจสอบล่าสุด: {lastChecked.toLocaleTimeString()} • รีเฟรช</>
                )}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      ) : status === "unavailable" ? (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Webhook ไม่พร้อมใช้งาน</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>n8n webhook ของคุณไม่ตอบสนอง กรุณาตรวจสอบการกำหนดค่า</span>
              {lastChecked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkStatus}
                  disabled={status === "checking"}
                  className="text-xs text-destructive-foreground"
                >
                  {status === "checking" ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    <>ตรวจสอบล่าสุด: {lastChecked.toLocaleTimeString()} • ลองใหม่</>
                  )}
                </Button>
              )}
            </div>
            {error && <div className="text-xs text-destructive-foreground/80 mt-1">ข้อผิดพลาด: {error}</div>}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>สถานะ Webhook ไม่ทราบ</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>ไม่สามารถระบุสถานะของ n8n webhook ของคุณได้</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkStatus}
                disabled={status === "checking"}
                className="text-xs"
              >
                {status === "checking" ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  "ตรวจสอบสถานะ"
                )}
              </Button>
            </div>
            {error && <div className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">ข้อผิดพลาด: {error}</div>}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
