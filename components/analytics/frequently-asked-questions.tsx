"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MessageCircle, Hash } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardFilters } from "../analytics-dashboard"

interface FAQ {
  question: string
  category: string
  frequency: number
  percentage: number
}

interface FrequentlyAskedQuestionsProps {
  filters?: DashboardFilters
}

export function FrequentlyAskedQuestions({ filters }: FrequentlyAskedQuestionsProps) {
  const [faqData, setFaqData] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFAQs() {
      try {
        setLoading(true)

        // Build query parameters based on filters
        const params = new URLSearchParams()

        if (filters?.dateRange?.from) {
          params.append("from", filters.dateRange.from.toISOString())
        }
        if (filters?.dateRange?.to) {
          params.append("to", filters.dateRange.to.toISOString())
        }

        const response = await fetch(`/api/dashboard-summary?${params.toString()}`)
        const result = await response.json()

        if (result.success && result.data.length > 0) {
          // Aggregate FAQs from all summaries
          const allFAQs: FAQ[] = []

          result.data.forEach((summary: any) => {
            if (summary.frequent_questions && Array.isArray(summary.frequent_questions)) {
              allFAQs.push(...summary.frequent_questions)
            }
          })

          // Group and aggregate FAQs by question
          const faqMap: { [key: string]: FAQ } = {}
          allFAQs.forEach((faq) => {
            if (faqMap[faq.question]) {
              faqMap[faq.question].frequency += faq.frequency
            } else {
              faqMap[faq.question] = { ...faq }
            }
          })

          const aggregatedFAQs = Object.values(faqMap)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10)

          setFaqData(aggregatedFAQs)
        } else {
          setError("ไม่พบข้อมูล FAQ")
        }
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูล FAQ ได้")
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [filters])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">เกิดข้อผิดพลาด: {error}</p>
      </div>
    )
  }

  const maxFrequency = Math.max(...faqData.map((faq) => faq.frequency))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Most Frequently Asked Questions
          </CardTitle>
          <CardDescription>Top questions from testing sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {faqData.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">ยังไม่��ีข้อมูล FAQ ในระบบ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-relaxed flex-1">{faq.question}</p>
                    <Badge variant="secondary" className="ml-2">
                      {faq.frequency}
                    </Badge>
                  </div>
                  <Progress value={(faq.frequency / maxFrequency) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    หมวดหมู่: {faq.category} • {faq.percentage}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Question Categories
          </CardTitle>
          <CardDescription>Distribution of question categories</CardDescription>
        </CardHeader>
        <CardContent>
          {faqData.length === 0 ? (
            <div className="text-center py-8">
              <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">ยังไม่มีข้อมูล Categories ในระบบ</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {/* Category Distribution */}
                {Array.from(new Set(faqData.map((faq) => faq.category))).map((category, index) => {
                  const categoryFAQs = faqData.filter((faq) => faq.category === category)
                  const totalFrequency = categoryFAQs.reduce((sum, faq) => sum + faq.frequency, 0)
                  const percentage = Math.round(
                    (totalFrequency / faqData.reduce((sum, faq) => sum + faq.frequency, 0)) * 100,
                  )

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <Badge variant="outline">{totalFrequency}</Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">{percentage}%</div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">สรุปหมวดหมู่</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(faqData.map((faq) => faq.category))).map((category, index) => {
                    const count = faqData.filter((faq) => faq.category === category).length
                    return (
                      <Badge key={index} variant="secondary">
                        {category} ({count})
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
