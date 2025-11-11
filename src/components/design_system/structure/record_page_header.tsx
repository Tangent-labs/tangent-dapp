import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import USGHoverCard from "./usg_hover_card"
import { MarketAPR } from "@/components/products/tg_usd/tg_usd_type"

type RecordPageHeaderProps = {
  apr?: MarketAPR
  indicators?: RecordPageHeaderIndicatorProps[]
}

export default function RecordPageHeader({ apr, indicators }: RecordPageHeaderProps) {
  let totalCurrentAPR = 0
  let totalProjectedAPR = 0

  if (apr && apr?.currentAPR && apr?.projectedAPR) {
    totalCurrentAPR = Object.values(apr?.currentAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
    totalProjectedAPR = Object.values(apr?.projectedAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
  }

  return (
    <>
      <RecordPageHeaderIndicator
        title="APR"
        value={`${totalCurrentAPR ? `${totalCurrentAPR?.toFixed(2)}%` : "-"}`}
        subValue={`Proj: ${totalProjectedAPR ? `${totalProjectedAPR?.toFixed(2)}%` : "-"}`}
      />

      {indicators?.map((i, index) => (
        <RecordPageHeaderIndicator indicator={i?.indicator} key={index} title={i.title} value={i.value} subValue={i.subValue} className={i?.className || ""} />
      ))}
    </>
  )
}

type RecordPageHeaderIndicatorProps = {
  title: string
  value?: string | number | ReactNode
  subValue?: string | number | ReactNode
  indicator?: string
  className?: string
}

export const RecordPageHeaderIndicator = ({ title, value, subValue, indicator, className }: RecordPageHeaderIndicatorProps) => {
  return (
    <div
      className={cn(
        `flex min-h-20 w-full max-w-32 flex-col items-center justify-center xl:max-w-none`,
        `${title === "LT" ? "" : "xl:border-r xl:border-[#3F3F3F]"}`,
        `${title === "APR" ? "text-xl" : "text-[15px]"}`
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {title}
        <USGHoverCard iconClassName="h-auto w-[14px] text-white" title="">
          {indicator}
        </USGHoverCard>
      </div>

      <span className={cn("text-xl font-semibold", className, title === "APR" ? "text-row-tonic" : "")}>{value}</span>
      <span className="text-xs text-subtitle">{subValue}</span>
    </div>
  )
}
