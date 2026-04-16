import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { AprIndicator } from "./apr_indicator"
import { TokenImage } from "../structure/token_image"
import { USGMarketType } from "@/components/products/usg/usg_type"

interface ListAPRProps {
  poolName: string
  logoKey: string
  isMarketListDisplay: boolean
  rewardToken: string
  maxLeverage: number
  currentAPRDetails?: {
    [rewardToken: string]: number
  }
  projectedAPRDetails?: {
    [rewardToken: string]: number
  }
  apr?: number
  projectedApr?: number
  className?: string
  marketType?: USGMarketType | undefined
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

export const MarketAPR = ({
  poolName,
  logoKey,
  rewardToken,
  maxLeverage,
  currentAPRDetails,
  projectedAPRDetails,
  apr,
  projectedApr,
  marketType,
  isMarketListDisplay,
  className = "",
}: ListAPRProps) => {
  const currentRewardEntries = useMemo(() => {
    return Object.entries(currentAPRDetails ?? {})
      .filter(([k, v]) => k !== "APY" && typeof v === "number")
      .sort((a, b) => b[1] - a[1])
  }, [currentAPRDetails])

  const projectedRewardEntries = useMemo(() => {
    return Object.entries(projectedAPRDetails ?? {})
      .filter(([k, v]) => k !== "APY" && typeof v === "number")
      .sort((a, b) => b[1] - a[1])
  }, [projectedAPRDetails])

  const computedAPR = useMemo(() => {
    if (currentAPRDetails && rewardToken && projectedApr) {
      return Number(currentAPRDetails[rewardToken]) === 0 ? projectedApr : apr
    }

    return apr
  }, [rewardToken, currentAPRDetails, projectedApr, apr])

  return (
    <div className="flex w-full items-center justify-between gap-2 xl:justify-center">
      {isMarketListDisplay && <div className="flex items-center justify-center text-sm text-subtitle xl:hidden">{maxLeverage === 1 ? "vAPR" : "Max vAPR"}</div>}

      <div className={cn("flex min-h-min min-w-16 items-center justify-center text-center xl:min-h-8 xl:flex-col", isMarketListDisplay ? "" : "w-full")}>
        {!!computedAPR && Number(computedAPR) > 0 && (
          <>
            <span className="flex items-center justify-center bg-button-active bg-clip-text text-sm text-transparent md:text-xl">
              <AprIndicator isMax={maxLeverage !== 1}>
                {isMarketListDisplay ? (
                  <div className={className}>{(computedAPR * maxLeverage).toFixed(2)}%</div>
                ) : (
                  <div className={className}>{((apr || 0) * maxLeverage).toFixed(2)}%</div>
                )}

                <div className="flex flex-col gap-2 p-2">
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center justify-start gap-2 text-xs font-semibold">
                      <TokenImage token={logoKey} size={24} />
                      {poolName} Rewards
                    </div>
                    {/* Display streaming label or not */}
                    {marketType === "Pendle_PT" ? <></> : <StreamTile active={!!currentAPRDetails && Number(currentAPRDetails[rewardToken]) !== 0} />}
                  </div>

                  {marketType === "Pendle_PT" ? (
                    <div className="flex min-w-44 items-center justify-between text-white">
                      Fixed APY
                      <span className="flex items-center justify-center">{((currentAPRDetails?.APY ?? 0) * maxLeverage).toFixed(2)}%</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex w-full items-center justify-between gap-2 border-b border-white/10 pb-1 font-semibold">
                        <span>Current vAPR</span>
                        <span> {((apr || 0) * maxLeverage).toFixed(2)}%</span>
                      </div>

                      <div className="flex min-w-44 items-center justify-between text-subtitle">
                        Base APY
                        <span className="flex items-center justify-center">{((currentAPRDetails?.APY ?? 0) * maxLeverage).toFixed(2)}%</span>
                      </div>

                      {currentRewardEntries.length > 0 && (
                        <div className="flex flex-col gap-2 text-subtitle">
                          {currentRewardEntries.map(([token, value], index) => (
                            <span key={index}>
                              {!!value && value >= 0.01 ? (
                                <div className="flex items-center justify-between" key={token}>
                                  <span>{token} APR</span>
                                  <span>{(value * maxLeverage)?.toFixed(2)}%</span>
                                </div>
                              ) : (
                                <></>
                              )}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex w-full items-center justify-between gap-2 border-b border-white/10 pb-1 font-semibold">
                        Projected vAPR
                        <span> {((projectedApr || 0) * maxLeverage).toFixed(2)}%</span>
                      </div>

                      <div className="flex min-w-44 items-center justify-between text-subtitle">
                        Base APY
                        <span className="flex items-center justify-center">{((projectedAPRDetails?.APY ?? 0) * maxLeverage).toFixed(2)}%</span>
                      </div>

                      {projectedRewardEntries.length > 0 && (
                        <div className="flex flex-col gap-2 text-subtitle">
                          {projectedRewardEntries.map(([token, value], index) => (
                            <span key={index}>
                              {!!value && value >= 0.01 ? (
                                <div className="flex items-center justify-between" key={token}>
                                  <span>{token} APR</span>
                                  <span>{(value * maxLeverage)?.toFixed(2)}%</span>
                                </div>
                              ) : (
                                <></>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </AprIndicator>
            </span>

            {marketType !== "Pendle_PT" && ((projectedApr && !!currentAPRDetails && Number(currentAPRDetails[rewardToken]) !== 0) || !isMarketListDisplay) && (
              <span className="hidden text-xs text-subtitle xl:flex">
                Proj: <span className="ml-1">{(projectedApr! * maxLeverage).toFixed(2)}%</span>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
