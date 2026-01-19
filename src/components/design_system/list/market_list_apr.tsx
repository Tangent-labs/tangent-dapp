import { useMemo } from "react"
import AprIndicator from "./apr_indicator"

interface ListAPRProps {
  rewardToken: string
  currentAPRDetails?: {
    [rewardToken: string]: number
  }
  apr?: number
  projectedApr?: number
  className?: string
}

const MarketListAPR = ({ rewardToken, currentAPRDetails, apr, projectedApr, className = "" }: ListAPRProps) => {
  const rewardEntries = Object.entries(currentAPRDetails ?? {})
    .filter(([k, v]) => k !== "APY" && typeof v === "number")
    .sort((a, b) => b[1] - a[1])

  const computedAPR = useMemo(() => {
    if (currentAPRDetails && rewardToken && projectedApr) {
      return Number(currentAPRDetails[rewardToken]) === 0 ? projectedApr.toFixed(2) : apr?.toFixed(2)
    }

    return apr?.toFixed(2)
  }, [rewardToken, currentAPRDetails, projectedApr])

  return (
    <div className={`flex min-w-16 flex-row items-center justify-center gap-2 text-center md:flex-col md:gap-0 ${className}`}>
      <span className="flex items-center justify-center bg-button-active bg-clip-text text-sm font-semibold leading-4 text-transparent md:text-xl">
        {computedAPR}%
        <AprIndicator>
          <div className="flex flex-col gap-2">
            <div className="flex min-w-44 items-center justify-between">
              <span>Base APY</span>
              <span className="flex items-center justify-center">{computedAPR}%</span>
            </div>

            {rewardEntries.length > 0 && (
              <div className="flex flex-col gap-2">
                {rewardEntries.map(([token, value]) => (
                  <div className="flex items-center justify-between" key={token}>
                    <span>{token} APR</span>
                    <span>{value?.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            )}

            {currentAPRDetails && (
              <div className="mt-2 flex min-w-44 items-center justify-between">
                <span className="flex items-center justify-center bg-button-active bg-clip-text font-semibold text-transparent">Net vAPR</span>
                <span className="flex items-center justify-center rounded-[10px] bg-button-active px-2 py-0.5 font-semibold">{computedAPR}%</span>
              </div>
            )}
          </div>
        </AprIndicator>
      </span>

      {projectedApr && !!currentAPRDetails && Number(currentAPRDetails[rewardToken]) !== 0 && (
        <span className="whitespace-nowrap text-xs text-subtitle">
          Proj: <span>{projectedApr.toFixed(2)}%</span>
        </span>
      )}

      {computedAPR && <span className="hidden text-xs md:flex">Up to {(Number(computedAPR) * 10).toFixed(2)} % at 10x</span>}
    </div>
  )
}

export default MarketListAPR
