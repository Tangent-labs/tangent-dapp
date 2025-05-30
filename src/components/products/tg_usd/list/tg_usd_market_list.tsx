"use client"

import { useTgUsdMaketListContext } from "./tg_usd_market_list_context"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { tgUsdListHeaders } from "./tg_usd_market_controller"
import { ExistingAsset, ListState } from "@/types"
import ListHeader from "@/components/design_system/list/list_header"
import ListRow from "@/components/design_system/list/list_row"
import ListAsset from "@/components/design_system/list/list_asset"
import ListAPR from "@/components/design_system/list/list_apr"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import { formatDollar } from "@/lib/number_formatter"
import TokenImage from "@/components/design_system/structure/token_image"
import { useRouter } from "next/navigation"
import Image from "next/image"
import InputSearch from "@/components/design_system/inputs/input_search"
import ButtonTab from "@/components/design_system/inputs/button_tab"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "collateral",
    direction: "asc",
  },
}

export default function TgUsdMarketList() {
  const { displayRows, globalData, searchValue, setSearchValue } = useTgUsdMaketListContext()

  return (
    <>
      <div className="flex items-end justify-between">
        <div className="tgusd-card w-7/12">
          <div className="flex items-center justify-center">
            <Image height={320} width={320} src="/medias/tokens/tgUSD_header.png" alt="token" />
          </div>
          <div className="flex flex-col items-start justify-center gap-3">
            <span className="text-4xl font-bold">tgUSD</span>
            <p>
              Borrow tgUSD against accepted LP tokens. Tangent features two kinds of markets.{" "}
              <span className="inline-block cursor-pointer underline hover:text-white/40">Learn more</span>
            </p>
          </div>
        </div>

        <div className="flex h-full flex-col items-center gap-6 rounded-[10px] bg-overlay-panel p-2 py-1 backdrop-blur-[60px]">
          <div className="flex h-20 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+40px)_center] bg-no-repeat px-6 !text-[20px] !font-bold italic">
            Points campaign
            <div className="ml-2 flex items-center justify-center rounded-[10px] bg-tonic px-2 py-0.5 !font-bold !not-italic !text-black">Live</div>
          </div>

          <div className="flex w-full items-center justify-center gap-3">
            <div className="flex min-w-48 flex-col items-center justify-center gap-1 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[60px]">
              <span className="text-xs text-gray-400">Your Debts</span>
              <span className="text-sm font-bold">$0.00 USD</span>
            </div>

            <div className="flex min-w-48 flex-col items-center justify-center gap-1 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[60px]">
              <span className="text-xs text-gray-400">Your Collateral Deposits</span>
              <span className="text-sm font-bold">$0.00 USD</span>
            </div>

            <div className="flex min-w-48 flex-col items-center justify-center gap-1 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[60px]">
              <span className="text-xs text-gray-400">Your Total Points</span>
              <span className="text-sm font-bold">$0.00 USD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-start justify-between">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndicatorCards
                indicators={[
                  { title: "tgUsd ", value: formatDollar(globalData.tgUsdPrice, 5) },
                  { title: "Supply", value: globalData.tgUsdSupply },
                ]}
              >
                <TokenImage token={"tgUSD" as ExistingAsset} className="h-8 w-8" size={32} />
              </IndicatorCards>
              <IndicatorCards
                indicators={[
                  { title: "sgUsd ", value: globalData.tgUsdPrice },
                  { title: "Supply", value: globalData.tgUsdSupply },
                  { title: "APY", value: globalData.APY },
                ]}
              >
                <TokenImage token={"sgUSD" as ExistingAsset} className="h-8 w-8" size={32} />
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

              <ButtonTab className="px-4 py-2.5" active={true} label="All"></ButtonTab>
              <ButtonTab className="px-4 py-2.5" active={false} label="Deposits"></ButtonTab>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IndicatorCards indicators={[{ title: "Global CR ", value: globalData.globalCr }]} />
          <IndicatorCards indicators={[{ title: "Global TVL ", value: globalData.globalTvl }]} />
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
  const { displayRows } = useTgUsdMaketListContext()
  const router = useRouter()

  return (
    <>
      <div className="my-2 w-full rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>
      {displayRows?.map((item, index) => (
        <ListRow className="my-2" key={index} navigate={() => router.push(item.token)}>
          <ListAsset name={item.name} token={item.token} assetsEarned={[]} />
          <ListAPR apr={item.apr.current} projectedApr={item.apr.projected} />
          <>
            {item.indicators.map((i) => (
              <div key={i.key} className="flex basis-[48%] flex-col items-center text-[20px] leading-5 md:flex-1">
                {i?.value}
              </div>
            ))}
          </>
        </ListRow>
      ))}
    </>
  )
}
