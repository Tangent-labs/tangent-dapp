"use client"

import Image from "next/image"
import { formatUnits } from "viem"
import { ListState } from "@/types"
import { Switch } from "@/components/ui/switch"
import { specialTokensList } from "../usg_repository"
import { useUSGClaimContext } from "./usg_claim_context"
import { claimListHeaders } from "./usg_claim_controller"
import { Button } from "@/components/design_system/inputs/button"
import { ClaimableMarket, ClaimAsset, ClaimData } from "../usg_type"
import { ListAsset } from "@/components/design_system/list/list_asset"
import { formatDollar, formatMillions } from "@/lib/number_formatter"
import { MarketAPR } from "@/components/design_system/list/market_apr"
import { Divider } from "@/components/design_system/structure/divider"
import { ListHeader } from "@/components/design_system/list/list_header"
import { PageHeader } from "@/components/design_system/structure/page_header"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { USGHoverCard } from "@/components/design_system/structure/usg_hover_card"
import { ListGradientBorder } from "@/components/design_system/list/list_gradient_border"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"
import { ThreeCardRowWithMask } from "@/components/design_system/structure/three_cards_with_background_and_neon"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "totalClaimableValue",
    direction: "desc",
  },
}

const ClaimRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex flex-col items-center justify-between xl:flex-row">
      <div className="flex w-full items-center justify-between xl:w-1/4 xl:justify-start">{children?.at(0)}</div>

      <hr className="my-2 w-full opacity-20 xl:hidden" />

      <div className="flex w-full justify-center xl:w-1/4">{children?.at(1)}</div>

      <div className="flex w-full flex-col items-center justify-between gap-2 xl:w-1/2 xl:flex-row">{children?.at(2)}</div>
    </div>
  )
}

export default function USGClaimContent() {
  const {
    displayRows,
    onClickClaim,
    marketsToClaim,
    getSortedRows,
    isChainviewLoading,
    isTxLoading,
    onClickClaimAll,
    totalDeposited,
    totalClaimable,
    weightedAPRAverage,
  } = useUSGClaimContext()

  const { isWellConnected, connect } = useWalletConnexionContext()

  return (
    <>
      <div className="flex items-stretch justify-between gap-5">
        <PageHeader>
          <Image height={150} width={150} src="/medias/logos/claim.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Claim</span>
            <p className="text-[15px]"> Claim rewards associated with your active positions.</p>
          </div>
        </PageHeader>

        <div className="flex h-auto w-full flex-col justify-between gap-[10px] xl:w-1/2">
          <PointsCampaignLiveCard></PointsCampaignLiveCard>
          <ThreeCardRowWithMask
            contents={[
              { key: "Total claimable", value: totalClaimable },
              { key: "Average APR", value: weightedAPRAverage },
              { key: "Total deposited", value: totalDeposited },
            ]}
          />
        </div>
      </div>

      <div className="mt-5 flex w-full flex-col items-start justify-start gap-[10px] md:flex-row">
        <div className="flex w-full flex-col md:w-9/12">
          <ListProvider getSortedRows={getSortedRows} _headers={claimListHeaders} _rows={displayRows} _listState={listeState}>
            <ClaimList />
          </ListProvider>

          {!isChainviewLoading && displayRows?.length === 0 && (
            <div className="mt-24 flex w-full items-center justify-center text-sm text-subtitle">Nothing to claim for now</div>
          )}
        </div>

        <div className="flex w-full flex-col items-center justify-center md:w-3/12">
          <div className="relative hidden w-full xl:block">
            <div className="flex w-full justify-between gap-3 rounded-t-[10px] bg-overlay-panel p-[10px] leading-[10px] backdrop-blur-[60px]">
              <span className="text-sm text-subtitle">Claim all</span>
              <Switch checked={displayRows?.length > 0 && marketsToClaim.length === displayRows.length} onClick={() => onClickClaimAll()}></Switch>
            </div>

            <ListGradientBorder classname={"rounded-t-[10px]"} />
          </div>

          <div className="relative mt-1 flex h-full min-h-52 w-full flex-col items-stretch justify-between rounded-b-[10px] bg-overlay-panel p-[10px] backdrop-blur-[60px] transition-all duration-200 ease-out before:absolute before:inset-0 before:-z-10 before:opacity-60 before:transition-all before:duration-300">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col items-start justify-start">Market</div>
              Claimable
            </div>

            <Divider />

            <div className="flex w-full flex-col">
              {marketsToClaim.map((el: ClaimableMarket) => (
                <div key={el.marketAddress} className="my-1 flex w-full items-center justify-between">
                  <div className="relative flex items-center gap-4">
                    {specialTokensList?.includes(el.marketName?.substring(0, el.marketName.indexOf(" "))) ? (
                      <TokenImage token={el.logoKey} size={24} className="ml-1 w-6" />
                    ) : (
                      <TokenImage token={el.logoKey} size={32} className="w-8" />
                    )}

                    <span className="text-[12px] font-semibold">{el.marketName}</span>
                  </div>

                  <span className="text-[12px] font-semibold">${el.claimable}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto flex w-full pt-8">
              {marketsToClaim.length > 0 && (
                <>
                  {isWellConnected ? (
                    <Button
                      label="Claim"
                      className="flex w-full items-center justify-center"
                      hasLoadingState={true}
                      isLoading={isTxLoading}
                      state={isTxLoading ? "disabled" : "active"}
                      onClick={() => onClickClaim(marketsToClaim)}
                    />
                  ) : (
                    <Button label="Connect wallet" className="flex w-full items-center justify-center" onClick={connect} />
                  )}
                </>
              )}
            </div>

            <ListGradientBorder />
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
      <div className="mb-0.5 w-full">
        <ListHeader rowDisposition={ClaimRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      {(displayRows as ClaimData[])?.map((item: ClaimData) => {
        const isSelected = !!marketsToClaim.find((market) => market.marketAddress === item.marketAddress)
        const selectedClass = isSelected ? "bg-panel-selected-row" : "bg-overlay-panel"
        return (
          <div
            key={item.marketAddress}
            className={`my-0.5 p-[10px] backdrop-blur-[60px] hover-lift-row ${selectedClass}`}
            onClick={() =>
              addToClaimableMarkets({
                marketName: item.marketName,
                claimable: item.totalClaimableValue,
                marketAddress: item.marketAddress,
                logoKey: item.logoKey,
                rewards: item.claimable,
              })
            }
          >
            <div className="flex flex-col items-center justify-between xl:flex-row">
              <div className="flex w-full items-center justify-between xl:w-1/2">
                <div className="w-full xl:w-1/2">
                  <ListAsset name={item?.marketName} token={item.logoKey} />
                </div>

                <div className="hidden justify-center xl:flex xl:w-1/2">
                  <MarketAPR
                    marketType={item?.marketType}
                    logoKey={item.logoKey}
                    poolName={item?.marketName}
                    rewardToken={item?.rewardToken}
                    maxLeverage={1}
                    currentAPRDetails={item.currentAPRDetails}
                    projectedAPRDetails={item.projectedAPRDetails}
                    apr={item?.apr?.current}
                    projectedApr={item?.apr?.projected}
                    isMarketListDisplay={true}
                  />
                </div>
              </div>

              <hr className="my-2 w-full opacity-20 xl:hidden" />

              <div className="justify-bewteen flex w-full items-center xl:hidden">
                <MarketAPR
                  marketType={item?.marketType}
                  logoKey={item.logoKey}
                  poolName={item?.marketName}
                  rewardToken={item?.rewardToken}
                  maxLeverage={1}
                  currentAPRDetails={item.currentAPRDetails}
                  projectedAPRDetails={item.projectedAPRDetails}
                  apr={item?.apr?.current}
                  projectedApr={item?.apr?.projected}
                  isMarketListDisplay={true}
                />
              </div>

              <div className="mt-2 flex w-full flex-col items-center justify-between gap-2 xl:mt-0 xl:w-1/2 xl:flex-row">
                <div className="flex w-full flex-1 items-center justify-between gap-2 text-[15px] xl:w-1/2 xl:justify-center">
                  <span className="flex text-sm text-subtitle xl:hidden"> Claimable </span>

                  <div className="flex items-center justify-center gap-2 text-sm xl:text-[15px]">
                    {formatDollar(item?.totalClaimableValue || 0, 2)}

                    <USGHoverCard iconClassName="w-3 fill-white" title={`${item?.marketName} Rewards Breakdown`}>
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
                </div>

                <div className="flex w-full flex-1 items-center justify-between text-sm xl:w-auto xl:justify-center xl:text-[15px]">
                  <span className="flex text-sm text-subtitle xl:hidden"> Deposited </span>${formatMillions(item?.totalDepositedValue || 0)}
                </div>
              </div>
            </div>

            <ListGradientBorder />
          </div>
        )
      })}
    </>
  )
}
