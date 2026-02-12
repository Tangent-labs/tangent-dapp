"use client"

import { ReactNode } from "react"
import { IndicatorData } from "@/types"
import { ReliefCard } from "./relief_card"

type IndicatorCardProps = {
  title: string
  value: string | number
  className?: string
}

export const IndicatorCard = ({ title, value, className = "" }: IndicatorCardProps) => {
  return (
    <div className={`flex w-full flex-col items-center justify-center gap-1 ${className}`}>
      <span className="flex w-full justify-center text-center text-sm font-semibold">{title}</span>
      <span className="text-xs text-subtitle">{value}</span>
    </div>
  )
}

interface IndicatorCardsProps {
  indicators: IndicatorData[]
  className?: string
  children?: ReactNode
}

const IndicatorCards = ({ indicators, className = "", children }: IndicatorCardsProps) => {
  return (
    <ReliefCard
      className={`flex w-full items-center justify-between rounded-[10px] border-white border-opacity-20 bg-overlay-panel p-4 backdrop-blur-[60px] ${className}`}
    >
      {children}
      {indicators.map((indicator, index) => (
        <IndicatorCard key={index} title={indicator.title} value={indicator.value} />
      ))}
    </ReliefCard>
  )
}

export default IndicatorCards
