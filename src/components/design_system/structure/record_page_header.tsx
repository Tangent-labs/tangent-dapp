import { AssetApr } from "@/types"
import Panel from "./panel"
import { cn } from "@/lib/utils"

type RecordPageHeaderProps = {
  apr?: AssetApr
  indicators?: RecordPageHeaderIndicatorProps[]
}

export default function RecordPageHeader({ apr, indicators }: RecordPageHeaderProps) {
  return (
    <Panel>
      <div className="flex min-h-20 justify-evenly gap-4">
        {apr && (
          <div>
            <RecordPageHeaderIndicator
              title="APR"
              value={`${apr?.actualsApr?.totalApr ? `${apr?.actualsApr?.totalApr?.toFixed(2)}%` : "-"}`}
              subValue={`Proj:${apr?.projectedApr?.totalApr ? `${apr?.projectedApr?.totalApr?.toFixed(2)}%` : "-"}`}
              className="text-row-tonic"
            />
          </div>
        )}
        {indicators?.map((i, index) => (
          <div key={index}>
            <RecordPageHeaderIndicator title={i.title} value={i.value} subValue={i.subValue} className={i?.className || ""} />
          </div>
        ))}
      </div>
    </Panel>
  )
}

type RecordPageHeaderIndicatorProps = {
  title: string
  value?: string | number
  subValue?: string | number
  className?: string
}

export const RecordPageHeaderIndicator = ({ title, value, subValue, className }: RecordPageHeaderIndicatorProps) => {
  return (
    <div className="flex flex-col justify-center lg:items-center">
      <span className="mb-1">{title}</span>
      <span className={cn("text-2xl font-semibold", className)}>{value}</span>
      <span className="text-sm text-gray-400">{subValue}</span>
    </div>
  )
}
