import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "แดชบอร์ด CSV Webhook",
  description: "ส่งไฟล์ CSV ไปยัง n8n webhooks และวิเคราะห์ข้อมูล",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-background">
            {/* Mobile Top Bar */}
            <TopBar />

            <div className="flex h-screen md:h-screen">
              {/* Desktop Sidebar */}
              <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <Sidebar />
              </div>

              {/* Main Content */}
              <div className="flex-1 md:ml-64">
                <main className="flex-1 overflow-y-auto">
                  <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">{children}</div>
                </main>
              </div>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
