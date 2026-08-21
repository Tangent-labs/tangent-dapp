"use client"

import { GraphUSGsUSG } from "./components/GraphUSGsUSG"
import { useUSGDashboardContext } from "./dashboard_context"
import { GraphGlobalTVL } from "./components/GraphGlobalTVL"
import { GraphTokenPrice } from "./components/GraphTokenPrice"
import { useRootContext } from "@/components/products/root/root_context"
import { GraphProtocolRevenues } from "./components/GraphProtocolRevenues"
import { GraphCollateralsAndDebts } from "./components/GraphCollateralsAndDebts"

export const USGDashboardContent = () => {
  const { userData, marketTVLMaxValue, selectedRevenueTab, totalRevenues, protocolRevenues, fetchRevenues } = useUSGDashboardContext()

  const {
    tvl,
    priceHistory,
    tvlSelectedTab,
    USGCurrentSupply,
    sUSGCurrentSupply,
    priceSelectedTabs,
    protocolCurrentTVL,
    USGsUSGTotalSupplyData,
    totalSupplySelectedTab,
    fetchTVLData,
    fetchTotalSupplyData,
    fetchPriceHistoryData,
  } = useRootContext()

  return (
    <div className="flex w-full flex-col items-start justify-start gap-5">
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

      <div className="flex w-full flex-col gap-5 lg:flex-row">
        {/* USG Collaterals & Market debts */}
        {userData && <GraphCollateralsAndDebts userData={userData} marketTVLMaxValue={marketTVLMaxValue} />}

        {/* PROTOCOL REVENUES */}
        <GraphProtocolRevenues
          totalRevenues={totalRevenues}
          protocolRevenues={protocolRevenues}
          selectedRevenueTab={selectedRevenueTab}
          fetchRevenues={fetchRevenues}
        />
      </div>
    </div>
  )
}
