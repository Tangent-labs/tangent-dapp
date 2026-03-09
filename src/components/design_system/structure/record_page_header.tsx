import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { IconCircleHelp } from "@/components/icons"
import { IconStars } from "@/components/icons/icon_stars"
import { MarketAPR } from "@/components/products/usg/usg_type"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type RecordPageHeaderProps = {
  maxLTV: number
  apr?: MarketAPR
  indicators?: RecordPageHeaderIndicatorProps[]
}

export function RecordPageHeader({ apr, indicators, maxLTV }: RecordPageHeaderProps) {
  let totalCurrentAPR = 0
  let totalProjectedAPR = 0

  const hasZeroApr = !!apr?.currentAPR && Object.values(apr?.currentAPR)?.some((v) => Number(v) === 0)

  if (apr && apr?.currentAPR && apr?.projectedAPR) {
    totalProjectedAPR = Object.values(apr?.projectedAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
    totalCurrentAPR = hasZeroApr ? totalProjectedAPR : (Object.values(apr?.currentAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number)
  }

  const maxLeverage = 1 / (1 - maxLTV)

  return (
    <>
      <RecordPageHeaderIndicator
        title="Collateral vAPR"
        value={`${totalCurrentAPR ? `${totalCurrentAPR?.toFixed(2)}%` : "-"}`}
        subValue={<div className="flex items-center text-xs text-subtitle">{`Proj: ${totalProjectedAPR ? `${totalProjectedAPR?.toFixed(2)}%` : "-"}`}</div>}
      />

      <RecordPageHeaderIndicator
        title="Max vAPR"
        value={`${totalCurrentAPR ? `${(totalCurrentAPR * maxLeverage)?.toFixed(2)}%` : "-"}`}
        subValue={
          <div className="flex items-center text-xs text-subtitle">{`Proj: ${totalProjectedAPR ? `${(totalProjectedAPR * maxLeverage)?.toFixed(2)}%` : "-"}`}</div>
        }
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
        `flex w-full max-w-32 flex-col items-center justify-center xl:max-w-none`,
        `${title === "LT" ? "" : "xl:border-r xl:border-[#3F3F3F]"}`,
        `${title === "vAPR" ? "text-[16px]" : "text-[15px]"}`
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {title}

        {!!indicator && (
          <>
            <HoverCard openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button type="button">
                  <IconCircleHelp className="h-auto w-[12px] text-white" />
                </button>
              </HoverCardTrigger>

              <HoverCardContent side="top" align="center" className="z-101 w-fit max-w-64 p-2 text-xs">
                {indicator}
              </HoverCardContent>
            </HoverCard>
          </>
        )}
      </div>

      <span className={cn("flex items-center gap-1 text-[20px] font-semibold", className)}>
        {value}
        {title?.includes("vAPR") && <IconStars className={cn("w-4", title?.includes("Max vAPR") ? "fill-row-success" : "fill-row-tonic")}></IconStars>}
      </span>
      <span className="text-xs text-subtitle">{subValue}</span>
    </div>
  )
}
