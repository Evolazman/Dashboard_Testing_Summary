"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Edit, Loader2 } from "lucide-react"

interface EditProjectDialogProps {
  projectId: string
  projectName: string
  projectDescription?: string
  onProjectUpdated?: () => void
  trigger?: React.ReactNode
}

export function EditProjectDialog({
  projectId,
  projectName,
  projectDescription,
  onProjectUpdated,
  trigger,
}: EditProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: projectName,
    description: projectDescription || "",
  })
  const { toast } = useToast()

  // Reset form data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: projectName,
        description: projectDescription || "",
      })
    }
  }, [open, projectName, projectDescription])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ชื่อโปรเจกต์",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "อัปเดตสำเร็จ!",
          description: `โปรเจกต์ "${formData.name}" ถูกอัปเดตเรียบร้อยแล้ว`,
        })

        setOpen(false)

        // Notify parent component
        if (onProjectUpdated) {
          onProjectUpdated()
        }
      } else {
        throw new Error(result.error || "ไม่สามารถอัปเดตโปรเจกต์ได้")
      }
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถอัปเดตโปรเจกต์ได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            แก้ไข
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>แก้ไขโปรเจกต์</DialogTitle>
          <DialogDescription>อัปเดตข้อมูลโปรเจกต์ของคุณ</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">ชื่อโปรเจกต์ *</Label>
              <Input
                id="edit-name"
                placeholder="เช่น โปรเจกต์การตลาดดิจิทัล"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">คำอธิบาย</Label>
              <Textarea
                id="edit-description"
                placeholder="อธิบายโปรเจกต์ของคุณ (ไม่บังคับ)"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังอัปเดต...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  อัปเดต
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
