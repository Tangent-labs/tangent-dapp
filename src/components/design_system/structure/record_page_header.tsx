import { AssetApr } from "@/types"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

type RecordPageHeaderProps = {
  apr?: AssetApr
  indicators?: RecordPageHeaderIndicatorProps[]
}

export default function RecordPageHeader({ apr, indicators }: RecordPageHeaderProps) {
  return (
    <div className="flex min-h-20 items-center justify-evenly gap-4 rounded-[10px] bg-overlay-panel py-5 backdrop-blur-[60px]">
      {apr && (
        <RecordPageHeaderIndicator
          title="APR"
          value={`${apr?.actualsApr?.totalApr ? `${apr?.actualsApr?.totalApr?.toFixed(2)}%` : "-"}`}
          subValue={`Proj:${apr?.projectedApr?.totalApr ? `${apr?.projectedApr?.totalApr?.toFixed(2)}%` : "-"}`}
          className="text-row-tonic"
        />
      )}
      {indicators?.map((i, index) => (
        <RecordPageHeaderIndicator key={index} title={i.title} value={i.value} subValue={i.subValue} className={i?.className || ""} />
      ))}
    </div>
  )
}

type RecordPageHeaderIndicatorProps = {
  title: string
  value?: string | number | ReactNode
  subValue?: string | number | ReactNode
  className?: string
}

export const RecordPageHeaderIndicator = ({ title, value, subValue, className }: RecordPageHeaderIndicatorProps) => {
  return (
    <div className={`flex w-full flex-col items-center justify-center ` + `${title === "LT" ? "" : " border-r border-[#3F3F3F]"}`}>
      <span className="mb-1">{title}</span>
      <span className={cn("text-2xl font-semibold", className)}>{value}</span>
      <span className="text-sm text-gray-400">{subValue}</span>
    </div>
  )
}
