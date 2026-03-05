import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { ExistingAsset } from "@/types"
import { AprIndicator } from "./apr_indicator"
import { TokenImage } from "../structure/token_image"

interface ListAPRProps {
  poolName: string
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
}

type StreamTileProps = {
  active: boolean
}

const StreamTile = ({ active }: StreamTileProps) => {
  return (
    <div className={cn("flex items-center justify-center rounded-full px-1 py-0.5 text-xs text-black", active ? "bg-row-success" : "bg-row-warning")}>
      {" "}
      Stream {active ? "active" : "inactive"}{" "}
    </div>
  )
}

export const MarketListAPR = ({
  poolName,
  rewardToken,
  maxLeverage,
  currentAPRDetails,
  projectedAPRDetails,
  apr,
  projectedApr,
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
      <div className="flex items-center justify-center text-sm text-subtitle xl:hidden">{maxLeverage === 1 ? "vAPR" : "Max vAPR"}</div>

      <div className={`flex min-h-min min-w-16 items-center justify-center text-center xl:min-h-8 xl:flex-col ${className}`}>
        {!!computedAPR && Number(computedAPR) > 0 && (
          <>
            <span className="flex items-center justify-center bg-button-active bg-clip-text text-sm text-transparent md:text-xl">
              <AprIndicator isMax={maxLeverage !== 1}>
                <div>{(computedAPR * maxLeverage).toFixed(2)}%</div>

                <div className="flex flex-col gap-2 p-2">
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center justify-start gap-2 text-xs font-semibold">
                      <TokenImage token={poolName as ExistingAsset} size={24} />
                      {poolName?.replaceAll("-", "/")} Rewards
                    </div>
                    <StreamTile active={!!currentAPRDetails && Number(currentAPRDetails[rewardToken]) !== 0} />
                  </div>

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
                      {currentRewardEntries.map(([token, value]) => (
                        <>
                          {!!value && value >= 0.01 ? (
                            <div className="flex items-center justify-between" key={token}>
                              <span>{token} APR</span>
                              <span>{(value * maxLeverage)?.toFixed(2)}%</span>
                            </div>
                          ) : (
                            <></>
                          )}
                        </>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex w-full items-center justify-between gap-2 border-b border-white/10 pb-1 font-semibold">
                    Projected vAPR
                    <span> {((projectedApr || 0) * maxLeverage).toFixed(2)}%</span>
                  </div>

                  <div className="flex min-w-44 items-center justify-between text-subtitle">
                    Base APY
                    <span className="flex items-center justify-center">{((projectedAPRDetails?.APY ?? 0) * maxLeverage).toFixed(2)}%</span>
                  </div>

                  {projectedRewardEntries.length > 0 && (
                    <div className="flex flex-col gap-2 text-subtitle">
                      {projectedRewardEntries.map(([token, value]) => (
                        <>
                          {!!value && value >= 0.01 ? (
                            <div className="flex items-center justify-between" key={token}>
                              <span>{token} APR</span>
                              <span>{(value * maxLeverage)?.toFixed(2)}%</span>
                            </div>
                          ) : (
                            <></>
                          )}
                        </>
                      ))}
                    </div>
                  )}
                </div>
              </AprIndicator>
            </span>

            {projectedApr && !!currentAPRDetails && Number(currentAPRDetails[rewardToken]) !== 0 && (
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
