"use client"

import { IndicatorData } from "@/types"
import Panel from "@/components/design_system/structure/panel"
import { ReactNode } from "react"

type IndicatorCardProps = {
  title: string
  value: string | number
  className?: string
}

export const IndicatorCard = ({ title, value, className = "" }: IndicatorCardProps) => {
  return (
    <div className={`flex flex-col justify-center lg:items-center ${className}`}>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-gray-400">{value}</span>
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
    <Panel className={`inline-flex w-auto gap-4 !border-none ${className}`}>
      {children}
      {indicators.map((indicator, index) => (
        <IndicatorCard key={index} title={indicator.title} value={indicator.value} />
      ))}
    </Panel>
  )
}

export default IndicatorCards
