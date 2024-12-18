"use client"

import React from "react"
import { useBoosterClaimContext } from "./booster_claim_context"

import ListIndicator from "@/components/design_system/list/list_indicator"
import { Button } from "@/components/design_system/inputs/button"
import Panel from "@/components/design_system/structure/panel"
import HelpPropover from "@/components/design_system/structure/help_popover"
import TokenImage from "@/components/design_system/structure/token_image"
import { formatDollar } from "@/lib/number_formatter"
import { cn } from "@/lib/utils"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
export default function BoosterClaimContent() {
  const { displayRows, actionClaim, actionClaimAll, totals } = useBoosterClaimContext()

  return (
    <>
      {/* <pre>{JSONdebug(displayRows)}</pre> */}
      <div className="flex items-center justify-between">
        <IndicatorCards
          indicators={[
            { title: "Total deposited", value: formatDollar(totals.depositedDollarValue) },
            { title: "Total claimable", value: formatDollar(totals.claimableDollarValue) },
          ]}
        />
        <div>
          <Button label="Claim All " className="px-8 py-3 text-sm" disabled={totals.claimableDollarValue === 0} onClick={() => actionClaimAll()} />
        </div>
      </div>

      {displayRows?.map((item, index) => (
        <Panel key={index} className={cn("flex items-center justify-between gap-2 max-md:flex-col")}>
          <div className={`relative flex min-w-[180px] items-center gap-4`}>
            <TokenImage token={item.token} size={50} className="w-18" />
            <div className="flex flex-col leading-8">
              <span className="text-[32px] font-semibold">{item.name}</span>
            </div>
          </div>
          <div className="flex grow items-center justify-between gap-2 md:justify-evenly">
            <div className="flex items-center gap-4">
              <ListIndicator info="Total Rewards" value={item.claimable.value} valueFirst={false} />
              <div>
                <HelpPropover title={`${item?.token} Claim Breakdown`} className="left-[200px]">
                  <>
                    <div className="flex flex-col gap-1 text-sm">
                      {item?.claimableDetail?.map((data, index) => (
                        <div key={index} className="flex items-center justify-between gap-2">
                          <div className="flex w-1/2 gap-2 whitespace-nowrap">
                            <TokenImage token={data.logo} size={20} />
                            <span className="w-20 whitespace-nowrap">
                              {" "}
                              {data.tokenAmountFormatted} {data.logo}
                            </span>
                          </div>

                          <span className="text-gray-400"> {formatDollar(data.dollarValue)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                </HelpPropover>
              </div>
            </div>
          </div>
          <div>
            <Button label="Claim" className="px-8 py-2 text-sm" disabled={(item?.claimable?.raw || 0) === 0} onClick={() => actionClaim(item.stakingAddress)} />
          </div>
        </Panel>
      ))}
    </>
  )
}
