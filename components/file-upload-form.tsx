"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileUp, Loader2, Plus } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { sendFileToWebhook } from "@/lib/actions"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateProjectDialog } from "./create-project-dialog"
import { CreateAgentDialog } from "./create-agent-dialog"

const formSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  projectId: z.string().min(1, "Project is required"),
  agentId: z.string().min(1, "Agent is required"),
  file: z.any().refine((file) => {
    if (!file || !(file instanceof File)) return false
    return file.size > 0 && (file.type === "text/csv" || file.name.endsWith(".csv"))
  }, "Please select a valid CSV file"),
})

type FormData = z.infer<typeof formSchema>

export function FileUploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [projects, setProjects] = useState([])
  const [agents, setAgents] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: "",
      projectId: "",
      agentId: "",
      file: null,
    },
  })

  const fetchData = async () => {
    try {
      setLoadingData(true)
      const [projectsRes, agentsRes] = await Promise.all([fetch("/api/projects"), fetch("/api/agents")])

      const projectsData = await projectsRes.json()
      const agentsData = await agentsRes.json()

      if (projectsData.success) setProjects(projectsData.data)
      if (agentsData.success) setAgents(agentsData.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleProjectCreated = () => {
    fetchData() // Refresh both projects and agents
  }

  const handleAgentCreated = () => {
    fetchData() // Refresh both projects and agents
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      form.setValue("file", file, { shouldValidate: true })

      // Auto-fill the file name field if it's empty
      if (!form.getValues("fileName")) {
        form.setValue("fileName", file.name.replace(/\.csv$/, ""), { shouldValidate: true })
      }
    } else {
      setSelectedFile(null)
      form.setValue("file", null, { shouldValidate: true })
    }
  }

  async function onSubmit(values: FormData) {
    if (!selectedFile) {
      toast({
        title: "ไม่ได้เลือกไฟล์",
        description: "กรุณาเลือกไฟล์ CSV เพื่ออัปโหลด",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("fileName", values.fileName)
      formData.append("projectId", values.projectId)
      formData.append("agentId", values.agentId)

      // Get project and agent names for better UX
      const project = projects.find((p) => p.id === values.projectId)
      const agent = agents.find((a) => a.id === values.agentId)

      formData.append("projectName", project?.name || "")
      formData.append("agentName", agent?.name || "")

      const result = await sendFileToWebhook(formData)

      // Dispatch event for the recent uploads component
      const newUploadEvent = new CustomEvent("new-upload", {
        detail: {
          id: uuidv4(),
          fileName: result.fileName,
          projectName: result.projectName,
          agentName: result.agentName,
          timestamp: result.timestamp,
          status: "success",
        },
      })
      window.dispatchEvent(newUploadEvent)

      toast({
        title: "อัปโหลดไฟล์สำเร็จ",
        description: `${result.fileName} ถูกส่งไปยัง webhook สำหรับโปรเจกต์ "${result.projectName}" โดย ${result.agentName} เรียบร้อยแล้ว`,
      })

      // Reset form
      form.reset({
        fileName: "",
        projectId: "",
        agentId: "",
        file: null,
      })
      setSelectedFile(null)

      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      // Refresh the page to show updated data if needed
      router.refresh()
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์",
        description: error instanceof Error ? error.message : "เกิดปัญหาในการส่งไฟล์ไปยัง webhook",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload Field */}
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ไฟล์ CSV</FormLabel>
              <FormControl>
                <div className="grid w-full gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <Card className="p-3 flex items-center gap-2 bg-muted/50">
                      <FileUp className="h-4 w-4" />
                      <span className="text-sm truncate">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </Card>
                  )}
                </div>
              </FormControl>
              <FormDescription>อัปโหลดไฟล์ CSV เพื่อส่งไปยัง webhook</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fileName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อไฟล์</FormLabel>
              <FormControl>
                <Input placeholder="ใส่ชื่อไฟล์ที่อธิบายได้" {...field} />
              </FormControl>
              <FormDescription>ชื่อที่อธิบายไฟล์ของคุณ</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>โปรเจกต์</FormLabel>
              <div className="flex gap-2">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="เลือกโปรเจกต์" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateProjectDialog
                  onProjectCreated={handleProjectCreated}
                  trigger={
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <FormDescription>เลือกโปรเจกต์ที่เกี่ยวข้องกับไฟล์นี้</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เอเจนต์</FormLabel>
              <div className="flex gap-2">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="เลือกเอเจนต์" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateAgentDialog
                  onAgentCreated={handleAgentCreated}
                  trigger={
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <FormDescription>มอบหมายไฟล์นี้ให้กับเอเจนต์</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isUploading || loadingData || !selectedFile}>
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          อัปโหลด
        </Button>
      </form>
    </Form>
  )
}
