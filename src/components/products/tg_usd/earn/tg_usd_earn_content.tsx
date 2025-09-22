"use client"

import Image from "next/image"
import { ExistingAsset, ListState } from "@/types"
import { formatBigInt } from "@/lib/number_formatter"
import { useTgUsdEarnContext } from "./tg_usd_earn_context"
import ListRow from "@/components/design_system/list/list_row"
import { tgUsdEarnListHeaders } from "./tg_usd_earn_controller"
import ListHeader from "@/components/design_system/list/list_header"
import InputSearch from "@/components/design_system/inputs/input_search"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import ListAprIndicator from "@/components/design_system/list/list_apr_indicator"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "assets",
    direction: "asc",
  },
}

export const TgUsdEarnContent = () => {
  const { searchValue, setSearchValue, displayRows, USGsUSGMetrics } = useTgUsdEarnContext()

  return (
    <>
      <div className="flex items-center justify-between gap-6">
        <div className="usg-header hidden w-7/12 xl:flex">
          <div className="flex items-center justify-center">
            <Image height={160} width={160} src="/medias/tokens/tgUSD_header.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3">
            <span className="text-4xl font-semibold">Earn</span>
            <p className="text-[15px]">
              Use USG and sUSG in DeFi protocols to earn yield. Below is the list of known integrations accross DEXs, yield boosters, lending markets, and yield
              trading markets.
            </p>
          </div>
        </div>

        <div className="flex h-full w-full flex-col items-center gap-8 rounded-[10px] bg-overlay-panel backdrop-blur-[60px] xl:w-fit">
          <div className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+40px)_center] bg-no-repeat px-6 !text-[20px] !font-semibold italic">
            Points campaign
            <div className="ml-2 flex items-center justify-center rounded-[10px] bg-tonic px-2 py-0.5 !font-semibold !not-italic !text-black">Live</div>
          </div>

          <div className="mt-auto flex w-full items-center justify-center gap-1 p-2 md:gap-3">
            <div className="flex w-full min-w-24 flex-col items-center justify-center gap-1 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[60px] xl:min-w-48">
              <span className="text-xs text-subtitle">USG Balance</span>
              <span className="text-sm font-semibold">{formatBigInt(USGsUSGMetrics?.USGBalance || 0n, 18, 2)}</span>
            </div>

            <div className="flex w-full min-w-24 flex-col items-center justify-center gap-1 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[60px] xl:min-w-48">
              <span className="text-xs text-subtitle">sUSG Balance</span>
              <span className="text-sm font-semibold">{formatBigInt(USGsUSGMetrics?.sUSGBalance || 0n, 18, 2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex w-full items-end justify-between">
        <div className="flex w-full items-end justify-start gap-2">
          <div className="flex w-full max-w-80 flex-col items-center justify-center">
            <div className="mb-1 text-xs text-subtitle"> Search </div>
            <InputSearch
              placeholder=""
              className="flex w-full flex-col items-center justify-center"
              value={searchValue ?? ""}
              onChange={(e) => setSearchValue(e as string)}
            />
          </div>
        </div>
      </div>

      <ListProvider _headers={tgUsdEarnListHeaders} _rows={displayRows!} _listState={listeState}>
        <TgUsdMarketListInner />
      </ListProvider>
    </>
  )
}

export function TgUsdMarketListInner() {
  const { headers, listState, udpateSort } = useListContext()
  const { displayRows } = useTgUsdEarnContext()

  return (
    <>
      <div className="my-2 w-full rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      {displayRows?.map((item, index) => (
        <ListRow className="my-2" key={index} navigate={() => {}}>
          <div className="relative flex items-center gap-4">
            <TokenImage token={item?.asset as ExistingAsset} size={48} className="w-12 md:w-20" />

            <div className="flex flex-col leading-8">
              <span className="text-[14px] font-semibold md:text-[20px]">{item?.asset}</span>
              <BorderPanel className="flex items-center justify-center gap-2 !rounded-full bg-earn-action px-4 py-0.5 text-xs">
                <span>{item?.actionLabel}</span>
              </BorderPanel>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-3 py-2 text-xs">
            <TokenImage token={"CVX"} size={16} />
            <span>{item?.protocolName} </span>
          </div>

          <div className="flex w-full items-center gap-2">
            <div className="flex w-1/2 items-center justify-center gap-2">
              <div className="flex flex-row items-center justify-center text-center md:flex-col">
                <span className="flex items-center justify-center bg-button-active bg-clip-text text-[20px] font-semibold leading-4 text-transparent">
                  {item?.currentAPR}% <ListAprIndicator helpMessage="This is the APR" />
                </span>
                {item?.projectedAPR && (
                  <span className="whitespace-nowrap text-xs text-subtitle">
                    Proj: <span>{item?.projectedAPR}%</span>
                  </span>
                )}

                <span className="hidden text-xs md:flex">Up to 150.35% at x10</span>
              </div>
            </div>

            <div className="flex w-1/2 items-center justify-center text-[20px]">
              <div className="hidden xl:flex"> x{item?.bonusPts} </div>

              <div className="flex xl:hidden"> x{item?.bonusPts} Points </div>
            </div>
          </div>
        </ListRow>
      ))}
    </>
  )
}
