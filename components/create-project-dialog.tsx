"use client"

import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState , useEffect } from "react"
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
import { Plus, Loader2 } from "lucide-react"
import { set } from "date-fns"

interface CreateProjectDialogProps {
  onProjectCreated?: () => void
  trigger?: React.ReactNode
}
interface Agent {
  id: string
  name: string
}
export function CreateProjectDialog({ onProjectCreated, trigger }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [id_agent, setAgent_id] = useState("")
  const [agents, setAgents] = useState<Agent[]>([])
  const { toast } = useToast()
const fetchData = async () => {
      try {
        
        const [agentsRes] = await Promise.all([fetch("/api/agents")])
        const agentsData = await agentsRes.json()

        
        if (agentsData.success) setAgents(agentsData.data)

    }catch (error) {
      console.error("Error fetching agents:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลประเภทการทดสอบได้",
        variant: "destructive",
      })
      return
    }}
    
    useEffect(() => {
      fetchData()
    }, [])

    useEffect(() => {
      console.log("Agents data fetched:", id_agent) // Debug log
    }, [id_agent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // console.log("Form submitted with:", { name, description }) // Debug log
    
    if (!name.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ชื่อโปรเจกต์",
        variant: "destructive",
      })
      return
    }

    if (!id_agent.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ชื่อโปรเจกต์",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      console.log("Sending request to API...") // Debug log
      console.log("Project data:", { name, id_agent, description }) // Debug log
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          id_agent: id_agent.trim() , // Ensure agent_id is trimmed and can be null
          description: description.trim() || null,
        }),
      })

      console.log("API Response status:", response.status) // Debug log

      const result = await response.json()
      console.log("API Response data:", result) // Debug log

      if (result.success) {
        toast({
          title: "สำเร็จ!",
          description: `โปรเจกต์ "${name}" ถูกสร้างเรียบร้อยแล้ว`,
        })

        // Reset form
        setName("")
        setAgent_id("")
        setDescription("")
        setOpen(false)

        // Notify parent component
        if (onProjectCreated) {
          onProjectCreated()
        }
      } else {
        throw new Error(result.error || "ไม่สามารถสร้างโปรเจกต์ได้")
      }
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถสร้างโปรเจกต์ได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Dialog open state changed:", newOpen) // Debug log
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when dialog closes
      setName("")
      setAgent_id("")
      setDescription("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("Create project button clicked") // Debug log
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            สร้างโปรเจกต์ใหม่
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>สร้างโปรเจกต์ใหม่</DialogTitle>
          <DialogDescription>เพิ่มโปรเจกต์ใหม่เพื่อจัดการไฟล์ CSV และข้อมูลของคุณ</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">ชื่อโปรเจกต์ *</Label>
              <Input
                id="project-name"
                placeholder="เช่น โปรเจกต์การตลาดดิจิทัล"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-agent">ประเภทการทดสอบ *</Label>
              <Select
                    value={id_agent}
                    onValueChange={(value) => {
                      setAgent_id(value)
                    }}
                    required
                  >
                    <SelectTrigger id="agent-name" className="flex-1">
                      <SelectValue placeholder="ประเภทการทดสอบ" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              {/* <Input
                id="project-name"
                placeholder="เช่น โปรเจกต์การตลาดดิจิทัล"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                autoFocus
              /> */}
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">คำอธิบาย</Label>
              <Textarea
                id="project-description"
                placeholder="อธิบายโปรเจกต์ของคุณ (ไม่บังคับ)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading || !name.trim() || !id_agent.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  สร้างโปรเจกต์
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
