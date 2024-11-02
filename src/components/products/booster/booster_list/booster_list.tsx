"use client"

import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { useBoosterListContext } from "./booster_list_context"
import { boosterListHeaders } from "./booster_list_controller"
import ListHeader from "@/components/design_system/list/list_header"
import ListRow from "@/components/design_system/list/list_row"
import ListAsset from "@/components/design_system/list/list_asset"
import ListAPR from "@/components/design_system/list/list_apr"
import ListIndicator from "@/components/design_system/list/list_indicator"
import { ListState } from "@/types"
import { useNavigationContext } from "../../product_nav/navigation_context"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "strategy",
    direction: "asc",
  },
}

export default function BoosterList() {
  const { displayRows } = useBoosterListContext()
  return (
    <ListProvider _headers={boosterListHeaders} _rows={displayRows!} _listState={listeState}>
      <div>
        <BoosterListInner />
      </div>
    </ListProvider>
  )
}

function BoosterListInner() {
  const { headers, listState, udpateSort } = useListContext()
  const { displayRows } = useBoosterListContext()
  const { navigate } = useNavigationContext()

  return (
    <>
      {/* Render the list header */}
      <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      {/* Render the rows of data */}
      {displayRows?.map((item, index) => (
        <>
          <ListRow key={index} navigate={() => navigate({ productTo: "booster", featureTo: "deposit", itemSlug: item.token })}>
            <ListAsset name={item.name} token={item.token} assetsEarned={[]} />
            <ListAPR apr={item.apr.current} projectedApr={item.apr.projected} harvestHelpMessage="Rewards has not been harvested yet." />
            <>
              {item.indicators.map((i) => (
                <ListIndicator info={i.label} value={i.value} key={i.key} valueFirst={false} />
              ))}
            </>
          </ListRow>
        </>
      ))}
    </>
  )
}
