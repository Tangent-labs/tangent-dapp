"use client"

import { formatUnits } from "viem"
import { ListState } from "@/types"
import { Switch } from "@/components/ui/switch"
import { formatDollar } from "@/lib/number_formatter"
import { claimListHeaders } from "./tg_usd_claim_controller"
import { useUSGClaimContext } from "./tg_usd_claim_context"
import { Button } from "@/components/design_system/inputs/button"
import ListAsset from "@/components/design_system/list/list_asset"
import Divider from "@/components/design_system/structure/divider"
import ListHeader from "@/components/design_system/list/list_header"
import { ClaimableMarket, ClaimAsset, ClaimData } from "../tg_usd_type"
import TokenImage from "@/components/design_system/structure/token_image"
import USGHoverCard from "@/components/design_system/structure/usg_hover_card"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

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
      <div className="flex w-full items-center justify-between xl:w-1/2 xl:justify-start">
        <div className="xl:w-2/3">{children?.at(0)}</div>
        <div className="flex justify-center xl:w-1/3">{children?.at(1)}</div>
      </div>
      <hr className="my-2 w-full opacity-20 xl:hidden" />
      <div className="flex w-full flex-wrap items-center justify-between gap-2 xl:w-1/2">{children?.at(2)}</div>
    </div>
  )
}

export default function USGClaimContent() {
  const { displayRows, onClickClaim, marketsToClaim, customSort, onClickClaimAll } = useUSGClaimContext()

  const { isWellConnected, connect } = useWalletConnexionContext()

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4 md:flex-row">
      <div className="flex w-full flex-col md:w-9/12">
        <div className="flex w-full flex-col items-start justify-between sm:flex-row sm:items-end">
          <div className="mt-10 flex items-center justify-between">
            <IndicatorCards
              className="gap-6"
              indicators={[
                {
                  title: "Total deposited",
                  value: `${formatDollar(displayRows.reduce((sum, token) => sum + parseFloat(token.totalDepositedValue), 0).toFixed(0))}`,
                },
                {
                  title: "Total claimable",
                  value: `${formatDollar(displayRows.reduce((sum, token) => sum + parseFloat(token.totalClaimableValue), 0).toFixed(0))}`,
                },
              ]}
            />
          </div>

          <div className="flex gap-2">
            <span className="text-sm text-subtitle">Claim all</span>
            <Switch onClick={() => onClickClaimAll()}></Switch>
          </div>
        </div>

        <ListProvider customSort={customSort} _headers={claimListHeaders} _rows={displayRows} _listState={listeState}>
          <ClaimList></ClaimList>
        </ListProvider>
      </div>

      <div className="mt-32 flex h-full min-h-52 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-5 backdrop-blur-[60px] md:w-3/12">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col items-start justify-start">Market</div>

          <div className="flex flex-col items-start justify-start">Claimable</div>
        </div>

        <Divider className="h-0.5 w-full bg-white/10" />

        <div className="flex w-full flex-col">
          {marketsToClaim.map((el: ClaimableMarket) => (
            <div key={el.marketName} className="my-1 flex w-full items-center justify-between">
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
            <>
              {isWellConnected ? (
                <Button label="CLAIM" className="flex w-full items-center justify-center" onClick={() => onClickClaim(marketsToClaim)} />
              ) : (
                <Button label="Connect wallet" className="flex w-full items-center justify-center" onClick={connect} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
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

      {(displayRows as ClaimData[])?.map((item: ClaimData) => (
        <div key={item.marketAddress} className="my-1 rounded-[10px] bg-overlay-panel px-4 py-2.5 backdrop-blur-[60px]">
          <div className="flex items-center justify-between max-xl:flex-col">
            <div className="flex w-full items-center justify-between xl:w-1/2 xl:justify-start">
              <div className="xl:w-2/3">
                <ListAsset name={item?.marketName} token={item.marketName} assetsEarned={[]} />
              </div>
              <div className="flex justify-center xl:w-1/3">
                <div className="flex min-w-16 flex-col items-center justify-center gap-2">
                  <span className="bg-button-active bg-clip-text text-lg font-semibold leading-4 text-transparent md:text-xl">12%</span>

                  <span className="whitespace-nowrap text-xs">
                    Proj: <span>10%</span>
                  </span>
                </div>
              </div>
            </div>
            <hr className="my-2 w-full opacity-20 xl:hidden" />
            <div className="flex w-full flex-wrap items-center justify-between gap-2 xl:w-1/2">
              <div className="flex w-full flex-1 cursor-pointer items-center justify-center gap-2 text-sm md:text-xl">
                {formatDollar(item?.totalClaimableValue || 0, 0)}

                <USGHoverCard iconClassName="text-row-tonic" title={`${item?.marketName} Rewards Breakdown`}>
                  {(item?.claimable as ClaimAsset[]).map((reward: ClaimAsset) => (
                    <div key={reward?.symbol} className="my-1 flex items-center gap-4">
                      <TokenImage token={reward.symbol} size={16} />

                      <span> {Number(formatUnits(BigInt(reward.amount), 18)).toFixed(2)}</span>
                      <span className="w-6"> {reward.symbol}</span>

                      <span className="text-white/60"> ({formatDollar(reward?.valueInUsd)})</span>
                    </div>
                  ))}
                </USGHoverCard>
              </div>

              <div className="flex w-full flex-1 cursor-pointer items-center justify-center text-sm md:text-xl">
                {formatDollar(item?.totalDepositedValue || 0, 0)}
              </div>

              <div className="flex w-full flex-1 cursor-pointer items-center justify-center">
                <Switch
                  checked={!!marketsToClaim.find((market) => market.marketName === item.marketName)}
                  onCheckedChange={() =>
                    addToClaimableMarkets({
                      marketName: item.marketName,
                      claimable: item.totalClaimableValue,
                      marketAddress: item.marketAddress,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
