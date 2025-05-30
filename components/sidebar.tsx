"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"
import { Menu, Send, Mic, Bot, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Webhook",
    href: "/webhook",
    icon: Send,
    description: "ส่ง Webhook แบบกำหนดเอง",
  },
  {
    name: "Chatbot",
    href: "/chatbot",
    icon: Bot,
    description: "แดชบอร์ด Chatbot",
  },
  {
    name: "VoiceBot",
    href: "/analytics",
    icon: Mic,
    description: "แดชบอร์ด VoiceBot",
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn("flex flex-col h-full bg-background border-r", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <Link href="/webhook" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CSV</span>
            </div>
            <span className="font-bold text-sm">แดชบอร์ด CSV</span>
          </Link>
        )}

        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
                  isCollapsed && "justify-center",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && <div className="text-xs text-muted-foreground">© 2024 แดชบอร์ด CSV</div>}
          <div className="flex items-center gap-2">{isCollapsed ? <ThemeToggleSimple /> : <ThemeToggle />}</div>
        </div>
      </div>
    </div>
  )
}

// Mobile Sidebar Component
export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">เปิดเมนู</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/webhook" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CSV</span>
              </div>
              <span className="font-bold">แดชบอร์ด CSV Webhook</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div>{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">© 2024 แดชบอร์ด CSV</div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
