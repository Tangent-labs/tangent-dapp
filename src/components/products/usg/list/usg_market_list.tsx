"use client"

import Image from "next/image"
import Link from "next/link"
import { Fragment } from "react"
import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { ListRowData, ListState } from "@/types"
import { useUSGContext } from "../usg_context"
import { useRootContext } from "../../root/root_context"
import { IconStars } from "@/components/icons/icon_stars"
import { useUSGMaketListContext } from "./usg_market_list_context"
import { IconCircleHelp, IconOpenOutside } from "@/components/icons"
import { formatDollar, formatMillions } from "@/lib/number_formatter"
import { Divider } from "@/components/design_system/structure/divider"
import { MarketAPR } from "@/components/design_system/list/market_apr"
import { ListAsset } from "@/components/design_system/list/list_asset"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { InputSearch } from "@/components/design_system/inputs/input_search"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { MarketListRow } from "@/components/design_system/list/market_list_row"
import { LargeButtonTab } from "@/components/design_system/inputs/large_button_tab"
import { NeonLightCard } from "@/components/design_system/structure/neon_light_card"
import { MarketListHeader } from "@/components/design_system/list/market_list_header"
import { marketOptions, protocolOptions, USGListHeaders } from "./usg_market_controller"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"
import { ThreeCardRowWithMask } from "@/components/design_system/structure/three_cards_with_background_and_neon"

interface ListRowDispositionProps {
  children: React.ReactNode[]
}

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "tvl",
    direction: "desc",
  },
}

const CustomMarketListRow = ({ children }: ListRowDispositionProps) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="w-full self-start xl:w-1/4">{children?.at(0)}</div>

      <hr className="my-2 w-full opacity-20 xl:hidden" />

      <div className="flex w-full xl:w-3/4">
        <div className="hidden w-full items-center justify-between xl:flex xl:w-2/5 xl:justify-start">
          <div className="hidden items-center justify-center xl:flex xl:w-1/2">{children?.at(1)}</div>
          <div className="hidden items-center justify-center xl:flex xl:w-1/2">{children?.at(2)}</div>
        </div>
        <div className="flex w-full items-center justify-evenly gap-2 xl:w-3/5">
          <div className="flex w-full flex-col items-center justify-evenly gap-2 xl:hidden">
            {children?.at(1)}
            {children?.at(2)}
            {children?.at(3)}
          </div>

          <div className="hidden w-full items-center justify-evenly xl:flex">{children?.at(3)}</div>
        </div>
      </div>
    </div>
  )
}

export default function USGMarketList() {
  const { sUSGCurrentAPY } = useRootContext()

  const { lpUserPoints, voteUserPoints } = useUSGContext()

  const {
    displayRows,
    globalData,
    searchValue,
    setSearchValue,
    userData,
    getSortedRows,
    marketType,
    protocol,
    setMarketType,
    setProtocol,
    filteredBy,
    setFilteredBy,
  } = useUSGMaketListContext()

  return (
    <>
      <div className="mb-2 flex w-full items-stretch justify-between gap-5 xl:mb-4">
        <div className="relative flex h-[100px] w-full overflow-hidden rounded-lg backdrop-blur-[60px] xl:h-[150px] xl:w-1/2">
          <div
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{
              border: "1px solid",
              background: "linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
              WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              borderImageSource: "radial-gradient(50% 50% at 0% 50%, #0075FF 0%, rgba(0, 0, 0, 0) 100%)",
            }}
          />

          <div className="flex w-full items-center justify-center rounded-lg bg-panel-title-gradient">
            <Image
              height={150}
              width={150}
              src="/medias/tokens/USG.png"
              alt="token"
              className="hidden xl:flex"
              style={{ maxWidth: "320px", maxHeight: "320px" }}
            />
            <Image style={{ maxWidth: "80px", maxHeight: "80px" }} height={80} width={80} src="/medias/tokens/USG.png" alt="token" className="flex xl:hidden" />

            <div className="flex flex-col items-start justify-center gap-2 px-2 xl:gap-0 xl:px-6">
              <h2 className="hidden text-4xl font-semibold xl:flex">Markets</h2>
              <p className="mt-2 text-[15px]">Borrow USG against accepted collateral. Tangent features two kinds of markets.</p>
              <Link
                className="flex cursor-pointer items-center justify-center text-sm underline hover:text-white/30 xl:text-[15px]"
                href="https://docs.tangent.finance/docs/usg/overview_usg#markets%E2%80%8B"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about HEC and LEC markets <IconOpenOutside className="ml-1 mt-1 flex w-4 fill-white"></IconOpenOutside>
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden h-auto flex-col justify-between gap-[10px] xl:flex xl:w-1/2">
          <PointsCampaignLiveCard></PointsCampaignLiveCard>

          <ThreeCardRowWithMask
            contents={[
              { key: "Your Debt", value: `${formatMillions(Number(formatUnits(userData?.totalUserDebt || 0n, 18)))} USG` },
              { key: "Your Collateral Deposits", value: `$${formatMillions(Number(formatUnits(userData?.totalUserDeposit || 0n, 18)))} ` },
              {
                key: "Your Total Points",
                value: (
                  <div className="flex w-full items-center justify-center gap-2 text-white transition duration-200">
                    <div>{formatMillions(lpUserPoints?.lpTotalPoints + voteUserPoints?.voteTotalPoints)} pts</div>
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <button type="button">
                          <IconCircleHelp className="h-[13px] w-[13px] fill-white" />
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="top"
                        align="center"
                        className="z-[9999] flex w-full flex-col items-center justify-center p-2 text-sm text-subtitle"
                      >
                        <div className="flex w-full items-center justify-center">LP points: {formatMillions(lpUserPoints?.lpTotalPoints)}</div>
                        <div className="flex w-full items-center justify-center">Vote points: {formatMillions(voteUserPoints?.voteTotalPoints)}</div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                ),
              },
            ]}
          ></ThreeCardRowWithMask>
        </div>
      </div>

      <Divider className="hidden xl:flex" />

      <div className="mb-2 mt-0 flex w-full flex-col items-stretch justify-center gap-2 lg:flex-row xl:mb-0 xl:mt-4 xl:gap-5">
        <div className="hidden w-full justify-center md:flex lg:w-1/2">
          <div className="flex h-full w-full items-stretch gap-4">
            <div className="basis-[40%]">
              <NeonLightCard
                paddingHorizontal={2}
                className={cn(globalData.USGPrice === "-" ? "shimmer" : "", "h-full w-full")}
                color1="#0077ffa3"
                color2="#0075FF"
              >
                <div className="flex h-full items-center justify-evenly gap-4 xl:gap-8">
                  <TokenImage token="USG" className="h-8 w-8" size={32} />

                  {[
                    { key: "USG", value: formatDollar(globalData.USGPrice, 4) },
                    { key: "Supply", value: formatMillions(globalData.USGSupply) },
                  ].map((item, index) => (
                    <div className="text-center" key={index}>
                      <div className="text-center text-xs text-subtitle">{item.key}</div>
                      <div className="text-center text-sm font-semibold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </NeonLightCard>
            </div>
            <div className="basis-[60%]">
              <NeonLightCard
                paddingHorizontal={2}
                className={cn(globalData.sUSGPrice === "-" ? "shimmer" : "", "h-full w-full")}
                color1="#95ff006d"
                color2="#95FF00"
              >
                <div className="flex h-full items-center justify-evenly gap-4 xl:gap-8">
                  <TokenImage token="sUSG" className="h-8 w-8" size={32} />

                  <div className="text-center">
                    <div className="text-xs text-subtitle">sUSG</div>
                    <div className="text-sm font-semibold">{globalData.sUSGPrice}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-subtitle">Supply</div>
                    <div className="text-sm font-semibold">{formatMillions(globalData.sUSGSupply)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-subtitle">APY</div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="text-sm font-semibold text-white">{sUSGCurrentAPY.toFixed(2) + "%"}</div>
                      <IconStars className="w-3 fill-row-success"></IconStars>
                    </div>
                  </div>
                </div>
              </NeonLightCard>
            </div>
          </div>
        </div>

        <ReliefCard className={cn(globalData.globalCr === "-" ? "shimmer" : "", "flex items-center py-2 lg:w-1/2")}>
          <div className="flex w-1/3 flex-col items-center justify-center">
            <div className="whitespace-nowrap text-xs text-subtitle">Collateral Ratio</div>
            <div className="whitespace-nowrap text-sm font-semibold">{globalData.globalCr}</div>
          </div>

          {/* Séparateur */}
          <div className="h-10 w-px flex-shrink-0 bg-white/10" />

          <div className="flex w-1/3 flex-col items-center justify-center">
            <div className="whitespace-nowrap text-xs text-subtitle">Markets TVL</div>
            <div className="whitespace-nowrap text-sm font-semibold">${formatMillions(globalData.globalTvl)}</div>
          </div>

          {/* Séparateur */}
          <div className="h-10 w-px flex-shrink-0 bg-white/10" />

          <div className="flex w-1/3 flex-col items-center justify-center">
            <div className="whitespace-nowrap text-xs text-subtitle">Total debt</div>
            <div className="whitespace-nowrap text-sm font-semibold">{formatMillions(globalData.globalDebt)} USG</div>
          </div>
        </ReliefCard>
      </div>

      <Divider className="flex xl:hidden" />

      <div className="mb-2 flex w-full flex-col items-center justify-center gap-2 md:hidden">
        <InputSearch
          placeholder="Search"
          className="flex w-full flex-col items-center justify-center"
          value={searchValue ?? ""}
          onChange={(e) => setSearchValue(e as string)}
        />
      </div>

      <div className="my-4 hidden items-end justify-between xl:flex">
        <div className="flex flex-col items-stretch justify-between gap-3">
          <div className="flex w-full items-end justify-start gap-2">
            <div className="flex w-full min-w-96 flex-col items-center justify-center">
              <div className="mb-1 text-xs text-subtitle"> Search </div>
              <InputSearch
                placeholder=""
                className="flex w-full flex-col items-center justify-center"
                value={searchValue ?? ""}
                onChange={(e) => setSearchValue(e as string)}
              />
            </div>

            <LargeButtonTab
              onClick={() => setFilteredBy("all")}
              className="h-10 px-4"
              active={!filteredBy || filteredBy === "all"}
              label="All"
            ></LargeButtonTab>
            <LargeButtonTab
              onClick={() => setFilteredBy("deposits")}
              className="h-10 px-4"
              active={filteredBy === "deposits"}
              label="Deposits"
            ></LargeButtonTab>
          </div>
        </div>
        <div className="flex flex-col items-stretch justify-end gap-3">
          <div className="flex w-full items-stretch justify-center gap-2">
            <div className="flex w-full flex-col items-center justify-center md:w-fit">
              <div className="mb-1 text-xs text-subtitle"> Type </div>
              <InputSelect className="w-full min-w-48" value={marketType || ""} options={marketOptions} onChange={(e) => setMarketType(e)} />
            </div>

            <div className="flex w-full flex-col items-center justify-center md:w-fit">
              <div className="mb-1 text-xs text-subtitle"> Protocol </div>

              <InputSelect className="w-full min-w-48" value={protocol || ""} options={protocolOptions} onChange={(e) => setProtocol(e)} />
            </div>
          </div>
        </div>
      </div>

      <ListProvider getSortedRows={getSortedRows} _headers={USGListHeaders} _rows={displayRows!} _listState={listeState}>
        <USGMarketListInner />
      </ListProvider>
    </>
  )
}

export function USGMarketListInner() {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  const { marketData } = useUSGMaketListContext()

  return (
    <>
      <MarketListHeader rowDisposition={CustomMarketListRow} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      {(displayRows as ListRowData[])?.map((item, index) => (
        <MarketListRow
          rowDisposition={CustomMarketListRow}
          className={cn("my-1", !!marketData.length && !!displayRows ? "" : "shimmer")}
          key={index}
          route={"/" + item.address + "/deposit-borrow"}
          borrowCapStatus={item.borrowCapStatus}
        >
          <ListAsset name={item.name} token={item.logoKey} marketData={marketData.find((el) => el.marketAddress === item.address)} />

          <MarketAPR
            poolName={item.name}
            logoKey={item.logoKey}
            rewardToken={item?.rewardToken}
            maxLeverage={1}
            currentAPRDetails={item.currentAPRDetails}
            projectedAPRDetails={item.projectedAPRDetails}
            apr={item.apr.current}
            projectedApr={item.apr.projected}
            marketType={marketData.find((el) => el.marketAddress === item.address)?.marketType}
            isMarketListDisplay={true}
          />

          <MarketAPR
            poolName={item.name}
            logoKey={item.logoKey}
            rewardToken={item?.rewardToken}
            maxLeverage={1 / (1 - item?.maxLTV) || 1}
            currentAPRDetails={item.currentAPRDetails}
            projectedAPRDetails={item.projectedAPRDetails}
            apr={item.apr.current}
            projectedApr={item.apr.projected}
            marketType={marketData.find((el) => el.marketAddress === item.address)?.marketType}
            isMarketListDisplay={true}
          />

          <>
            {item.indicators.map((indicator, index) => (
              <Fragment key={indicator.key}>
                {indicator?.key === "borrowed" ? (
                  <div key={indicator.key} style={{ fontWeight: 300 }} className={cn("hidden basis-[48%] flex-col items-center leading-5 md:flex-1 xl:block")}>
                    <span className="flex flex-col items-center justify-center">
                      {/* MOBILE CARD LABEL  */}
                      <span className={cn("flex text-sm text-subtitle md:text-xl xl:hidden")}>{indicator?.label}</span>

                      {item.isBorrowCapReached ? (
                        <HoverCard openDelay={50} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <span className="hidden cursor-pointer flex-col items-center justify-center xl:flex">
                              <span className="text-xs md:text-[15px]">{indicator?.value}</span>
                              <span className="text-xs text-subtitle md:text-[10px]">/{indicator?.subValue}</span>
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent side="top" align="center" className="z-[9999] w-full p-2 text-xs">
                            Borrow cap has been reached
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        <>
                          <span className="text-xs md:text-[15px]">{indicator?.value}</span>
                          <span className="hidden text-xs text-subtitle md:flex md:text-[10px]">/{indicator?.subValue}</span>
                        </>
                      )}
                    </span>
                  </div>
                ) : (
                  <div
                    key={indicator.key}
                    style={{ fontWeight: 300 }}
                    className={cn("flex w-full basis-[48%] flex-col items-center justify-between leading-5 md:flex-1", index >= 2 ? "hidden xl:block" : "")}
                  >
                    <span className="flex w-full items-center justify-between gap-2 xl:justify-center">
                      {/* MOBILE CARD LABEL  */}
                      <span className={cn("flex text-sm text-subtitle xl:hidden xl:text-xl", indicator?.key === "tvl" ? "uppercase" : "")}>
                        {indicator?.label}
                      </span>
                      {/* VALUE  */}
                      <span className="text-sm md:text-[15px]">{indicator?.value}</span>
                    </span>
                  </div>
                )}
              </Fragment>
            ))}

            {item.userHasDeposited && (
              <div className="absolute -right-4 top-0 flex h-full w-2 items-center justify-center">
                <div className="h-10 w-2 rounded-full bg-tonic"></div>
              </div>
            )}

            {(item.isDepositPaused || item.isBorrowPaused || item.isLeveragePaused) && (
              <div className="absolute -top-5 right-3 flex h-full w-2 items-center justify-center">
                <div className="h-3 w-1 bg-danger"></div>
                <div className="ml-1 h-3 w-1 bg-danger"></div>
              </div>
            )}
          </>
        </MarketListRow>
      ))}
    </>
  )
}
