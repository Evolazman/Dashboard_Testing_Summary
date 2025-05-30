"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2, FileText, Clock, BarChart3, X, Download, RefreshCw , ChartPie } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { exportToPDF } from "@/lib/pdf-export"
import { PieChart  } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { BarLabelProps, BarPlot } from '@mui/x-charts/BarChart';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { useAnimate } from '@mui/x-charts/hooks';
interface WebhookResultDashboardChatbot {
  // Basic info
  fileName: string
  projectName: string
  agentName: string
  timestamp: string

  // Performance metrics (similar to dashboard)
  performanceMetrics?: {
    successRate?: number
    errorRate?: number
    responseTime?: number
    accuracy?: number
  }

  // Analysis results
  analysisResults?: {
    totalRecords?: number
    processedRecords?: number
    errorRecords?: number
    summary?: string
    recommendations?: string[]
  }

  // Issues detected
  detectedIssues?: Array<{
    type: string
    severity: "low" | "medium" | "high"
    count: number
    description: string
  }>

  // Processing details
  processingDetails?: {
    duration: number
    steps: Array<{
      name: string
      status: "completed" | "failed" | "skipped"
      duration?: number
      message?: string
    }>
  }

  testCase?: string[]

  userTest?: string[]

  feedback?: Array<{ group: string , count: number}>

  // Additional data from webhook
  [key: string]: any
}

interface WebhookResultDashboardProps {
  data: WebhookResultDashboardChatbot
  onClose: () => void
  onDownloadReport?: () => {
    exportToPDF: (elementId: string, options?: { filename?: string; quality?: number; format?: "a4" | "a3" | "letter"; orientation?: "portrait" | "landscape" }) => Promise<void>
  }
}

export function WebhookResultDashboardChatbot({ data, onClose, onDownloadReport }: WebhookResultDashboardProps) {
  
  const [isVisible, setIsVisible] = useState(false)
  if (data.userTest) {
  data.userTest.forEach(ut => {
    console.log(ut.id, ut.value, ut.label);
  });
}

if (data.testCase) {
  data.testCase.forEach(tc => {
    console.log(tc.data);
  });
}

if (data.performanceMetrics) {
  if (data.performanceMetrics.accuracy < 1 && data.performanceMetrics.successRate < 1 && data.performanceMetrics.errorRate < 1 && data.performanceMetrics.responseTime < 1) {
    data.performanceMetrics.accuracy = Math.round(data.performanceMetrics.accuracy * 100)
    data.performanceMetrics.successRate = Math.round(data.performanceMetrics.accuracy * 100)
    data.performanceMetrics.errorRate = Math.round(data.performanceMetrics.accuracy * 100)
    data.performanceMetrics.responseTime = Math.round(data.performanceMetrics.accuracy * 100)

  }
}

console.log("WebhookResultDashboardChatbot data:", data)
  useEffect(() => {
    // Animate in
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation
  }

  // Calculate overall success rate
  const calculateSuccessRate = () => {
    if (data.analysisResults?.totalRecords && data.analysisResults?.processedRecords) {
      return Math.round((data.analysisResults.processedRecords / data.analysisResults.totalRecords) * 100)
    }
    return data.performanceMetrics?.successRate || 0
  }

  // Get processing status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "failed":
        return "text-red-600"
      case "skipped":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  useEffect(() => {
    console.log("WebhookResultDashboardChatbot data:", data.userTest)
  }, [data.userTest])

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-background bg-cyan-900 opacity-95 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto transition-transform duration-300 ${isVisible ? "scale-100" : "scale-95"}`}
      >
        {/* Header */}
        <div className=" top-0 bg-background border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              ผลการประมวลผล Webhook
            </h2>
            <p className="text-muted-foreground mt-1">ไฟล์ "{data.fileName}" ถูกประมวลผลเรียบร้อยแล้ว</p>
          </div>
          <div className="flex items-center gap-2">
            {onDownloadReport && (
              <Button variant="outline" size="sm" onClick={onDownloadReport}>
                <Download className="h-4 w-4 mr-2" />
                ดาวน์โหลดรายงาน
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Alert */}
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>ประมวลผลสำเร็จ!</strong> ข้อมูลของคุณถูกส่งไปยัง webhook และประมวลผลเรียบร้อยแล้ว
            </AlertDescription>
          </Alert>

          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-3 ">
            <Card className="bg-cyan-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  ข้อมูลไฟล์
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">ชื่อไฟล์</p>
                  <p className="font-medium">{data.fileName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">โปรเจกต์</p>
                  <p className="font-medium">{data.projectName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">เอเจนต์</p>
                  <p className="font-medium">{data.agentName}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyan-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  เวลาประมวลผล
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">เริ่มต้น</p>
                  <p className="font-medium">{new Date(data.timestamp).toLocaleString("th-TH")}</p>
                </div>
                {data.processingDetails?.duration && (
                  <div>
                    <p className="text-xs text-muted-foreground">ระยะเวลา</p>
                    <p className="font-medium">{data.processingDetails.duration} วินาที</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-cyan-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  ผลลัพธ์รวม
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{calculateSuccessRate()}%</div>
                  <p className="text-xs text-muted-foreground">อัตราความสำเร็จ</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
            
          <div className="grid gap-4 md:grid-cols-3 ">
            { data.userTest &&(
            <Card className="text-white bg-cyan-900 col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ChartPie className="h-4 w-4" />
                  Tester
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2  pt-20">
                <div >
                <PieChart 
                  colors={['#77B254', '#533E85', '#5A827E' , '#00CAFF','#DA6C6C']}
                  series={[
                    
                    {
                      data: data.userTest ,
                      
                      innerRadius: 20,
                      outerRadius: 90,
                      paddingAngle: 5,
                      cornerRadius: 7,
                      startAngle: -45,
                      highlightScope: { fade: 'global', highlight: 'item' },
                      faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                      
                      
                    },
                    
                  ]}
                  
                  labelStyle={{ fontSize: '20px', fill: 'var(--your-theme-color)' }}
                  width={200}
                  height={200}
                  
                />
                </div>
              </CardContent>
            </Card>
            )}
          {/* Performance Metrics */}


            {data.performanceMetrics && (
            <Card className="bg-cyan-900 col-span-2">
              <CardHeader>
                <CardTitle>ตัวชี้วัดประสิทธิภาพ</CardTitle>
                <CardDescription>ผลการประเมินประสิทธิภาพการประมวลผล</CardDescription>
              </CardHeader>
              <CardContent>
                
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 border-solid border-green-200 dark:border-green-700 p-4 rounded-lg">
                    {data.performanceMetrics.successRate !== undefined && (
                      <div className="space-y-2 border border-gray-300 shadow-md rounded-xl p-4">
                        <div className="flex justify-between text-lg font-bold text-green-300">
                          <span>Success Rate</span>
                          <span className="font-medium">{data.performanceMetrics.successRate}%</span>
                        </div>
                        <Progress value={data.performanceMetrics.successRate} color="#A0C878" className="h-2" />
                        <div>
                          
                          <div className="mt-4 grid gap-2 md:grid-cols-2">
                            <div className=" text-sm text-gray-300">จำนวนข้อมูลทั้งหมด</div>
                            <div className=" text-sm text-right">100</div>
                          </div>
                          <div className="mt-1 grid gap-5 md:grid-cols-2">
                            <div className="text-xs text-green-500">
                              สำเร็จ 60
                            </div>
                            <div className="text-xs text-red-500 text-right">
                              ไม่สำเร็จ 40
                            </div>
                          </div>
                        </div>
                        
                        
                      </div>
                    )}
                   

                  {data.performanceMetrics.errorRate !== undefined && (
                    <div className="space-y-2 border border-gray-300 shadow-md rounded-xl p-4">
                      <div className="flex justify-between text-lg font-bold text-green-300">
                        <span>Error rate Count</span>
                        <span className="font-medium">{data.performanceMetrics.errorRate}%</span>
                      </div>
                      <Progress value={data.performanceMetrics.errorRate} className="h-2" />
                      <div>
                          
                          <div className="mt-4 grid gap-2 md:grid-cols-2">
                            <div className=" text-sm text-gray-300">จำนวนข้อมูลทั้งหมด</div>
                            <div className=" text-sm text-right">100</div>
                          </div>
                          <div className="mt-1 grid gap-5 md:grid-cols-2">
                            <div className="text-xs text-green-500">
                              สำเร็จ 60
                            </div>
                            <div className="text-xs text-red-500 text-right">
                              ไม่สำเร็จ 40
                            </div>
                          </div>
                        </div>
                    </div>
                  )}

                  {data.performanceMetrics.responseTime !== undefined && (
                    <div className="space-y-2 border border-gray-300 shadow-md rounded-xl p-4">
                      <div className="flex justify-between text-lg font-bold text-green-300">
                        <span>Sasi</span>
                        <span className="font-medium">{data.performanceMetrics.responseTime}%</span>
                      </div>
                      <Progress value={data.performanceMetrics.responseTime} className="h-2" />
                      <div>
                          
                          <div className="mt-4 grid gap-2 md:grid-cols-2">
                            <div className=" text-sm text-gray-300">จำนวนข้อมูลทั้งหมด</div>
                            <div className=" text-sm text-right">100</div>
                          </div>
                          <div className="mt-1 grid gap-5 md:grid-cols-2">
                            <div className="text-xs text-green-500">
                              สำเร็จ 60
                            </div>
                            <div className="text-xs text-red-500 text-right">
                              ไม่สำเร็จ 40
                            </div>
                          </div>
                        </div>
                    </div>
                  )}

                  {data.performanceMetrics.accuracy !== undefined && (
                    <div className="space-y-2 border border-gray-300 shadow-md rounded-xl p-4">
                      <div className="flex justify-between text-lg font-bold text-green-300">
                        <span>SUS</span>
                        <span className="font-medium">{data.performanceMetrics.accuracy}%</span>
                      </div>
                      <Progress value={data.performanceMetrics.accuracy} className="h-2" />
                      <div>
                          
                          <div className="mt-4 grid gap-2 md:grid-cols-2">
                            <div className=" text-sm text-gray-300">จำนวนข้อมูลทั้งหมด</div>
                            <div className=" text-sm text-right">100</div>
                          </div>
                          <div className="mt-1 grid gap-5 md:grid-cols-2">
                            <div className="text-xs text-green-500">
                              สำเร็จ 60
                            </div>
                            <div className="text-xs text-red-500 text-right">
                              ไม่สำเร็จ 40
                            </div>
                          </div>
                        </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          </div>


          { data.testCase && (
          <Card className="bg-cyan-900">
                <CardHeader>
                  <CardTitle>Test case</CardTitle>
                  <CardDescription>สรุปผล Test Case </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BarChart
                    xAxis={[{ data: ['Test Case'] }]}
                    series={data.testCase}
                    colors={['#77B254', '#533E85', '#5A827E' , '#00CAFF','#DA6C6C']}
                    height={300}
                    barLabel="value"
                    borderRadius={30}
                  />
                  <div className="display flex items-center justify-center w-full grid grid-cols-3 gap-2">
                    <div className="flex">
                      <div className="w-2 h-2 rounded-full bg-[#77B254] p-2"></div>
                      <p className="ml-2 mr-5 text-xs text-start">สะดวก-ยืนยัน-วางสาย</p>
                    </div>
                    <div className="flex">
                      <div className="w-2 h-2 rounded-full bg-[#533E85] p-2">  </div>
                      <p className="ml-2 mr-5 text-xs">ไม่สะดวก นัดใหม่ (แจ้งวันก่อน -> เวลา ) วางสาย</p>
                    </div>

                    <div className="flex">
                      <div className="w-2 h-2 rounded-full bg-[#5A827E] p-2">  </div>
                      <p className="ml-2 mr-5 text-xs">ไม่สะดวก นัดใหม่ (แจ้งเวลาก่อน -> วัน ) วางสาย</p>
                    </div>

                    <div className="flex">
                      <div className="w-2 h-2 rounded-full bg-[#00CAFF] p-2">  </div>
                      <p className="ml-2 mr-5 text-xs">ไม่สะดวก นัดใหม่ (แจ้งวัน + เวลา) วางสาย</p>
                    </div>

                    <div className="flex">
                      <div className="w-2 h-2 rounded-full bg-[#DA6C6C] p-2">  </div>
                      <p className="ml-2 mr-5 text-xs">ยกเลิก โทรนัดใหม่ วางสาย</p>
                    </div>

                    
                  </div>
                </CardContent>
              </Card>
              )}
          
          {/* Detected Issues */}
          {/* Analysis Results */}
          {data.analysisResults && (
            
              <Card className="bg-cyan-900">
                <CardHeader>
                  <CardTitle>ผลการวิเคราะห์ข้อมูล</CardTitle>
                  <CardDescription>สรุปผลการประมวลผลข้อมูล CSV</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {data.analysisResults.totalRecords?.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">รายการ Dialog ทั้งหมด</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {data.analysisResults.processedRecords?.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">รายการ Case ทั้งหมด</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {data.analysisResults.errorRecords?.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">การแจ้ง Feedback</p>
                    </div>
                  </div>

                  {data.analysisResults.summary && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">สรุปผล</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{data.analysisResults.summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              
              
            
          )}
        <Card className="bg-cyan-900">
                <CardHeader>
                  <CardTitle>Feedback Summary</CardTitle>
                  <CardDescription>สรุป Feedback ที่ได้รับ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.feedback?.map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg ${getSeverityColor(item.group)}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.group}</span>
                        <span className="text-lg font-bold">{item.count}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">จำนวน Feedback: {item.count}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              ปิด
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              ส่งไฟล์ใหม่
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
