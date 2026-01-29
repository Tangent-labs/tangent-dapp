"use client"

import Image from "next/image"
import { formatUnits } from "viem"
import { Switch } from "@/components/ui/switch"
import { ExistingAsset, ListState } from "@/types"
import { claimListHeaders } from "./usg_claim_controller"
import { useUSGClaimContext } from "./usg_claim_context"
import { Button } from "@/components/design_system/inputs/button"
import ListAsset from "@/components/design_system/list/list_asset"
import Divider from "@/components/design_system/structure/divider"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import ListHeader from "@/components/design_system/list/list_header"
import { ClaimableMarket, ClaimAsset, ClaimData } from "../usg_type"
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
  const { displayRows, onClickClaim, marketsToClaim, customSort, isLoading, onClickClaimAll, USGsUSGMetrics, totalDeposited, totalClaimable } =
    useUSGClaimContext()

  const { isWellConnected, connect } = useWalletConnexionContext()

  return (
    <>
      <div className="flex items-stretch justify-between gap-6">
        <div className="hidden w-1/2 rounded-[10px] bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={140} width={140} src="/medias/tokens/USG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Claim</span>
            <p className="text-[15px]">Claim protocol-generated CRV and CVX rewards associated with your active streaming pool positions.</p>
          </div>
        </div>

        <div className="flex h-auto w-full flex-col items-center gap-2 xl:w-1/2">
          <div
            style={{ fontSize: "20px", lineHeight: "20px" }}
            className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+120px)_center] bg-no-repeat px-6 !font-semibold italic"
          >
            Points campaign
            <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
          </div>

          <div className="mt-auto flex w-full items-center justify-center gap-3 rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
            <div className="flex w-full min-w-24 flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-2 xl:min-w-48">
              <span className="text-xs text-subtitle">USG Balance</span>
              <span className="text-sm font-semibold">{formatBigInt(USGsUSGMetrics?.USGBalance || 0n, 18, 2)}</span>
            </div>

            <div className="flex w-full min-w-24 flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-2 xl:min-w-48">
              <span className="text-xs text-subtitle">sUSG Balance</span>
              <span className="text-sm font-semibold">{formatBigInt(USGsUSGMetrics?.sUSGBalance || 0n, 18, 2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-4 md:flex-row">
        <div className="flex w-full flex-col md:w-9/12">
          <div className="flex w-full flex-col items-start justify-between sm:flex-row sm:items-end">
            <div className="mt-0 flex w-80 items-center justify-between md:mt-10">
              <IndicatorCards
                className="gap-6"
                indicators={[
                  {
                    title: "Total deposited",
                    value: totalDeposited,
                  },
                  {
                    title: "Total claimable",
                    value: totalClaimable,
                  },
                ]}
              />
            </div>

            <div className="mt-2 flex gap-2">
              <span className="text-sm text-subtitle">Claim all</span>
              <Switch onClick={() => onClickClaimAll()}></Switch>
            </div>
          </div>

          <ListProvider customSort={customSort} _headers={claimListHeaders} _rows={displayRows} _listState={listeState}>
            <ClaimList></ClaimList>
          </ListProvider>

          {!isLoading && displayRows?.length === 0 && (
            <div className="mt-24 flex w-full items-center justify-center text-sm text-subtitle">Nothing to claim for now</div>
          )}
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
                <div className="relative flex items-center gap-4">
                  {el.marketName?.substring(0, el.marketName.indexOf(" ")) === "USDe" || el.marketName?.substring(0, el.marketName.indexOf(" ")) === "sUSDe" ? (
                    <TokenImage token={el.marketName as ExistingAsset} size={24} className="ml-1 w-6" />
                  ) : (
                    <TokenImage token={el.marketName as ExistingAsset} size={32} className="w-8" />
                  )}

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
                  <Button label="Claim" className="flex w-full items-center justify-center" onClick={() => onClickClaim(marketsToClaim)} />
                ) : (
                  <Button label="Connect wallet" className="flex w-full items-center justify-center" onClick={connect} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function ClaimList() {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  const { addToClaimableMarkets, marketsToClaim } = useUSGClaimContext()

  return (
    <>
      <div className="mb-0.5 mt-2 w-full rounded-t-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ListHeader rowDisposition={ClaimRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      {(displayRows as ClaimData[])?.map((item: ClaimData) => (
        <div key={item.marketAddress} className="my-0.5 bg-overlay-panel px-4 py-2.5 backdrop-blur-[60px]">
          <div className="flex items-center justify-between max-xl:flex-col">
            <div className="flex w-full items-center justify-between xl:w-1/2 xl:justify-start">
              <div className="xl:w-2/3">
                <ListAsset name={item?.marketName} token={item.marketName as ExistingAsset} assetsEarned={[]} />
              </div>
              <div className="flex justify-center xl:w-1/3">
                <div className="flex min-w-16 flex-col items-center justify-center">
                  <span className="bg-button-active bg-clip-text text-lg font-semibold leading-4 text-transparent md:text-lg">
                    {item?.totalCurrentAPR?.toFixed(2)}%
                  </span>

                  <span className="whitespace-nowrap text-xs">
                    Proj: <span> {item?.totalProjectedAPR?.toFixed(2)} %</span>
                  </span>
                </div>
              </div>
            </div>
            <hr className="my-2 w-full opacity-20 xl:hidden" />
            <div className="flex w-full flex-wrap items-center justify-between gap-2 xl:w-1/2">
              <div className="flex w-full flex-1 cursor-pointer items-center justify-center gap-2 text-sm md:text-lg">
                {formatDollar(item?.totalClaimableValue || 0, 2)}

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

              <div className="flex w-full flex-1 cursor-pointer items-center justify-center text-sm md:text-lg">
                {formatDollar(item?.totalDepositedValue || 0, 0)}
              </div>

              <div className="flex w-full flex-1 cursor-pointer items-center justify-center">
                <Switch
                  checked={!!marketsToClaim.find((market) => market.marketName === item.marketName)}
                  onCheckedChange={() =>
                    addToClaimableMarkets({
                      marketName: item.marketName as ExistingAsset,
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
