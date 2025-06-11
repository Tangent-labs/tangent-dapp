import { IndicatorData } from "@/types"
import { ReactNode } from "react"

type IndicatorCardProps = {
  title: string
  value: string | number
  className?: string
}

export const IndicatorCard = ({ title, value, className = "" }: IndicatorCardProps) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <span className="text-xs text-subtitle">{title}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  )
}

interface IndicatorCardsProps {
  indicators: IndicatorData[]
  className?: string
  children?: ReactNode
}

const IndicatorV2 = ({ indicators, className = "", children }: IndicatorCardsProps) => {
  return (
    <div className={`flex w-full min-w-32 items-center justify-center gap-2 rounded-[10px] bg-overlay-panel py-2 backdrop-blur-[60px] ${className}`}>
      {children}
      {indicators.map((indicator, index) => (
        <IndicatorCard key={index} title={indicator.title} value={indicator.value} />
      ))}
    </div>
  )
}

export default IndicatorV2
