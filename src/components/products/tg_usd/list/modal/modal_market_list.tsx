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

export const USGMarketModalListHeaders: ListHeaderData[] = [
  { label: "LP", key: "lp", sort: null },
  {
    label: "APR",
    key: "apr",
    indicator: "vAPR of the collateral",
    sort: "sort",
  },
  {
    label: "Borrow Rate",
    key: "borrowRate",
    indicator: "Interest rate that borrowers pay on their outstanding debt.",
    sort: "sort",
  },
]

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "collateral",
    direction: "asc",
  },
}

export default function USGModalMarketList() {
  const { displayRows, searchValue, setSearchValue, sortMarketList } = useUSGMaketListContext()

  return (
    <div className="p-4">
      <div className="flex w-1/2 flex-col items-center justify-center">
        <div className="mb-1 text-xs text-subtitle"> Search </div>
        <InputSearch
          placeholder=""
          className="flex w-full flex-col items-center justify-center"
          value={searchValue ?? ""}
          onChange={(e) => setSearchValue(e as string)}
        />
      </div>

      <ListProvider customSort={sortMarketList} _headers={USGMarketModalListHeaders} _rows={displayRows!} _listState={listeState}>
        <USGModalMarketListInner />
      </ListProvider>
    </div>
  )
}

const ModalMarketListRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="flex items-center justify-start xl:w-1/2">{children?.at(0)}</div>
      <div className="flex items-center justify-center xl:w-1/4">{children?.at(1)}</div>
      <div className="flex items-center justify-center xl:w-1/4">{children?.at(2)}</div>
    </div>
  )
}

export function USGModalMarketListInner() {
  const { headers, listState, udpateSort } = useListContext()
  const { displayRows, marketData } = useUSGMaketListContext()
  const router = useRouter()

  return (
    <>
      <ListHeader rowDisposition={ModalMarketListRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      <div className="max-h-[75vh] overflow-y-auto p-4">
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

            <span className="flex items-center justify-center gap-2">
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
