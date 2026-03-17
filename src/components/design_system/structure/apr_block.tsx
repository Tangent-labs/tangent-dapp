import { IconCircleHelp } from "@/components/icons"
import { AprEntry } from "@/types"
import { TokenImage } from "./token_image"
import { ProgressBar } from "./progress_bar"
import { useMemo } from "react"
import { Address } from "viem"
import { ADDR_TOKEN } from "@/services/repo_asset_addresses"
import { formatNumber } from "@/lib/number_formatter"

type AprBlockProps = {
  title: string
  aprEntry?: AprEntry
}

export function AprBlock({ title, aprEntry }: AprBlockProps) {
  const display = useMemo(() => {
    if (!aprEntry?.totalApr) {
      return { total: 0, details: [] }
    }
    const total = formatNumber(aprEntry.totalApr || 0, 2)
    const details = Object.entries(aprEntry.details || {}).map(([k, v]) => {
      return { asset: ADDR_TOKEN[k as Address], value: formatNumber(Number(v), 2), percent: (Number(v) / aprEntry.totalApr) * 100 }
    })
    return { total, details }
  }, [aprEntry])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span>REWARD(s)</span>
        <div className="flex">
          <div className="mb-2 flex items-center gap-1">
            <span className="text-row-tonic">
              <IconCircleHelp />
            </span>
            <span className="font-extralight"> {title} </span>
            <span className="rounded-full bg-button-active px-2 text-black">{display.total} %</span>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        {display.details.map((a) => (
          <div key={a.asset} className="flex w-full justify-between">
            <div className="flex w-1/3 gap-2 lg:w-1/5">
              <TokenImage token={a.asset} size={16} />
              <span className="text-sm">{a.asset}</span>
            </div>
            <div className="w-1/3 lg:w-3/5">
              <ProgressBar percent={a.percent} minPercent={5} />
            </div>
            <span className="w-1/3 text-right lg:w-1/5">{a.value} %</span>
          </div>
        ))}
      </div>
    </div>
  )
}
