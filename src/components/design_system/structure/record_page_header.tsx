import { AssetApr, ExistingAsset } from "@/types"
import Panel from "./panel"
import { cn } from "@/lib/utils"
import TokenImage from "./token_image"
import { ReactNode } from "react"

type RecordPageHeaderProps = {
  apr?: AssetApr
  indicators?: RecordPageHeaderIndicatorProps[]
  token?: ExistingAsset
}

export default function RecordPageHeader({ apr, indicators, token }: RecordPageHeaderProps) {
  return (
    <Panel>
      <div className="flex min-h-20 items-center justify-evenly gap-4">
        {token && (
          <div>
            <div className={`relative flex items-center gap-4`}>
              <TokenImage token={token} size={48} className="w-18" />
              <div className="flex flex-col leading-8">
                <span className="text-[32px] font-semibold">{token}</span>
              </div>
            </div>
          </div>
        )}
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
  value?: string | number | ReactNode
  subValue?: string | number | ReactNode
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
