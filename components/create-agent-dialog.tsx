"use client"

import type React from "react"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Bot } from "lucide-react"

interface CreateAgentDialogProps {
  onAgentCreated?: () => void
  trigger?: React.ReactNode
}

const AGENT_TYPES = [
  { value: "analytics", label: "การวิเคราะห์ข้อมูล" },
  { value: "notification", label: "การแจ้งเตือน" },
  { value: "integration", label: "การเชื่อมต่อระบบ" },
  { value: "processing", label: "การประมวลผล" },
  { value: "reporting", label: "การรายงาน" },
  { value: "automation", label: "ระบบอัตโนมัติ" },
]

export function CreateAgentDialog({ onAgentCreated, trigger }: CreateAgentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.type) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ชื่อเอเจนต์และเลือกประเภท",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description.trim() || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "สำเร็จ!",
          description: `เอเจนต์ "${formData.name}" ถูกสร้างเรียบร้อยแล้ว`,
        })

        // Reset form
        setFormData({ name: "", type: "", description: "" })
        setOpen(false)

        // Notify parent component
        if (onAgentCreated) {
          onAgentCreated()
        }
      } else {
        throw new Error(result.error || "ไม่สามารถสร้างเอเจนต์ได้")
      }
    } catch (error) {
      console.error("Error creating agent:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถสร้างเอเจนต์ได้",
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
            <Bot className="h-4 w-4 mr-1" />
            สร้างเอเจนต์ใหม่
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>สร้างเอเจนต์ใหม่</DialogTitle>
          <DialogDescription>เพิ่มเอเจนต์ใหม่เพื่อจัดการงานและประมวลผลข้อมูล</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">ชื่อเอเจนต์ *</Label>
              <Input
                id="agent-name"
                placeholder="เช่น เอเจนต์วิเคราะห์ข้อมูล"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-type">ประเภทเอเจนต์ *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทเอเจนต์" />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-description">คำอธิบาย</Label>
              <Textarea
                id="agent-description"
                placeholder="อธิบายหน้าที่และความสามารถของเอเจนต์ (ไม่บังคับ)"
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
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  สร้างเอเจนต์
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
