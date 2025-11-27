"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { useRouter } from "next/navigation"
import { ExistingAsset, ListState } from "@/types"
import { formatDollar } from "@/lib/number_formatter"
import ListRow from "@/components/design_system/list/list_row"
import ListAsset from "@/components/design_system/list/list_asset"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import ListHeader from "@/components/design_system/list/list_header"
import { useUSGMaketListContext } from "./usg_market_list_context"
import InputSelect from "@/components/design_system/inputs/input_select"
import InputSearch from "@/components/design_system/inputs/input_search"
import TokenImage from "@/components/design_system/structure/token_image"
import MarketListAPR from "@/components/design_system/list/market_list_apr"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { marketOptions, protocolOptions, tgUsdListHeaders } from "./usg_market_controller"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "collateral",
    direction: "asc",
  },
}

const MarketListSelectTemplate = (option: { label: string; value: string }) => {
  return <span className="flex w-full cursor-pointer items-center rounded-[10px] px-3 text-sm font-semibold text-white hover:bg-white/10">{option?.label}</span>
}

export default function USGMarketList() {
  const { displayRows, globalData, searchValue, setSearchValue, userData, sortMarketList, marketType, protocol, setMarketType, setProtocol } =
    useUSGMaketListContext()

  return (
    <>
      <div className="flex items-stretch justify-between gap-6">
        <div className="hidden w-1/2 rounded-[10px] bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={140} width={140} src="/medias/tokens/USG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">USG</span>
            <p className="text-[15px]">
              Borrow USG against accepted LP tokens. Tangent features two kinds of markets.
              <span className="inline-block cursor-pointer underline hover:text-white/40">Learn more</span>
            </p>
          </div>
        </div>

        <div className="hidden h-auto w-full flex-col items-center gap-1 rounded-[10px] bg-overlay-panel backdrop-blur-[60px] md:flex xl:w-1/2">
          <div
            style={{ fontSize: "20px", lineHeight: "20px" }}
            className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+120px)_center] bg-no-repeat px-6 !font-semibold italic"
          >
            Points campaign
            <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
          </div>

          <div className="mt-auto flex w-full items-center justify-between gap-3 p-2">
            <div className={cn("flex min-w-48 flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-3", !!userData ? "" : "shimmer")}>
              <span className="text-xs text-subtitle">Your Debt</span>
              <span className="text-sm font-semibold">{formatDollar(formatUnits(userData?.totalUserDebt || 0n, 18), 0)} USD</span>
            </div>

            <div className={cn("flex min-w-48 flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-3", !!userData ? "" : "shimmer")}>
              <span className="text-xs text-subtitle">Your Collateral Deposits</span>
              <span className="text-sm font-semibold">{formatDollar(formatUnits(userData?.totalUserDeposit || 0n, 18), 0)} USD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex w-full flex-col items-end justify-between xl:hidden">
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

        <div className="mt-2 flex w-full items-center justify-between gap-2">
          <div className="flex w-full flex-col items-center justify-center md:w-fit">
            <div className="mb-1 text-xs text-subtitle"> Type </div>
            <InputSelect
              className="w-full min-w-32"
              template={MarketListSelectTemplate}
              value={marketType || ""}
              options={marketOptions}
              onChange={(e) => setMarketType(e)}
            />
          </div>

          <div className="flex w-full flex-col items-center justify-center md:w-fit">
            <div className="mb-1 text-xs text-subtitle"> Protocol </div>

            <InputSelect
              className="w-full min-w-32"
              template={MarketListSelectTemplate}
              value={protocol || ""}
              options={protocolOptions}
              onChange={(e) => setProtocol(e)}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 mt-6 hidden items-end justify-between xl:flex">
        <div className="flex flex-col items-stretch justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IndicatorCards
                className={cn(globalData.USGPrice === "-" ? "shimmer" : "", "gap-6")}
                indicators={[
                  { title: "USG", value: formatDollar(globalData.USGPrice, 5) },
                  { title: "Supply", value: globalData.USGSupply },
                ]}
              >
                <TokenImage token={"USG" as ExistingAsset} className="h-8 w-8" size={32} />
              </IndicatorCards>
              <IndicatorCards
                className={cn(globalData.sUSGPrice === "-" ? "shimmer" : "", "gap-6")}
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

          <div className="flex w-full items-stretch justify-between">
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
        <div className="flex flex-col items-stretch justify-end gap-3">
          <div className="items-strech flex w-full gap-2">
            <IndicatorCards
              className={cn(globalData.globalTvl === "-" ? "shimmer" : "")}
              indicators={[{ title: "Global TVL ", value: globalData.globalTvl }]}
            />
            <IndicatorCards
              className={cn(globalData.globalDebt === "-" ? "shimmer" : "")}
              indicators={[{ title: "Global Debt ", value: globalData.globalDebt }]}
            />
            <IndicatorCards className={cn(globalData.globalCr === "-" ? "shimmer" : "")} indicators={[{ title: "Global CR ", value: globalData.globalCr }]} />
          </div>

          <div className="flex w-full items-stretch justify-center gap-2">
            <div className="flex w-full flex-col items-center justify-center md:w-fit">
              <div className="mb-1 text-xs text-subtitle"> Type </div>
              <InputSelect
                className="w-full min-w-40"
                template={MarketListSelectTemplate}
                value={marketType || ""}
                options={marketOptions}
                onChange={(e) => setMarketType(e)}
              />
            </div>

            <div className="flex w-full flex-col items-center justify-center md:w-fit">
              <div className="mb-1 text-xs text-subtitle"> Protocol </div>

              <InputSelect
                className="w-full min-w-40"
                template={MarketListSelectTemplate}
                value={protocol || ""}
                options={protocolOptions}
                onChange={(e) => setProtocol(e)}
              />
            </div>
          </div>
        </div>
      </div>

      <ListProvider customSort={sortMarketList} _headers={tgUsdListHeaders} _rows={displayRows!} _listState={listeState}>
        <USGMarketListInner />
      </ListProvider>
    </>
  )
}

export function USGMarketListInner() {
  const { headers, listState, udpateSort } = useListContext()
  const { displayRows, marketData } = useUSGMaketListContext()
  const router = useRouter()

  return (
    <>
      <div className="my-2 w-full rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>
      {displayRows?.map((item, index) => (
        <ListRow
          className={cn("my-1", !!marketData.length && !!displayRows ? "" : "shimmer")}
          key={index}
          // Hack for Pendle markets
          navigate={() => router.push(item.token.trim().replaceAll("/", "~").replaceAll(" ", "_"))}
        >
          <ListAsset name={item.name} token={item.token} marketData={marketData.find((el) => el.marketAddress === item.address)} assetsEarned={[]} />
          <MarketListAPR currentAPRDetails={item.currentAPRDetails} apr={item.apr.current} projectedApr={item.apr.projected} />
          <>
            {item.indicators.map((indicator, index) => (
              <div
                key={indicator.key}
                style={{ fontWeight: 300 }}
                className={cn("flex basis-[48%] flex-col items-center text-xl leading-5 md:flex-1", index >= 2 ? "hidden xl:block" : "")}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className={cn("flex text-xs text-subtitle md:text-xl xl:hidden", indicator?.key === "tvl" ? "uppercase" : "")}>{indicator?.label}</span>
                  <span className="text-xs md:text-xl">{indicator?.value}</span>
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
