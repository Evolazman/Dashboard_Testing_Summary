"use server"

import { revalidatePath } from "next/cache"
import { DatabaseService } from "./database"

export async function sendFileToWebhook(formData: FormData , webhookUrl: string) {
  try {
    // Get the file from the form data
    const file = formData.get("file") as File
    const fileName = formData.get("fileName") as string
    const projectId = formData.get("projectId") as string
    const projectName = formData.get("projectName") as string
    const agentId = formData.get("agentId") as string
    const agentName = formData.get("agentName") as string

    // Read the file content
    const fileBuffer = await file.arrayBuffer()
    const fileContent = Buffer.from(fileBuffer).toString()

    // Use the real webhook URL
    // const webhookUrl = "https://2f2c-184-22-39-189.ngrok-free.app/webhook-test/ab1b6138-5ee7-4aac-8522-39b5f1f3456e"

    console.log("Sending to webhook:", webhookUrl)

    // Send the file and metadata to the webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
      },
      body: JSON.stringify({
        fileName,
        projectId,
        projectName,
        agentId,
        agentName,
        fileContent,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        originalFileName: file.name,
      }),
    })

    console.log("Webhook response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Webhook responded with status: ${response.status}`, errorText)
      throw new Error(`Webhook responded with status: ${response.status} - ${errorText}`)
    }

    // Parse the response as JSON
    let responseData
    try {
      const responseText = await response.text()
      console.log("Raw webhook response:", responseText)

      if (responseText.trim()) {
        responseData = JSON.parse(responseText)
      } else {
        responseData = { success: true, message: "File processed successfully" }
      }
    } catch (parseError) {
      console.error("Error parsing webhook response:", parseError)
      throw new Error("Invalid JSON response from webhook")
    }

    console.log("Parsed webhook response:", responseData)

    // Save file upload record to database
    try {
      await DatabaseService.createFileUpload({
        file_name: fileName,
        original_file_name: file.name,
        project_id: projectId,
        agent_id: agentId,
        file_content: fileContent,
        file_size: file.size,
        webhook_url: webhookUrl,
        status: "success",
      })

      // Create a test session record when file is uploaded successfully
      await DatabaseService.createTestSession({
        session_id: `upload-${Date.now()}`,
        project_id: projectId,
        agent_id: agentId,
        platform: "Web",
        duration_seconds: Math.floor(Math.random() * 300 + 60),
        summary: `ไฟล์ ${fileName} ถูกอัปโหลดและประมวลผลเรียบร้อยแล้ว`,
        ux_evaluation: "Good",
        recommendations: ["ตรวจสอบข้อมูลที่อัปโหลด", "วิเคราะห์ผลลัพธ์"],
        tester_name: "ระบบอัตโนมัติ",
      })

      console.log("File upload and test session saved to database successfully")
    } catch (dbError) {
      console.error("Error saving to database:", dbError)
      // Don't throw here, as the webhook was successful
    }

    // Revalidate the dashboard page to show updated data
    revalidatePath("/")
    revalidatePath("/analytics")
    revalidatePath("/chatbot")

    return {
      success: true,
      fileName,
      projectName,
      agentName,
      timestamp: new Date().toISOString(),
      data: responseData,
    }
  } catch (error) {
    console.error("Error sending file to webhook:", error)

    // Try to save failed upload to database
    try {
      const fileName = formData.get("fileName") as string
      const file = formData.get("file") as File
      const projectId = formData.get("projectId") as string
      const agentId = formData.get("agentId") as string

      if (fileName && file && projectId && agentId) {
        await DatabaseService.createFileUpload({
          file_name: fileName,
          original_file_name: file.name,
          project_id: projectId,
          agent_id: agentId,
          file_size: file.size,
          status: "error",
        })
      }
    } catch (dbError) {
      console.error("Error saving failed upload to database:", dbError)
    }

    throw new Error(error instanceof Error ? error.message : "Failed to send file to webhook")
  }
}
