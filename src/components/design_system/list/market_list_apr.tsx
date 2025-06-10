"use client"

import ListAprIndicator from "./list_apr_indicator"

interface ListAPRProps {
  apr?: number
  projectedApr?: number
  className?: string
}

const MarketListAPR = ({ apr, projectedApr, className = "" }: ListAPRProps) => {
  return (
    <div className="flex justify-center gap-2">
      <div className={`flex min-w-16 flex-col items-center justify-center text-center ${className}`}>
        <span className="flex items-center justify-center bg-button-active bg-clip-text text-[20px] font-bold leading-4 text-transparent">
          {apr}% <ListAprIndicator helpMessage="This is the APR" className="w-[45px]" />
        </span>
        {projectedApr && (
          <span className="whitespace-nowrap text-xs text-subtitle">
            Proj: <span>{projectedApr}%</span>
          </span>
        )}

        <span className="text-xs">Up to 150.35% at x10</span>
      </div>
    </div>
  )
}

export default MarketListAPR
