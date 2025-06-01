"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"

interface DeleteProjectDialogProps {
  projectId: string
  projectName: string
  fileCount?: number
  onProjectDeleted?: () => void
  trigger?: React.ReactNode
}

export function DeleteProjectDialog({
  projectId,
  projectName,
  fileCount = 0,
  onProjectDeleted,
  trigger,
}: DeleteProjectDialogProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [step, setStep] = useState<"warning" | "confirm">("warning")
  const { toast } = useToast()

  const isConfirmationValid = confirmationText === projectName

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาพิมพ์ชื่อโปรเจกต์ให้ถูกต้อง",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "ลบโปรเจกต์สำเร็จ",
          description: `โปรเจกต์ "${projectName}" และข้อมูลที่เกี่ยวข้องทั้งหมดถูกลบเรียบร้อยแล้ว`,
        })

        setOpen(false)
        setStep("warning")
        setConfirmationText("")

        // Notify parent component
        if (onProjectDeleted) {
          onProjectDeleted()
        }
      } else {
        throw new Error(result.error || "ไม่สามารถลบโปรเจกต์ได้")
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถลบโปรเจกต์ได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when dialog closes
      setStep("warning")
      setConfirmationText("")
    }
  }

  const handleContinueToConfirm = () => {
    setStep("confirm")
  }

  const handleBackToWarning = () => {
    setStep("warning")
    setConfirmationText("")
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            ลบ
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        {step === "warning" ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                คำเตือน: การลบโปรเจกต์
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left space-y-3">
                <div>
                  คุณกำลังจะลบโปรเจกต์ <strong className="text-foreground">"{projectName}"</strong>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="font-medium text-destructive mb-2">ข้อมูลที่จะถูกลบถาวร:</div>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>ไฟล์ CSV ทั้งหมด ({fileCount} ไฟล์)</li>
                    <li>ประวัติการอัปโหลดทั้งหมด</li>
                    <li>เซสชันการทดสอบที่เกี่ยวข้อง</li>
                    <li>ข้อมูลโปรเจกต์และการตั้งค่า</li>
                  </ul>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                  <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    ⚠️ การดำเนินการนี้ไม่สามารถยกเลิกได้
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">ข้อมูลทั้งหมดจะถูกลบออกจากระบบอย่างถาวร</div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleContinueToConfirm}
                className="bg-destructive hover:bg-destructive/90"
              >
                ดำเนินการต่อ
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                ยืนยันการลบโปรเจกต์
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left space-y-4">
                <div>เพื่อยืนยันการลบ กรุณาพิมพ์ชื่อโปรเจกต์ด้านล่าง:</div>

                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm font-mono">{projectName}</code>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmation-input">พิมพ์ชื่อโปรเจกต์เพื่อยืนยัน:</Label>
                 
                  <Input
                    id="confirmation-input"
                    // type="input"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="พิมพ์ชื่อโปรเจกต์ที่นี่"
                    className={`${
                      confirmationText && !isConfirmationValid
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={loading}
                    autoFocus
                  />
                  {confirmationText && !isConfirmationValid && (
                    <p className="text-sm text-destructive">ชื่อโปรเจกต์ไม่ตรงกัน กรุณาพิมพ์ให้ถูกต้อง</p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleBackToWarning} disabled={loading} className="w-full sm:w-auto">
                ย้อนกลับ
              </Button>
              <AlertDialogCancel disabled={loading} className="w-full sm:w-auto">
                ยกเลิก
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={loading || !isConfirmationValid}
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    ลบโปรเจกต์
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
