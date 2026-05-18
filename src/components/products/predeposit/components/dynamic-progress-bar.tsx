"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type DynamicProgressBarProps = {
  progressBarColor: string
  currentValue: bigint
  maxValue: bigint
  secondaryValue?: bigint
  secondaryColor?: string
}

export const DynamicProgressBar = ({ progressBarColor, currentValue, maxValue, secondaryValue, secondaryColor }: DynamicProgressBarProps) => {
  const computePercentage = (value: bigint) => {
    if (!maxValue || maxValue <= 0n) return 0
    const clamped = value > maxValue ? maxValue : value
    return Number((clamped * 100n) / maxValue)
  }

  const percentage = computePercentage(currentValue)
  const secondaryPercentage = secondaryValue !== undefined ? computePercentage(secondaryValue) : 0

  const [dynamicPercentage, setDynamicPercentage] = useState(0)
  const [dynamicSecondaryPercentage, setDynamicSecondaryPercentage] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDynamicPercentage(percentage)
      setDynamicSecondaryPercentage(secondaryPercentage)
    }, 100)

    return () => clearTimeout(timeout)
  }, [percentage, secondaryPercentage])

  return (
    <div className="w-full rounded-[10px] bg-overlay-panel px-3 py-2.5 backdrop-blur-[60px]">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-overlay-panel backdrop-blur-[60px]">
        {secondaryValue !== undefined && (
          <div
            className={cn((secondaryColor ?? progressBarColor) + " absolute inset-y-0 left-0 rounded-xl opacity-40 transition-all duration-1000 ease-out")}
            style={{ width: `${dynamicSecondaryPercentage}%` }}
          />
        )}
        <div
          className={cn(progressBarColor + " absolute inset-y-0 left-0 rounded-xl transition-all duration-1000 ease-out")}
          style={{ width: `${dynamicPercentage}%` }}
        />
      </div>
    </div>
  )
}
