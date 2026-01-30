import { useMemo } from "react"
import AprIndicator from "./apr_indicator"

interface ListAPRProps {
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

const MarketListAPR = ({ rewardToken, maxLeverage, currentAPRDetails, projectedAPRDetails, apr, projectedApr, className = "" }: ListAPRProps) => {
  const computedAPRDetails = useMemo(() => {
    if (currentAPRDetails && projectedAPRDetails && rewardToken) {
      return Number(currentAPRDetails[rewardToken]) === 0 ? projectedAPRDetails : currentAPRDetails
    }

    return currentAPRDetails
  }, [rewardToken, currentAPRDetails, projectedAPRDetails])

  const rewardEntries = useMemo(() => {
    return Object.entries(computedAPRDetails ?? {})
      .filter(([k, v]) => k !== "APY" && typeof v === "number")
      .sort((a, b) => b[1] - a[1])
  }, [computedAPRDetails])

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
            <span className="flex items-center justify-center bg-button-active bg-clip-text text-sm font-semibold leading-4 text-transparent md:text-xl">
              <AprIndicator isMax={maxLeverage !== 1}>
                <div>{(computedAPR * maxLeverage).toFixed(2)}%</div>

                <div className="flex flex-col gap-2">
                  <div className="flex min-w-44 items-center justify-between">
                    Base APY
                    <span className="flex items-center justify-center">{((computedAPRDetails?.APY ?? 0) * maxLeverage).toFixed(2)}%</span>
                  </div>

                  {rewardEntries.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {rewardEntries.map(([token, value]) => (
                        <div className="flex items-center justify-between" key={token}>
                          <span>{token} APR</span>
                          <span>{(value * maxLeverage)?.toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentAPRDetails && (
                    <div className="mt-2 flex min-w-44 items-center justify-between">
                      <span className="flex items-center justify-center bg-button-active bg-clip-text font-semibold text-transparent">Net vAPR</span>
                      <span className="flex items-center justify-center rounded-[10px] bg-button-active px-2 py-0.5 font-semibold">
                        {(computedAPR * maxLeverage).toFixed(2)}%
                      </span>
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

export default MarketListAPR
