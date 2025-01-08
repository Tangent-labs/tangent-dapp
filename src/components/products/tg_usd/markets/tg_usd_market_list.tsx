"use client"

import React from "react"
import { useTgUsdMaketListContext } from "./tg_usd_market_list_context"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { tgUsdListHeaders } from "./tg_usd_market_controller"
import { ExistingAsset, ListState } from "@/types"
import { useNavigationContext } from "../../product_nav/navigation_context"
import ListHeader from "@/components/design_system/list/list_header"
import ListRow from "@/components/design_system/list/list_row"
import ListAsset from "@/components/design_system/list/list_asset"
import ListAPR from "@/components/design_system/list/list_apr"
import ListIndicator from "@/components/design_system/list/list_indicator"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import { formatDollar, formatNumber, formatPercent } from "@/lib/number_formatter"
import TokenImage from "@/components/design_system/structure/token_image"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "collateral",
    direction: "asc",
  },
}

export default function TgUsdMarketList() {
  const { displayRows, globalData } = useTgUsdMaketListContext()
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IndicatorCards
            indicators={[
              { title: "tgUsd ", value: formatDollar(globalData.tgUsdPrice, 5) },
              { title: "Supply", value: formatNumber(globalData.tgUsdsupply, 0) },
            ]}
          >
            <TokenImage token={"tgUSD" as ExistingAsset} className="" size={32} />
          </IndicatorCards>
          <IndicatorCards
            indicators={[
              { title: "sgUsd ", value: formatDollar(globalData.tgUsdPrice, 5) },
              { title: "Supply", value: formatNumber(globalData.tgUsdsupply, 0) },
              { title: "APY", value: formatPercent(globalData.APY, 2) },
            ]}
          >
            <TokenImage token={"sgUSD" as ExistingAsset} className="" size={32} />
          </IndicatorCards>
        </div>
        <div className="flex items-center gap-2">
          <IndicatorCards indicators={[{ title: "Global CR ", value: formatPercent(globalData.globalCr, 2) }]} />
          <IndicatorCards indicators={[{ title: "Global TVL ", value: formatNumber(globalData.GlobalTvl, 0) }]} />
        </div>
      </div>

      <ListProvider _headers={tgUsdListHeaders} _rows={displayRows!} _listState={listeState}>
        <div>
          <TgUsdMarketListInner />
        </div>
      </ListProvider>
    </>
  )
}

export function TgUsdMarketListInner() {
  const { headers, listState, udpateSort } = useListContext()
  const { displayRows } = useTgUsdMaketListContext()
  const { navigate } = useNavigationContext()

  return (
    <>
      {/* Render the list header */}
      <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      {/* Render the rows of data */}
      {displayRows?.map((item, index) => (
        <ListRow key={index} navigate={() => navigate({ productTo: "tgUsd", featureTo: "deposit", itemSlug: item.token })}>
          <ListAsset name={item.name} token={item.token} assetsEarned={[]} />
          <ListAPR apr={item.apr.current} projectedApr={item.apr.projected} />
          <>
            {item.indicators.map((i) => (
              <ListIndicator info={i.label} value={i.value} key={i.key} valueFirst={false} />
            ))}
          </>
        </ListRow>
      ))}
    </>
  )
}
