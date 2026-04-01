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
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { USGHoverCard } from "@/components/design_system/structure/usg_hover_card"
import { ListGradientBorder } from "@/components/design_system/list/list_gradient_border"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "totalClaimableValue",
    direction: "desc",
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
  const color1 = "#0077ff67"
  const color2 = "#0075FF"

  const { displayRows, onClickClaim, marketsToClaim, getSortedRows, isChainviewLoading, isTxLoading, onClickClaimAll, totalDeposited, totalClaimable } =
    useUSGClaimContext()

  const { isWellConnected, connect } = useWalletConnexionContext()

  return (
    <>
      <div className="flex items-stretch justify-between gap-6">
        <PageHeader>
          <Image height={150} width={150} src="/medias/logos/claim.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Claim</span>
            <p className="text-[15px]"> Claim rewards associated with your active positions.</p>
          </div>
        </PageHeader>

        <div className="flex h-auto w-full flex-col justify-between gap-[10px] xl:w-1/2">
          <PointsCampaignLiveCard></PointsCampaignLiveCard>

          <ReliefCard className="relative flex w-full items-center justify-between px-3 py-4">
            <div className="absolute inset-0 rounded-[10px] bg-cover bg-center opacity-20" style={{ backgroundImage: 'url("./medias/card_bg_blocks.png")' }} />

            <div
              className="absolute inset-0 rounded-[10px]"
              style={{
                left: 0,
                width: "100%",
                background: `
                  linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03)), 
                  radial-gradient(50.04% 50% at 50% 100%, ${color1} 0%, rgba(0, 0, 0, 0) 100%)
                `,
              }}
            />

            <div
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{
                padding: "1px",
                left: 0,
                width: "100%",
                background: `
                  radial-gradient(49.97% 49.97% at 50% 100%, #FFFFFF 0%,
                  ${color2} 19.71%, rgba(0, 0, 0, 0) 100%), 
                  linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%,
                  rgba(255, 255, 255, 0.1) 100%)
                `,
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />

            <div className="relative z-10 w-full text-center">
              <h3 className="mb-1 text-xs text-subtitle">Total deposited</h3>
              <p className="font-semibold text-white">{totalDeposited}</p>
            </div>

            <div className="relative z-10 w-full text-center">
              <h3 className="mb-1 text-xs text-subtitle">Total claimable</h3>
              <p className="font-semibold text-white">{totalClaimable}</p>
            </div>
          </ReliefCard>
        </div>
      </div>

      <div className="mt-3 flex w-full flex-col items-start justify-start gap-3 md:flex-row">
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
            <div className="flex w-full gap-3 rounded-t-[10px] bg-overlay-panel px-4 py-2 leading-[10px] backdrop-blur-[60px]">
              <span className="text-sm text-subtitle">Claim all</span>
              <Switch checked={displayRows?.length > 0 && marketsToClaim.length === displayRows.length} onClick={() => onClickClaimAll()}></Switch>
            </div>

            <ListGradientBorder classname={"rounded-t-[10px]"} />
          </div>

          <div className="relative mt-1 flex h-full min-h-52 w-full flex-col items-start justify-start p-2 backdrop-blur-[60px] transition-all duration-200 ease-out before:absolute before:inset-0 before:-z-10 before:opacity-60 before:transition-all before:duration-300">
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

            <div className="mt-8 flex w-full">
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

      {(displayRows as ClaimData[])?.map((item: ClaimData) => (
        <div key={item.marketAddress} className="my-0.5 bg-overlay-panel px-4 py-1 backdrop-blur-[60px]">
          <div className="flex items-center justify-between max-xl:flex-col">
            <div className="flex w-full items-center justify-between xl:w-1/2 xl:justify-start">
              <div className="xl:w-2/3">
                <ListAsset name={item?.marketName} token={item.logoKey} />
              </div>

              <div className="flex justify-center xl:w-1/3">
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
            <div className="flex w-full flex-wrap items-center justify-between gap-2 xl:w-1/2">
              <div className="flex w-full flex-1 items-center justify-center gap-2 text-[15px]">
                {formatDollar(item?.totalClaimableValue || 0, 2)}

                <USGHoverCard iconClassName="w-3" title={`${item?.marketName} Rewards Breakdown`}>
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

              <div className="flex w-full flex-1 items-center justify-center text-[15px]">${formatMillions(item?.totalDepositedValue || 0)}</div>

              <div className="flex w-full flex-1 items-center justify-center">
                <Switch
                  checked={!!marketsToClaim.find((market) => market.marketAddress === item.marketAddress)}
                  onCheckedChange={() =>
                    addToClaimableMarkets({
                      marketName: item.marketName,
                      claimable: item.totalClaimableValue,
                      marketAddress: item.marketAddress,
                      logoKey: item.logoKey,
                      rewards: item.claimable,
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
