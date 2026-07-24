"use client"

import { GraphCollateralsAndDebts } from "./components/GraphCollateralsAndDebts"
import { useUSGDashboardContext } from "./dashboard_context"
import { useRootContext } from "@/components/products/root/root_context"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { GraphGlobalTVL } from "./components/GraphGlobalTVL"
import { GraphUSGsUSG } from "./components/GraphUSGsUSG"
import { GraphTokenPrice } from "./components/GraphTokenPrice"

export const USGDashboardContent = () => {
  const { userData, marketTVLMaxValue } = useUSGDashboardContext()

  const {
    tvl,
    protocolCurrentTVL,
    tvlSelectedTab,
    USGCurrentSupply,
    sUSGCurrentSupply,
    totalSupplySelectedTab,
    USGsUSGTotalSupplyData,
    fetchTVLData,
    fetchTotalSupplyData,
    priceSelectedTabs,
    priceHistory,
    fetchPriceHistoryData,
  } = useRootContext()

  return (
    <div className="flex w-full flex-col items-start justify-start gap-5">
      {/* POINTS CAMPAIGN COMPONENT */}

      <ReliefCard className="w-full">
        <div
          style={{ fontSize: "20px", lineHeight: "20px" }}
          className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/fulltan.png')] bg-[size:30%] bg-[position:calc(100%)_bottom] bg-no-repeat px-6 !font-semibold italic"
        >
          Points campaign
          <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
        </div>
      </ReliefCard>

      <div className="flex w-full flex-col gap-5 lg:flex-row">
        <GraphTokenPrice
          token="USG"
          title="USG"
          selectedTab={priceSelectedTabs.USG}
          data={priceHistory.USG}
          fetchPriceHistoryData={fetchPriceHistoryData}
          accentColor="#0075FF"
          gradientStart="#0075FF"
        />

        <GraphTokenPrice
          token="sUSG"
          title="sUSG"
          selectedTab={priceSelectedTabs.sUSG}
          data={priceHistory.sUSG}
          fetchPriceHistoryData={fetchPriceHistoryData}
          accentColor="#A3FF12"
          gradientStart="#D9FB0B"
        />
      </div>

      <div className="flex w-full flex-col gap-5 lg:flex-row">
        {/* USG & sUSG TOTAL SUPPLY GRAPH */}
        <GraphUSGsUSG
          fetchTotalSupplyData={fetchTotalSupplyData}
          USGCurrentSupply={USGCurrentSupply}
          sUSGCurrentSupply={sUSGCurrentSupply}
          USGsUSGTotalSupplyData={USGsUSGTotalSupplyData}
          totalSupplySelectedTab={totalSupplySelectedTab}
        />

        {/* TVL GRAPH */}
        <GraphGlobalTVL fetchTVLData={fetchTVLData} tvlSelectedTab={tvlSelectedTab} protocolCurrentTVL={protocolCurrentTVL} tvl={tvl} />
      </div>

      {/* USG Collaterals & Market debts */}
      {userData && <GraphCollateralsAndDebts userData={userData} marketTVLMaxValue={marketTVLMaxValue} />}
    </div>
  )
}
