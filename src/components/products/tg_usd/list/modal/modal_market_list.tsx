"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { ListHeaderData, ListState } from "@/types"
import ListRow from "@/components/design_system/list/list_row"
import ListAsset from "@/components/design_system/list/list_asset"
import ListHeader from "@/components/design_system/list/list_header"
import { useUSGMaketListContext } from "../tg_usd_market_list_context"
import InputSearch from "@/components/design_system/inputs/input_search"
import MarketListAPR from "@/components/design_system/list/market_list_apr"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import InputSelect from "@/components/design_system/inputs/input_select"
import { marketOptions, protocolOptions, USGMarketModalListHeaders } from "../tg_usd_market_controller"

const MarketListSelectTemplate = (option: { label: string; value: string }) => {
  return <span className="flex w-full cursor-pointer items-center rounded-[10px] px-3 text-sm font-semibold text-white hover:bg-white/10">{option?.label}</span>
}

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "collateral",
    direction: "asc",
  },
}

export default function USGModalMarketList() {
  const { displayRows, searchValue, setSearchValue, sortMarketList, marketType, setMarketType, protocol, setProtocol } = useUSGMaketListContext()

  return (
    <div className="p-4">
      <div className="flex w-full flex-col-reverse items-center justify-between gap-2 md:flex-row">
        <div className="flex w-full flex-col items-center justify-center md:w-fit">
          <div className="mb-1 text-xs text-subtitle"> Search </div>
          <InputSearch
            placeholder=""
            className="flex w-full flex-col items-center justify-center"
            value={searchValue ?? ""}
            onChange={(e) => setSearchValue(e as string)}
          />
        </div>

        <div className="flex items-center justify-center gap-2">
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
      <ListProvider customSort={sortMarketList} _headers={USGMarketModalListHeaders} _rows={displayRows!} _listState={listeState}>
        <USGModalMarketListInner />
      </ListProvider>
    </div>
  )
}

const ModalMarketListRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex w-1/2 items-center justify-start">{children?.at(0)}</div>
      <div className="flex w-1/2 items-center justify-center md:w-1/4">{children?.at(1)}</div>
      <div className="hidden w-1/4 items-center justify-center md:flex">{children?.at(2)}</div>
    </div>
  )
}

export function USGModalMarketListInner() {
  const { headers, listState, udpateSort } = useListContext()
  const { displayRows, marketData } = useUSGMaketListContext()
  const router = useRouter()

  return (
    <>
      <div className="mt-3 rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ListHeader rowDisposition={ModalMarketListRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      <div className="mt-2 max-h-[476px] overflow-y-auto">
        {displayRows?.map((item, index) => (
          <ListRow
            rowDisposition={ModalMarketListRowDisposition}
            className={cn("my-1", !!marketData.length && !!displayRows ? "" : "shimmer")}
            key={index}
            // Hack for Pendle markets
            navigate={() => router.push(item.token.trim().replaceAll("/", "~").replaceAll(" ", "_"))}
          >
            <ListAsset name={item.name} token={item.token} marketData={marketData.find((el) => el.marketAddress === item.address)} assetsEarned={[]} />
            <MarketListAPR currentAPRDetails={item.currentAPRDetails} apr={item.apr.current} projectedApr={item.apr.projected} />

            <span className="hidden items-center justify-center gap-2 md:flex">
              <span className={cn("flex text-xs text-subtitle md:text-xl xl:hidden")}>{item.indicators[0]?.label}</span>
              <span className="text-xs md:text-xl">{item.indicators[0]?.value}</span>
            </span>

            {item.userHasDeposited && (
              <div className="absolute -right-4 top-0 flex h-full w-2 items-center justify-center">
                <div className="h-10 w-2 rounded-full bg-tonic"></div>
              </div>
            )}
          </ListRow>
        ))}
      </div>
    </>
  )
}
