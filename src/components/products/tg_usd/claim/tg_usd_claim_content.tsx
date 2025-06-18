"use client"

import IndicatorCards from "@/components/design_system/structure/indicators_card"
import { useTgUsdClaimContext } from "./tg_usd_claim_context"
import ListAsset from "@/components/design_system/list/list_asset"
import { formatDollar } from "@/lib/number_formatter"
import ListIndicator from "@/components/design_system/list/list_indicator"
import Panel from "@/components/design_system/structure/panel"
import TokenImage from "@/components/design_system/structure/token_image"
import { ClaimableMarket, ClaimAsset, ClaimData } from "../tg_usd_type"
import Divider from "@/components/design_system/structure/divider"
import { Button } from "@/components/design_system/inputs/button"
import TgHoverCard from "@/components/design_system/structure/tg_hover_card"
import Loader from "@/components/design_system/structure/loader"
import { formatUnits } from "viem"
import { claimListHeaders } from "./tg_usd_claim_controller"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import ListHeader from "@/components/design_system/list/list_header"
import { ListState } from "@/types"
import ListRow from "@/components/design_system/list/list_row"
import ListAPR from "@/components/design_system/list/list_apr"
import PanelRaw from "@/components/design_system/structure/panel_raw"

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
      <hr className="my-4 w-full opacity-20 xl:hidden" />
      <div className="flex w-full flex-wrap items-center justify-evenly gap-2 xl:w-4/12">{children?.at(2)}</div>
    </div>
  )
}

export default function TgUsdClaimContent() {
  const { displayRows, onClickClaim, marketsToClaim, isLoading, customSort } = useTgUsdClaimContext()

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

      {isLoading ? (
        <div className="flex h-full w-full items-start justify-center">
          <Loader></Loader>
        </div>
      ) : (
        <div className="flex w-full items-start justify-start gap-4">
          <div className="flex w-9/12 flex-col">
            <ListProvider customSort={customSort} _headers={claimListHeaders} _rows={displayRows} _listState={listeState}>
              <ClaimList></ClaimList>
            </ListProvider>
          </div>

          <Panel className="flex h-full min-h-52 w-3/12 flex-col items-start justify-start rounded-xl border-2 border-white p-5">
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
          </Panel>
        </div>
      )}
    </>
  )
}

function ClaimList() {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  const { addToClaimableMarkets, marketsToClaim } = useTgUsdClaimContext()

  return (
    <>
      <PanelRaw className="mb-1">
        <ListHeader rowDisposition={ClaimRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </PanelRaw>

      {displayRows &&
        (displayRows as ClaimData[])?.map((item: ClaimData) => (
          <ListRow
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
              <div className="flex items-center justify-start gap-4">
                <ListIndicator info="Claimable" value={formatDollar(item?.totalClaimableValue || 0)} valueFirst={false} />

                <TgHoverCard title="Rewards Breakdown">
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
                </TgHoverCard>
              </div>

              <ListIndicator info="Deposited" value={formatDollar(item?.totalDepositedValue || 0)} valueFirst={false} />
            </>
          </ListRow>
        ))}
    </>
  )
}
