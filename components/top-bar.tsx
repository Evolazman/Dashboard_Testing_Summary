"use client"

import { MobileSidebar } from "@/components/sidebar"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <MobileSidebar />
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">CSV</span>
            </div>
            <span className="font-bold text-sm">แดชบอร์ด CSV</span>
          </div>
        </div>

        <ThemeToggleSimple />
      </div>
    </header>
  )
}
