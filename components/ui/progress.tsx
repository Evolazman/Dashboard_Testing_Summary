"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    color?: string
  }
>(({ className, value, color, ...props }, ref) => {
  // Normalize ค่า value ให้อยู่ในช่วง 0-100
  const safeValue = Math.max(0, Math.min(100, value || 0))

  // ตรวจสอบช่วงของค่า value และกำหนดสีตามช่วง
  let dynamicColor = color
  if (safeValue < 25) {
    dynamicColor = "#FB4141" // แดง
  } else if (safeValue < 50) {
    dynamicColor = "#FFD966" // เหลือง
  } else {
    dynamicColor = "#3ED598" // เขียว
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - safeValue}%)`,
          backgroundColor: dynamicColor,
        }}
      />
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
