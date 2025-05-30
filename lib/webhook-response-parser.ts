interface WebhookResponseData {
  fileName: string
  projectName: string
  agentName: string
  timestamp: string
  performanceMetrics?: {
    successRate?: number
    errorRate?: number
    responseTime?: number
    accuracy?: number
  }
  analysisResults?: {
    totalRecords?: number
    processedRecords?: number
    errorRecords?: number
    summary?: string
    recommendations?: string[]
  }
  detectedIssues?: Array<{
    type: string
    severity: "low" | "medium" | "high"
    count: number
    description: string
  }>
  processingDetails?: {
    duration: number
    steps: Array<{
      name: string
      status: "completed" | "failed" | "skipped"
      duration?: number
      message?: string
    }>
  }

  testCase?: Array<{ data: number[] }>

  userTest?: Array<{ id: number, value: number, label: string }>

  [key: string]: any
}

export function parseWebhookResponse(
  rawResponse: any,
  fileName: string,
  projectName: string,
  agentName: string,
  timestamp: string,
): WebhookResponseData {
  console.log("Parsing webhook response:", rawResponse)

  // Base response structure
  const parsedResponse: WebhookResponseData = {
    fileName,
    projectName,
    agentName,
    timestamp,
  }

  // Parse performance metrics from various possible response formats
  if (rawResponse.performance || rawResponse.performanceMetrics || rawResponse.metrics) {
    const perfData = rawResponse.performance || rawResponse.performanceMetrics || rawResponse.metrics
    parsedResponse.performanceMetrics = {
      successRate: Number.parseFloat(perfData.successRate || perfData.success_rate || 0),
      errorRate: Number.parseFloat(perfData.errorRate || perfData.error_rate || 0),
      responseTime: Number.parseInt(
        perfData.responseTime || perfData.response_time || perfData.averageResponseTime || 0,
      ),
      accuracy: Number.parseFloat(perfData.accuracy || 0),
    }
  }

  // Parse analysis results
  if (rawResponse.analysis || rawResponse.analysisResults || rawResponse.results) {
    const analysisData = rawResponse.analysis || rawResponse.analysisResults || rawResponse.results
    parsedResponse.analysisResults = {
      totalRecords: Number.parseInt(analysisData.totalRecords || analysisData.total_records || analysisData.total || 0),
      processedRecords: Number.parseInt(
        analysisData.processedRecords || analysisData.processed_records || analysisData.processed || 0,
      ),
      errorRecords: Number.parseInt(
        analysisData.errorRecords || analysisData.error_records || analysisData.errors || 0,
      ),
      summary: analysisData.summary || analysisData.description || "ประมวลผลข้อมูลเรียบร้อยแล้ว",
      recommendations: analysisData.recommendations || rawResponse.recommendations || [],
    }
  }

  // Parse detected issues
  if (rawResponse.issues || rawResponse.detectedIssues || rawResponse.warnings) {
    const issuesData = rawResponse.issues || rawResponse.detectedIssues || rawResponse.warnings
    if (Array.isArray(issuesData)) {
      parsedResponse.detectedIssues = issuesData.map((issue: any) => ({
        type: issue.type || issue.name || "Unknown Issue",
        severity: (issue.severity || issue.level || "medium") as "low" | "medium" | "high",
        count: Number.parseInt(issue.count || issue.frequency || 1),
        description: issue.description || issue.message || issue.details || "ไม่มีรายละเอียด",
      }))
    }
  }

  // Parse processing details
  if (rawResponse.processing || rawResponse.processingDetails || rawResponse.steps) {
    const processingData = rawResponse.processing || rawResponse.processingDetails
    parsedResponse.processingDetails = {
      duration: Number.parseInt(processingData?.duration || processingData?.processingTime || 0),
      steps: [],
    }

    // Parse processing steps
    const stepsData = processingData?.steps || rawResponse.steps || []
    if (Array.isArray(stepsData)) {
      parsedResponse.processingDetails.steps = stepsData.map((step: any) => ({
        name: step.name || step.step || step.action || "Unknown Step",
        status: (step.status || step.state || "completed") as "completed" | "failed" | "skipped",
        duration: Number.parseInt(step.duration || step.time || 0),
        message: step.message || step.description || "",
      }))
    }
  }

  // If no structured data found, try to extract from top-level response
  if (!parsedResponse.performanceMetrics && !parsedResponse.analysisResults) {
    // Try to extract basic metrics from top-level response
    if (rawResponse.success !== undefined || rawResponse.status !== undefined) {
      parsedResponse.analysisResults = {
        totalRecords: 1,
        processedRecords: rawResponse.success || rawResponse.status === "success" ? 1 : 0,
        errorRecords: rawResponse.success || rawResponse.status === "success" ? 0 : 1,
        summary: rawResponse.message || rawResponse.description || "ประมวลผลข้อมูลเรียบร้อยแล้ว",
        recommendations: [],
      }
    }
  }

  console.log("Parsed response result:", parsedResponse)
  return parsedResponse
}

export function generateSampleWebhookResponse(fileName: string, projectName: string, agentName: string) {
  // This function is no longer used since we're using real webhook data
  return parseWebhookResponse({}, fileName, projectName, agentName, new Date().toISOString())
}
