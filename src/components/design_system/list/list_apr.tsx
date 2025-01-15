"use client"

import ListHarvestIndicator from "@/components/design_system/list/list_harvest_indcator"

interface ListAPRProps {
  apr?: number
  projectedApr?: number // Optional, in case the projected APR isn't always present
  className?: string
  harvestHelpMessage?: string
}

const ListAPR = ({ apr, projectedApr, className = "", harvestHelpMessage }: ListAPRProps) => {
  return (
    <div className="flex gap-2">
      <div className={`flex min-w-16 flex-col text-left ${className}`}>
        <span className="text-[20px] font-bold leading-4 text-row-tonic">{apr}%</span>
        {projectedApr && (
          <span className="whitespace-nowrap text-xs">
            Proj: <span>{projectedApr}%</span>
          </span>
        )}
      </div>
      <ListHarvestIndicator helpMessage={harvestHelpMessage} isHarvested={Math.random() > 0.5} className="w-[45px]" />
    </div>
  )
}

export default ListAPR
