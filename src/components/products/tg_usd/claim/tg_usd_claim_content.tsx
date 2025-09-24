"use client"

import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { ListState } from "@/types"
import { formatDollar } from "@/lib/number_formatter"
import { claimListHeaders } from "./tg_usd_claim_controller"
import { useUSGClaimContext } from "./tg_usd_claim_context"
import ListRow from "@/components/design_system/list/list_row"
import ListAPR from "@/components/design_system/list/list_apr"
import { Button } from "@/components/design_system/inputs/button"
import ListAsset from "@/components/design_system/list/list_asset"
import Divider from "@/components/design_system/structure/divider"
import ListHeader from "@/components/design_system/list/list_header"
import { ClaimableMarket, ClaimAsset, ClaimData } from "../tg_usd_type"
import TokenImage from "@/components/design_system/structure/token_image"
import ListIndicator from "@/components/design_system/list/list_indicator"
import BorderPanel from "@/components/design_system/structure/border_panel"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import USGHoverCard from "@/components/design_system/structure/usg_hover_card"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "market",
    direction: "asc",
  },
}

const ClaimRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="flex w-full items-center justify-evenly xl:w-8/12 xl:justify-start">
        <div className="xl:w-1/2">{children?.at(0)}</div>
        <div className="flex justify-center xl:w-1/2">{children?.at(1)}</div>
      </div>
      <hr className="my-2 w-full opacity-20 xl:hidden" />
      <div className="flex w-full flex-wrap items-center justify-evenly gap-2 xl:w-1/3">{children?.at(2)}</div>
    </div>
  )
}

export default function USGClaimContent() {
  const { displayRows, onClickClaim, marketsToClaim, customSort } = useUSGClaimContext()

  return (
    <>
      <div className="mt-10 flex items-center justify-between">
        <IndicatorCards
          indicators={[
            {
              title: "Total deposited",
              value: `${formatDollar(displayRows.reduce((sum, token) => sum + parseFloat(token.totalDepositedValue), 0).toFixed(2))}`,
            },
            {
              title: "Total claimable",
              value: `${formatDollar(displayRows.reduce((sum, token) => sum + parseFloat(token.totalClaimableValue), 0).toFixed(2))}`,
            },
          ]}
        />
      </div>

      <div className="flex w-full flex-col-reverse items-start justify-start gap-4 md:flex-row">
        <div className="flex w-full flex-col md:w-9/12">
          <ListProvider customSort={customSort} _headers={claimListHeaders} _rows={displayRows} _listState={listeState}>
            <ClaimList></ClaimList>
          </ListProvider>
        </div>

        <BorderPanel className="flex h-full min-h-52 w-full flex-col items-start justify-start p-5 md:w-3/12">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start justify-start">Market</div>

            <div className="flex flex-col items-start justify-start">Claimable</div>
          </div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <div className="flex w-full flex-col">
            {marketsToClaim.map((el: ClaimableMarket) => (
              <div key={el.marketName} className="flex w-full items-center justify-between">
                <div className={`relative flex items-center gap-4`}>
                  <TokenImage token={el.marketName} size={16} className="w-8" />
                  <span className="text-[12px] font-semibold">{el.marketName}</span>
                </div>

                <span className="text-[12px] font-semibold">${el.claimable}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex w-full">
            {marketsToClaim.length > 0 && (
              <Button label="CLAIM" className="flex w-full items-center justify-center" onClick={() => onClickClaim(marketsToClaim)} />
            )}
          </div>
        </BorderPanel>
      </div>
    </>
  )
}

function ClaimList() {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  const { addToClaimableMarkets, marketsToClaim } = useUSGClaimContext()

  return (
    <>
      <div className="my-2 w-full rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ListHeader rowDisposition={ClaimRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      {displayRows &&
        (displayRows as ClaimData[])?.map((item: ClaimData) => (
          <ListRow
            className={cn("my-1", !!displayRows && !!marketsToClaim ? "" : "shimmer")}
            rowDisposition={ClaimRowDisposition}
            navigate={
              Number(item?.totalClaimableValue) > 0
                ? () =>
                    addToClaimableMarkets({
                      marketName: item.marketName,
                      claimable: item.totalClaimableValue,
                      marketAddress: item.marketAddress,
                    })
                : () => {}
            }
            key={item.marketName}
            isSelected={!!marketsToClaim.find((market) => market.marketName === item.marketName)}
          >
            <ListAsset name={item?.marketName} token={item.marketName} assetsEarned={[]} />
            <ListAPR apr={10} projectedApr={12} harvestHelpMessage="Rewards has not been harvested yet." />

            <>
              <div className="flex w-full flex-wrap items-center justify-evenly gap-2 xl:w-1/3">
                <ListIndicator info="Claimable" value={formatDollar(item?.totalClaimableValue || 0)} valueFirst={false} />

                <USGHoverCard title={`${item?.marketName} Rewards Breakdown`}>
                  {(item?.claimable as ClaimAsset[]).map((reward: ClaimAsset) => (
                    <div key={reward?.valueInUsd} className="flex items-center gap-4">
                      <TokenImage token={reward.symbol} size={16} />

                      <div>
                        <span> {Number(formatUnits(BigInt(reward.amount), 18)).toFixed(2)}</span>
                        <span className="w-6"> {reward.symbol}</span>
                      </div>
                      <span className="text-white/60"> ({formatDollar(reward?.valueInUsd)})</span>
                    </div>
                  ))}
                </USGHoverCard>
              </div>

              <ListIndicator info="Deposited" value={formatDollar(item?.totalDepositedValue || 0)} valueFirst={false} />
            </>
          </ListRow>
        ))}
    </>
  )
}
