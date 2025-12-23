"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type DynamicProgressBarProps = {
  progressBarColor: string
  currentValue: bigint
  maxValue: bigint
}

export const DynamicProgressBar = ({ progressBarColor, currentValue, maxValue }: DynamicProgressBarProps) => {
  const percentage = Number((currentValue * 100n) / maxValue)

  const [dynamicPercentage, setDynamicPercentage] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDynamicPercentage(percentage)
    }, 100)

    return () => clearTimeout(timeout)
  }, [percentage])

  return (
    <div className="w-full rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
      <div className="h-2 w-full overflow-hidden rounded-full bg-overlay-panel backdrop-blur-[60px]">
        <div className={cn(progressBarColor + " h-full rounded-xl transition-all duration-1000 ease-out")} style={{ width: `${dynamicPercentage}%` }} />
      </div>
    </div>
  )
}
