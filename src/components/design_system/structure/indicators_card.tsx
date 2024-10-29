"use client"

import { IndicatorData } from "@/types"
import Panel from "@/components/design_system/structure/panel"

interface IndicatorCardProps {
  title: string
  value: string | number
  className?: string
}

const IndicatorCard = ({ title, value, className = "" }: IndicatorCardProps) => {
  return (
    <div className={`flex flex-col justify-center lg:items-center ${className}`}>
      <span className="text-sm">{title}</span>
      <span className="text-xs text-gray-400">{value}</span>
    </div>
  )
}

interface IndicatorCardsProps {
  indicators: IndicatorData[]
  className?: string
}

const IndicatorCards = ({ indicators, className = "" }: IndicatorCardsProps) => {
  return (
    <Panel className={`inline-flex w-auto gap-2 lg:gap-10 ${className}`}>
      {indicators.map((indicator, index) => (
        <IndicatorCard key={index} title={indicator.title} value={indicator.value} />
      ))}
    </Panel>
  )
}

export default IndicatorCards

/* 

  const indicators = [
    { title: 'Total Deposited', value: '$100,000' },
    { title: 'Total Claimable', value: '$40,000' },
  ];

  return (
    <div className="p-8">
      <IndicatorCards indicators={indicators} />
    </div>
  );
  */
