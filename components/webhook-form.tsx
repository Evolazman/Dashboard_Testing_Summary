"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUp, Loader2, Send, AlertCircle, CheckCircle2, Plus , Upload} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreateProjectDialog } from "./create-project-dialog"
import { CreateAgentDialog } from "./create-agent-dialog"
import { sendFileToWebhook } from "@/lib/actions"
import { WebhookResultDashboard } from "./webhook-result-dashboard"
import { WebhookResultDashboardChatbot } from "./webhook-result-dashboard_Chatbot"
import { parseWebhookResponse } from "@/lib/webhook-response-parser"
import { set } from "date-fns"
import { DatabaseService } from "@/lib/database"

interface Project {
  id: string
  name: string
  id_agent : string
}

interface Agent {
  id: string
  name: string
}

export function WebhookForm() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [projectId, setProjectId] = useState("")
  const [agentId, setAgentId] = useState("")
  const [chatbotResult, setChatbotResult] = useState(false)
  const [voiceResult, setvoiceResult] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [hidden, setHidden] = useState("hidden")
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [lastSuccess, setLastSuccess] = useState<string | null>(null)

  // Add state for showing the result dashboard
  const [showResultDashboard, setShowResultDashboard] = useState(false)
  const [webhookResponseData, setWebhookResponseData] = useState<any | null>(null)

  // Data from database
  const [projects, setProjects] = useState<Project[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingData, setLoadingData] = useState(true)
  useEffect(() => {
    projects.map((project) => {
      if (projectId === project.id) {
        setAgentId(project.id_agent)
        if (project.id_agent == "2219b7e3-e35a-4208-a3a7-c5e46f7834e7") {
        setChatbotResult(true)
        setWebhookUrl("https://5e71-184-22-39-189.ngrok-free.app/webhook-test/afadbbfe-b8f5-4cf2-9a28-614d7c039dce")
        setvoiceResult(false)
                          
    }else if (project.id_agent == "d627e8b8-a499-4c85-899a-26316f751e00") {
        setvoiceResult(true)
        setWebhookUrl("https://5e71-184-22-39-189.ngrok-free.app/webhook-test/ab1b6138-5ee7-4aac-8522-39b5f1f3456e")
        setChatbotResult(false)
    }
    }
    setHidden("block")

    
  })
   
  }, [projectId])
  
  
  // Fetch projects and agents from database
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
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลโปรเจกต์และเอเจนต์ได้",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  // useEffect(() => {
  //   projectId.
  //   setAgents
  // }, [projectId])
  

  useEffect(() => {
    fetchData()
  }, [])

//   useEffect(() => {
//     const data = {
//   "fileName": "user_feedback.csv",
//   "projectName": "Voice Bot UX Analysis",
//   "agentName": "AI UX Evaluator",
//   "timestamp": "2025-05-27T15:30:00Z",
  
//   "performanceMetrics": {
//     "successRate": 20.5,
//     "errorRate": 4.2,
//     "responseTime": 49,
//     "accuracy": 93.4
//   },
//   "analysisResults": {
//     "totalRecords": 150,
//     "processedRecords": 145,
//     "errorRecords": 5,
//     "summary": "Majority of cases processed successfully, minor errors detected.",
    
//   },
//   "userTest": [
//     { "id": 0, "value": 10, "label": "เขียว" },
//     { "id": 1, "value": 15, "label": "พิม" },
//     { "id": 2, "value": 20, "label": "น้ำ" },
//     { "id": 3, "value": 20, "label": "น้ำตก" },
//   ],
//   "testCase": [
//     { "data": [1] },
//     { "data": [5] },
//     { "data": [4] },
//     { "data": [7] },
//     { "data": [5] },
//   ],
  
// "feedback": 
//   [
//     {
//     "group": 
//     "กลุ่มปัญหาการรู้จำเสียงพูด (ASR)",
//     "count": 14
//     },
//     {
//     "group": 
//     "กลุ่มปัญหาเกี่ยวกับการเข้าใจวัน เวลา หรือบอทตอบเรื่องเวลา/วัน",
//     "count": 9
//     },
//     {
//     "group": 
//     "กลุ่มปัญหาอื่นๆ",
//     "count": 8
//     }
//   ]
// }
//     // Simulate fetching data from the webhook
//     setWebhookResponseData(data)
//     setShowResultDashboard(true)
//     setLastSuccess("ข้อมูลตัวอย่างถูกโหลดเรียบร้อยแล้ว")
//   }, [])



  const handleProjectCreated = () => {
    fetchData() // Refresh data
  }

  const handleAgentCreated = () => {
    fetchData() // Refresh data
  }

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Check if URL is localhost or ngrok
  const isExternalUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.includes("ngrok") || urlObj.hostname !== "localhost"
    } catch {
      return false
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Auto-fill the file name field if it's empty
      if (!fileName) {
        setFileName(selectedFile.name.replace(/\.csv$/, ""))
      }
      setLastError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLastError(null)
    setLastSuccess(null)

    // Validation
    if (!file) {
      const error = "กรุณาเลือกไฟล์ CSV เพื่ออัปโหลด"
      setLastError(error)
      toast({
        title: "ไม่ได้เลือกไฟล์",
        description: error,
        variant: "destructive",
      })
      return
    }

    if (!fileName || !projectId || !agentId || !webhookUrl) {
      const error = "กรุณากรอกข้อมูลให้ครบทุกช่อง"
      setLastError(error)
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: error,
        variant: "destructive",
      })
      return
    }

    // Validate URL
    if (!isValidUrl(webhookUrl)) {
      const error = "URL ไม่ถูกต้อง กรุณาตรวจสอบรูปแบบ URL"
      setLastError(error)
      toast({
        title: "URL ไม่ถูกต้อง",
        description: error,
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
      const error = "กรุณาเลือกไฟล์ CSV"
      setLastError(error)
      toast({
        title: "ประเภทไฟล์ไม่ถูกต้อง",
        description: error,
        variant: "destructive",
      })
      return
    }

    // Get the selected project and agent names
    const selectedProject = projects.find((p) => p.id === projectId)
    const selectedAgent = agents.find((a) => a.id === agentId)

    if (!selectedProject || !selectedAgent) {
      const error = "การเลือกโปรเจกต์หรือเอเจนต์ไม่ถูกต้อง"
      setLastError(error)
      toast({
        title: "ข้อผิดพลาดในการเลือก",
        description: error,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileName", fileName)
      formData.append("projectId", projectId)
      formData.append("agentId", agentId)
      formData.append("projectName", selectedProject.name)
      formData.append("agentName", selectedAgent.name)

      const result = await sendFileToWebhook(formData , webhookUrl)

      await DatabaseService.createVoicebotUXReport(result.data)

      console.log("Webhook result:", result.data)

      // Parse the webhook response using the actual data from webhook
      // const parsedResponse = parseWebhookResponse(
      //   result.data || {}, // The actual webhook response data
      //   fileName,
      //   selectedProject.name,
      //   selectedAgent.name,
      //   result.timestamp,
      // )

      
      console.log("Res Data :", result.data)

      setWebhookResponseData(result.data)
      setShowResultDashboard(true)

      const successMessage = `ข้อมูล CSV สำหรับ "${fileName}" ถูกส่งไปยัง webhook เรียบร้อยแล้ว`
      setLastSuccess(successMessage)

      toast({
        title: "สำเร็จ!",
        description: successMessage,
      })

      // Dispatch event for components that need to refresh
      window.dispatchEvent(new CustomEvent("new-upload"))

      // Reset form
      setFileName("")
      setProjectId("")
      setAgentId("")
      setFile(null)
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Error sending webhook:", error)
      const errorMessage = error instanceof Error ? error.message : "ข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      setLastError(errorMessage)

      toast({
        title: "ข้อผิดพลาด Webhook",
        description: `ไม่สามารถส่งข้อมูลไปยัง webhook: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            ส่ง CSV ไปยัง Webhook
          </CardTitle>
          <CardDescription>อัปโหลดไฟล์ CSV และส่งไปยัง webhook พร้อมข้อมูลเมตา</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Messages */}
          {lastError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{lastError}</AlertDescription>
            </Alert>
          )}

          {lastSuccess && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/20 dark:text-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{lastSuccess}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 ">

            {/* Project Selection */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="project-name">ชื่อโปรเจกต์</Label>
                <div className="flex gap-2">
                  <Select
                  
                    onValueChange={(value) => {
                      setProjectId(value)
                      
                      setLastError(null)
                    }}
                    required
                  >
                    <SelectTrigger id="project-name" className="flex-1">
                      <SelectValue placeholder="เลือกโปรเจกต์" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id} >
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
              </div>

              <div className="space-y-2 col-span-1" >
                <Label htmlFor="agent-name">ประเภทการทดสอบ</Label>
                <div className="flex gap-2">
                  <Select
                    value={agentId}
                    disabled
                    onValueChange={(value) => {
                      setAgentId(value)
                      setLastError(null)
                      
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
                  
                </div>
              </div>
            </div>
            

            {/* File Upload Section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className={`space-y-2 ${hidden} col-span-2 `} >
              <Label htmlFor="file-upload">ไฟล์ CSV</Label>
              <div className="grid w-full gap-2">
                <Input
                  
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  required
                />
                {file && (
                  <Card className="p-3 flex items-center gap-2 bg-muted/50">
                    <FileUp className="h-4 w-4" />
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                  </Card>
                )}
              </div>
              
            </div>
             <div className={`space-y-2 ${hidden} col-span-1 transition-all`}>
                <Label htmlFor="file-name">ชื่อไฟล์</Label>
                <Input
                  id="file-name"
                  placeholder="ใส่ชื่อไฟล์ที่อธิบายได้"
                  value={fileName}
                  onChange={(e) => {
                    setFileName(e.target.value)
                    setLastError(null)
                  }}
                  required
                />
              </div>
            </div>

            {/* Webhook URL and File Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
              <div className="space-y-2 hidden">
                <Label htmlFor="webhook-url ">URL Webhook</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://webhook-url.com/endpoint"
                  value={webhookUrl}
                  onChange={(e) => {
                    setWebhookUrl(e.target.value)
                    setLastError(null)
                  }}
                  className={lastError && !isValidUrl(webhookUrl) ? "border-destructive" : ""}
                  required
                />
                {webhookUrl && isExternalUrl(webhookUrl) && (
                  <p className="text-xs text-green-600 dark:text-green-400">✅ กำลังใช้ webhook URL ภายนอก</p>
                )}
              </div>

            </div>

            {/* Project and Agent Selection */}
            

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading || !file || loadingData} className="min-w-[160px]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    ส่งไปยัง Webhook
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {showResultDashboard && webhookResponseData && voiceResult && (
        <WebhookResultDashboard
          data={webhookResponseData}
          onClose={() => {
            setShowResultDashboard(false)
            setWebhookResponseData(null)
          }}
          onDownloadReport={() => {
            console.log("Download report for:", webhookResponseData.fileName)
          }}
        />
      )}

      {showResultDashboard && webhookResponseData && chatbotResult && (
        <WebhookResultDashboardChatbot
          data={webhookResponseData}
          onClose={() => {
            setShowResultDashboard(false)
            setWebhookResponseData(null)
          }}
          onDownloadReport={() => {
            console.log("Download report for:", webhookResponseData.fileName)
          }}
        />
      )}
    </div>
  )
}
