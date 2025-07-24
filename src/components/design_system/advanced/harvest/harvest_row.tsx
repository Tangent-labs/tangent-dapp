"use client"

import Panel from "../../structure/panel"
import { cn } from "@/lib/utils"
import TokenImage from "../../structure/token_image"
import ListIndicator from "../../list/list_indicator"
import { Button } from "../../inputs/button"
import { formatDollar, formatPercent } from "@/lib/number_formatter"
import { Address } from "viem"
import HelpPropover from "../../structure/help_popover"
import { formatDate } from "@/lib/other_formatter"
import { HarvesterInfoDisplay } from "@/components/products/tg_usd/tg_usd_type"

type HarvestRowProps = React.ButtonHTMLAttributes<HTMLDivElement> & {
  info: HarvesterInfoDisplay
  onHarvest: (arg: Address) => void
  canInteract: boolean
}

export default function HarvestRow({ info, onHarvest, canInteract, className, ...props }: HarvestRowProps) {
  return (
    <Panel {...props} className={cn(className, "flex items-center justify-between gap-2 max-md:flex-col")}>
      <div className={`relative flex min-w-[300px] items-center gap-4`}>
        <TokenImage token={info.asset} size={48} className="w-24" />
        <div className="flex flex-col leading-8">
          <span className="text-[14px] font-semibold md:text-[20px]">{info.asset}</span>
        </div>
      </div>
      <div className="flex grow items-center justify-between gap-2 md:justify-evenly">
        <div className="flex items-center gap-4">
          <ListIndicator info="Total Rewards" value={formatDollar(info?.rewards?.totalDollar || 0)} valueFirst={false} />
          <div>
            <HelpPropover title={`${info?.asset} Rewards Breakdown`}>
              <>
                <div className="flex flex-col gap-1 text-sm">
                  {info?.rewards?.details?.map((reward, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-10">
                        <TokenImage token={reward.logo} size={16} />
                      </div>
                      <span className="w-20"> {reward.logo}</span>
                      <span className=""> {formatDollar(reward.dollarValue)}</span>
                    </div>
                  ))}
                </div>
              </>
            </HelpPropover>
          </div>
        </div>
        <div>
          <ListIndicator info="Harvester Fees" value={formatPercent(info?.percentage)} valueFirst={false} />
        </div>
        <div>
          <ListIndicator info="Harvester Rewards" value={formatDollar(info?.harvesterFees || 0)} valueFirst={false} />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Button label="Harvest" disabled={!canInteract || !info || info.harvesterFees === 0} onClick={() => onHarvest && onHarvest(info.contractAddress)} />
        <span className="mt-1 text-xs"> Last Harvest {formatDate(new Date(Number(info.lastHarvestDate) * 1000), "dd-MM-yyyy")} </span>
      </div>
    </Panel>
  )
}
