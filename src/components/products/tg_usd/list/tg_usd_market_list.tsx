"use client"

import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ExistingAsset, ListState } from "@/types"
import { useTgUsdContext } from "../tg_usd_context"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { tgUsdListHeaders } from "./tg_usd_market_controller"
import ListHeader from "@/components/design_system/list/list_header"
import ListRow from "@/components/design_system/list/list_row"
import ListAsset from "@/components/design_system/list/list_asset"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import TokenImage from "@/components/design_system/structure/token_image"
import { useTgUsdMaketListContext } from "./tg_usd_market_list_context"
import InputSearch from "@/components/design_system/inputs/input_search"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import MarketListAPR from "@/components/design_system/list/market_list_apr"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "collateral",
    direction: "asc",
  },
}

export default function TgUsdMarketList() {
  const { displayRows, globalData, searchValue, setSearchValue, userData } = useTgUsdMaketListContext()

  const { userPoints } = useTgUsdContext()

  return (
    <>
      <div className="flex items-center justify-between gap-6">
        <div className="tgusd-card hidden w-7/12 xl:flex">
          <div className="flex items-center justify-center">
            <Image height={160} width={160} src="/medias/tokens/tgUSD_header.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3">
            <span className="text-4xl font-semibold">USG</span>
            <p>
              Borrow USG against accepted LP tokens. Tangent features two kinds of markets.{" "}
              <span className="inline-block cursor-pointer underline hover:text-white/40">Learn more</span>
            </p>
          </div>
        </div>

        <div className="hidden h-full w-full flex-col items-center gap-8 rounded-[10px] bg-overlay-panel backdrop-blur-[60px] md:flex xl:w-fit">
          <div className="flex h-20 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+40px)_center] bg-no-repeat px-6 !text-[20px] !font-semibold italic">
            Points campaign
            <div className="ml-2 flex items-center justify-center rounded-[10px] bg-tonic px-2 py-0.5 !font-semibold !not-italic !text-black">Live</div>
          </div>

          <div className="mt-auto flex w-full items-center justify-between gap-3 p-2">
            <div
              className={cn(
                "flex min-w-48 flex-col items-center justify-center gap-1 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[60px]",
                !!userData ? "" : "shimmer"
              )}
            >
              <span className="text-xs text-gray-400">Your Debt</span>
              <span className="text-sm font-semibold">{formatDollar(formatUnits(userData?.totalUserDebt || 0n, 18))} USD</span>
            </div>

            <div
              className={cn(
                "flex min-w-48 flex-col items-center justify-center gap-1 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[60px]",
                !!userData ? "" : "shimmer"
              )}
            >
              <span className="text-xs text-gray-400">Your Collateral Deposits</span>
              <span className="text-sm font-semibold">{formatDollar(formatUnits(userData?.totalUserDeposit || 0n, 18))} USD</span>
            </div>

            <div className="flex min-w-48 flex-col items-center justify-center gap-1 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[60px]">
              <span className="text-xs text-gray-400">Your Total Points</span>
              <span className="text-sm font-semibold">{formatNumber(userPoints.totalPoints, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex w-full items-end justify-between xl:hidden">
        <div className="flex w-full items-end justify-start gap-2">
          <div className="flex w-full flex-col items-center justify-center">
            <div className="mb-1 text-xs text-subtitle"> Search </div>
            <InputSearch
              placeholder=""
              className="flex w-full flex-col items-center justify-center"
              value={searchValue ?? ""}
              onChange={(e) => setSearchValue(e as string)}
            />
          </div>

          <ButtonTab className="h-10 px-4" active={true} label="All"></ButtonTab>
          <ButtonTab className="h-10 px-4" active={false} label="Deposits"></ButtonTab>
        </div>
      </div>

      <div className="mt-10 hidden items-start justify-between xl:flex">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IndicatorCards
                className={cn(globalData.USGPrice === "-" ? "shimmer" : "")}
                indicators={[
                  { title: "USG", value: formatDollar(globalData.USGPrice, 5) },
                  { title: "Supply", value: globalData.USGSupply },
                ]}
              >
                <TokenImage token={"USG" as ExistingAsset} className="h-8 w-8" size={32} />
              </IndicatorCards>
              <IndicatorCards
                className={cn(globalData.sUSGPrice === "-" ? "shimmer" : "")}
                indicators={[
                  { title: "sUSG ", value: globalData.sUSGPrice },
                  { title: "Supply", value: globalData.sUSGSupply },
                  { title: "APY", value: globalData.APY },
                ]}
              >
                <TokenImage token={"sUSG" as ExistingAsset} className="h-8 w-8" size={32} />
              </IndicatorCards>
            </div>
          </div>

          <div className="flex w-full items-end justify-between">
            <div className="flex w-full items-end justify-start gap-2">
              <div className="flex w-full flex-col items-center justify-center">
                <div className="mb-1 text-xs text-subtitle"> Search </div>
                <InputSearch
                  placeholder=""
                  className="flex w-full flex-col items-center justify-center"
                  value={searchValue ?? ""}
                  onChange={(e) => setSearchValue(e as string)}
                />
              </div>

              <ButtonTab className="h-10 px-4" active={true} label="All"></ButtonTab>
              <ButtonTab className="h-10 px-4" active={false} label="Deposits"></ButtonTab>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IndicatorCards className={cn(globalData.globalTvl === "-" ? "shimmer" : "")} indicators={[{ title: "Global TVL ", value: globalData.globalTvl }]} />
          <IndicatorCards
            className={cn(globalData.globalDebt === "-" ? "shimmer" : "")}
            indicators={[{ title: "Global Debt ", value: globalData.globalDebt }]}
          />
          <IndicatorCards className={cn(globalData.globalCr === "-" ? "shimmer" : "")} indicators={[{ title: "Global CR ", value: globalData.globalCr }]} />
        </div>
      </div>

      <ListProvider _headers={tgUsdListHeaders} _rows={displayRows!} _listState={listeState}>
        <TgUsdMarketListInner />
      </ListProvider>
    </>
  )
}

export function TgUsdMarketListInner() {
  const { headers, listState, udpateSort } = useListContext()
  const { displayRows, marketData } = useTgUsdMaketListContext()
  const router = useRouter()

  return (
    <>
      <div className="my-2 w-full rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>
      {displayRows?.map((item, index) => (
        <ListRow
          className={cn("my-2", !!marketData.length && !!displayRows ? "" : "shimmer")}
          key={index}
          // Hack for Pendle markets
          navigate={() => router.push(item.token.trim().replaceAll("/", "~").replaceAll(" ", "_"))}
        >
          <ListAsset name={item.name} token={item.token} marketData={marketData.find((el) => el.marketAddress === item.address)} assetsEarned={[]} />
          <MarketListAPR apr={item.apr.current} projectedApr={item.apr.projected} />
          <>
            {item.indicators.map((indicator, index) => (
              <div
                key={indicator.key}
                style={{ fontWeight: 300 }}
                className={cn("flex basis-[48%] flex-col items-center text-[20px] leading-5 md:flex-1", index >= 2 ? "hidden xl:block" : "")}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className={cn("flex text-xs text-subtitle md:text-[20px] xl:hidden", indicator?.key === "tvl" ? "uppercase" : "")}>
                    {indicator?.label}
                  </span>
                  <span className="text-xs md:text-[20px]">{indicator?.value}</span>
                </span>
              </div>
            ))}

            {item.userHasDeposited && (
              <div className="absolute -right-4 top-0 flex h-full w-2 items-center justify-center">
                <div className="h-10 w-2 rounded-full bg-tonic"></div>
              </div>
            )}
          </>
        </ListRow>
      ))}
    </>
  )
}
