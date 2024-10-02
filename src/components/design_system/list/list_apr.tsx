"use client"

import ListHarvestIndicator from "./list_harvest_indcator"

interface ListAPRProps {
  apr?: number
  projectedApr?: number // Optional, in case the projected APR isn't always present
  className?: string
  harvestHelpMessage?: string
}

const ListAPR = ({ apr, projectedApr, className = "", harvestHelpMessage }: ListAPRProps) => {
  return (
    <div className="flex gap-6">
      <div className={`flex flex-col  text-left min-w-16  ${className}`}>
        <span className="text-[20px] font-bold text-row-tonic leading-4">{apr}%</span>
        {projectedApr && (
          <span className="text-[12px]  ">
            Proj: <span>{projectedApr}%</span>
          </span>
        )}
      </div>
      <ListHarvestIndicator helpMessage={harvestHelpMessage} isHarvested={Math.random() > 0.5} className="w-[45px]" />
    </div>
  )
}

export default ListAPR
