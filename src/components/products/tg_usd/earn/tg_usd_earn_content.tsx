"use client"

import Image from "next/image"
import { ExistingAsset, ListState } from "@/types"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGEarnContext } from "./tg_usd_earn_context"
import ListRow from "@/components/design_system/list/list_row"
import { tgUsdEarnListHeaders } from "./tg_usd_earn_controller"
import ListHeader from "@/components/design_system/list/list_header"
import InputSearch from "@/components/design_system/inputs/input_search"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { cn } from "@/lib/utils"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "assets",
    direction: "asc",
  },
}

export const USGEarnContent = () => {
  const { searchValue, setSearchValue, displayRows, USGsUSGMetrics } = useUSGEarnContext()

  return (
    <>
      <div className="flex items-stretch justify-between gap-6">
        <div className="hidden w-1/2 rounded-[10px] bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={160} width={160} src="/medias/tokens/tgUSD_header.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Earn</span>
            <p className="font-gilroy text-[15px]">
              Use USG and sUSG in DeFi protocols to earn yield. Below is the list of known integrations accross DEXs, yield boosters, lending markets, and yield
              trading markets.
            </p>
          </div>
        </div>

        <div className="hidden h-auto w-full flex-col items-center gap-3 rounded-[10px] bg-overlay-panel backdrop-blur-[60px] md:flex xl:w-1/2">
          <div
            style={{ fontSize: "20px", lineHeight: "20px" }}
            className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+120px)_center] bg-no-repeat px-6 !font-semibold italic"
          >
            Points campaign
            <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
          </div>

          <div className="mt-auto flex w-full items-center justify-center gap-3 p-3">
            <div className="flex w-full min-w-24 flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px] xl:min-w-48">
              <span className="text-xs text-subtitle">USG Balance</span>
              <span className="text-sm font-semibold">{formatBigInt(USGsUSGMetrics?.USGBalance || 0n, 18, 2)}</span>
            </div>

            <div className="flex w-full min-w-24 flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px] xl:min-w-48">
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
        <USGMEarnListInner />
      </ListProvider>
    </>
  )
}

export function USGMEarnListInner() {
  const { headers, listState, udpateSort } = useListContext()

  const { displayRows, isLoading } = useUSGEarnContext()

  return (
    <>
      <div className="my-2 w-full rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      {displayRows?.map((item, index) => (
        <ListRow className={cn("my-2", isLoading ? "shimmer" : "")} key={index}>
          <div className="relative flex items-center gap-4">
            <TokenImage token={item?.asset as ExistingAsset} size={48} className="w-12 md:w-20" />

            <div className="flex flex-col leading-8">
              <span className="text-sm font-semibold md:text-xl">{item?.asset}</span>
              <BorderPanel className="flex items-center justify-center gap-2 !rounded-full bg-earn-action px-4 py-0.5 text-xs">
                <span>{item?.actionLabel}</span>
              </BorderPanel>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-full bg-overlay-panel px-3 py-2">
            {item.protocolName === "Curve" && (
              <div className="flex items-center justify-center gap-2 px-3 py-0.5 text-sm">
                <TokenImage token={"CRV"} size={16} />
                <span>Curve</span>
              </div>
            )}
            {item.protocolName === "Convex" && (
              <div className="flex items-center justify-center gap-2 px-3 py-0.5 text-sm">
                <TokenImage token={"CVX"} size={16} />
                <span>Convex</span>
              </div>
            )}
            {item.protocolName === "StakeDAO" && (
              <div className="flex items-center justify-center gap-2 px-3 py-0.5 text-sm">
                <TokenImage token={"SDT"} size={16} />
                <span>Stake DAO</span>
              </div>
            )}
          </div>

          <div className="flex w-full items-center gap-2">
            <div className="flex w-1/2 items-center justify-center gap-2">
              <div className="flex flex-row items-center justify-center gap-2 text-center md:flex-col md:gap-0">
                <span className="flex items-center justify-center bg-button-active bg-clip-text text-sm font-semibold leading-4 text-transparent md:text-xl">
                  {item?.currentAPR.toFixed(2)}%
                </span>
                <span className="whitespace-nowrap text-xs text-subtitle">
                  {!!item?.projectedAPR && item?.projectedAPR !== 0 ? <>Proj: {item?.projectedAPR.toFixed(2)}%</> : <>Proj: 0%</>}
                </span>

                <span className="hidden text-xs md:flex">Up to {(item?.projectedAPR * 10).toFixed(2)}% at x10</span>
              </div>
            </div>

            <div className="flex w-1/2 items-center justify-center text-xl">
              <div className="hidden xl:flex"> x{item?.bonusPts} </div>

              <div className="flex text-xs md:text-sm xl:hidden"> x{item?.bonusPts} Points </div>
            </div>
          </div>
        </ListRow>
      ))}
    </>
  )
}
