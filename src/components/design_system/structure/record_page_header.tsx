import { AssetApr } from "@/types"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import USGHoverCard from "./usg_hover_card"

type RecordPageHeaderProps = {
  apr?: AssetApr
  indicators?: RecordPageHeaderIndicatorProps[]
}

export default function RecordPageHeader({ apr, indicators }: RecordPageHeaderProps) {
  return (
    <div className="hidden min-h-20 items-center justify-evenly gap-4 rounded-[10px] bg-overlay-panel py-3 backdrop-blur-[60px] md:flex">
      {apr && (
        <RecordPageHeaderIndicator
          title="APR"
          value={`${apr?.actualsApr?.totalApr ? `${apr?.actualsApr?.totalApr?.toFixed(2)}%` : "-"}`}
          subValue={`Proj:${apr?.projectedApr?.totalApr ? `${apr?.projectedApr?.totalApr?.toFixed(2)}%` : "-"}`}
        />
      )}
      {indicators?.map((i, index) => (
        <RecordPageHeaderIndicator indicator={i?.indicator} key={index} title={i.title} value={i.value} subValue={i.subValue} className={i?.className || ""} />
      ))}
    </div>
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
