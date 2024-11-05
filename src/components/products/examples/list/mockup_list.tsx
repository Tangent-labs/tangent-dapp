"use client"

import ListAPR from "@/components/design_system/list/list_apr"
import ListAsset from "@/components/design_system/list/list_asset"
import ListHeader from "@/components/design_system/list/list_header"
import ListIndicator from "@/components/design_system/list/list_indicator"
import ListRow from "@/components/design_system/list/list_row"
import { useListContext } from "@/components/design_system/list/list_context"
import { useNavigationContext } from "@/components/products/product_nav/navigation_context"

export default function MockUpList() {
  const { headers, listState, displayRows, udpateSort } = useListContext()
  const { navigate, currentProduct } = useNavigationContext()

  return (
    <div>
      {/* Render the list header */}
      <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      {/* Render the rows of data */}
      {displayRows.map((item, index) => (
        <ListRow key={index} navigate={() => navigate({ productTo: currentProduct, featureTo: "deposit", itemSlug: item.token })}>
          <ListAsset name={item.name} token={item.token} assetsEarned={[{ token: "WETH" }, { token: "USDC" }]} />
          <ListAPR apr={item.apr.current} projectedApr={item.apr.projected} harvestHelpMessage="Rewards has not been harvested yet." />
          <>
            {item.indicators.map((i) => (
              <ListIndicator info={i.label} value={i.value} key={i.key} valueFirst={false} />
            ))}
          </>
        </ListRow>
      ))}
    </div>
  )
}
