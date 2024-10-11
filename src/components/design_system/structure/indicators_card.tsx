"use client"

import { IndicatorData } from "@/types"
import Panel from "./panel"

interface IndicatorCardProps {
  title: string
  value: string | number
  className?: string
}

const IndicatorCard = ({ title, value, className = "" }: IndicatorCardProps) => {
  return (
    <div className={`flex flex-col items-center justify-center  ${className}`}>
      <span className="text-sm ">{title}</span>
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
    <Panel className={`inline-flex gap-10 w-auto  ${className}`}>
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
