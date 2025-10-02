"use client"

import AprIndicator from "./apr_indicator"

interface ListAPRProps {
  apr?: number
  projectedApr?: number
  className?: string
}

const MarketListAPR = ({ apr, projectedApr, className = "" }: ListAPRProps) => {
  return (
    <div className={`flex min-w-16 flex-row items-center justify-center gap-2 text-center md:flex-col md:gap-0 ${className}`}>
      <span className="flex items-center justify-center bg-button-active bg-clip-text text-sm font-semibold leading-4 text-transparent md:text-xl">
        {apr}%
        <AprIndicator>
          <div className="flex flex-col gap-2">
            <div className="flex min-w-44 items-center justify-between">
              <span>vAPR</span>
              <span className="flex items-center justify-center bg-button-active bg-clip-text font-semibold text-transparent">{apr}%</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span>USDT</span>
              <span>30%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>USG</span>
              <span>33%</span>
            </div>
          </div>
        </AprIndicator>
      </span>
      {projectedApr && (
        <span className="whitespace-nowrap text-xs text-subtitle">
          Proj: <span>{projectedApr}%</span>
        </span>
      )}

      <span className="hidden text-xs md:flex">Up to 150.35% at x10</span>
    </div>
  )
}

export default MarketListAPR
