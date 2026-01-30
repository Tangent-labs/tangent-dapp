"use client"

import ListHarvestIndicator from "@/components/design_system/list/list_harvest_indcator"

interface ListAPRProps {
  apr?: number
  projectedApr?: number
  className?: string
  harvestHelpMessage?: string
}

const ListAPR = ({ apr, projectedApr, className = "", harvestHelpMessage }: ListAPRProps) => {
  return (
    <div className="flex justify-center gap-2">
      <div className={`flex min-w-16 flex-col text-left ${className}`}>
        <span className="bg-button-active bg-clip-text text-xl font-semibold leading-4 text-transparent">{apr}%</span>
        {projectedApr && (
          <span className="whitespace-nowrap text-xs">
            Proj: <span className="ml-1">{projectedApr}%</span>
          </span>
        )}
      </div>
      <ListHarvestIndicator helpMessage={harvestHelpMessage} isHarvested={true} className="w-[45px]" />
    </div>
  )
}

export default ListAPR
