import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { parseAPRDetails, computeDisplayAPR } from "@/lib/apr"
import { AprIndicator } from "./apr_indicator"
import { TokenImage } from "../structure/token_image"
import { USGMarketType } from "@/components/products/usg/usg_type"

interface MaxLeverageVAPRProps {
  poolName: string
  logoKey: string
  isMarketListDisplay: boolean
  rewardToken: string
  currentAPRDetails?: {
    [rewardToken: string]: number | undefined
  }
  apr?: number
  projectedApr?: number
  className?: string
  marketType?: USGMarketType | undefined
  maxLevAPR: string
  maxProjectedLevAPR: string
}

type StreamTileProps = {
  active: boolean
}

const StreamTile = ({ active }: StreamTileProps) => {
  return (
    <div className={cn("flex items-center justify-center rounded-full px-1 py-0.5 text-xs text-black", active ? "bg-row-success" : "bg-row-warning")}>
      Stream {active ? "active" : "inactive"}
    </div>
  )
}

export const MaxLeverageVAPR = ({
  poolName,
  logoKey,
  rewardToken,
  currentAPRDetails,
  apr,
  projectedApr,
  marketType,
  isMarketListDisplay,
  maxLevAPR,
  maxProjectedLevAPR,
  className = "",
}: MaxLeverageVAPRProps) => {
  const current = useMemo(() => parseAPRDetails(currentAPRDetails), [currentAPRDetails])

  const computedAPR = useMemo(() => computeDisplayAPR(apr, projectedApr, currentAPRDetails, rewardToken), [apr, projectedApr, currentAPRDetails, rewardToken])

  return (
    <div className="flex w-full items-center justify-between gap-2 xl:justify-center">
      {isMarketListDisplay && <div className="flex items-center justify-center text-sm text-subtitle xl:hidden">Max lev. vAPR</div>}

      <div className={cn("flex min-h-min min-w-16 items-center justify-center text-center xl:min-h-8 xl:flex-col", isMarketListDisplay ? "" : "w-full")}>
        {!!computedAPR && Number(computedAPR) > 0 && (
          <>
            <AprIndicator isMax={true}>
              <div className={className}>{maxLevAPR}%</div>

              <div className="flex flex-col gap-2 p-2">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center justify-start gap-1 text-xs font-semibold">
                    <TokenImage token={logoKey} size={24} />
                    {poolName} Rewards
                  </div>
                  {/* Display streaming label or not */}
                  {marketType === "Pendle_PT" ? <></> : <StreamTile active={!!currentAPRDetails && Number(currentAPRDetails[rewardToken] ?? 0) !== 0} />}
                </div>

                {marketType === "Pendle_PT" ? (
                  <div className="flex min-w-44 items-center justify-between text-white">
                    Fixed APY
                    <span className="flex items-center justify-center">{(current.baseAPY ?? 0).toFixed(2)}%</span>
                  </div>
                ) : (
                  <>
                    <div className="flex w-full items-center justify-between gap-2 pb-3">
                      <span className="text-subtitle"> Current Max lev. vAPR</span>
                      <span className="font-semibold"> {maxLevAPR}%</span>
                    </div>

                    {projectedApr !== -1 && (
                      <>
                        <div className="flex w-full items-center justify-between gap-2 pb-2">
                          <span className="text-subtitle">Projected Max lev. vAPR</span>
                          <span className="font-semibold"> {maxProjectedLevAPR}%</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </AprIndicator>
            {marketType !== "Pendle_PT" && (!isMarketListDisplay || computedAPR === apr) && projectedApr !== -1 && (
              <span className="hidden gap-2 text-xs text-subtitle xl:flex">Proj: {maxProjectedLevAPR}%</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
