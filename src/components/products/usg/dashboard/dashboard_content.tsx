"use client"

import { cn } from "@/lib/utils"
import { GraphMarketDebts } from "./components/GraphMarketDebts"
import { GraphUSGCollaterals } from "./components/GraphUSGCollaterals"
import { useUSGDashboardContext } from "./dashboard_context"
import { formatDollar, formatMillions } from "@/lib/number_formatter"
import { useRootContext } from "@/components/products/root/root_context"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import { GraphGlobalTVL } from "./components/GraphGlobalTVL"
import { GraphUSGsUSG } from "./components/GraphUSGsUSG"

export const USGDashboardContent = () => {
  const { globalData, userData, marketDebtMaxValue, marketTVLMaxValue } = useUSGDashboardContext()

  const {
    tvl,
    protocolCurrentTVL,
    sUSGCurrentAPY,
    tvlSelectedTab,
    USGCurrentSupply,
    sUSGCurrentSupply,
    totalSupplySelectedTab,
    USGsUSGTotalSupplyData,
    fetchTVLData,
    fetchTotalSupplyData,
  } = useRootContext()

  return (
    <div className="flex w-full flex-col items-start justify-start gap-3">
      {/* POINTS CAMPAIGN COMPONENT */}
      <div className="flex h-full w-full flex-col items-start justify-start gap-8 rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ReliefCard className="w-full">
          <div
            style={{ fontSize: "20px", lineHeight: "20px" }}
            className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/fulltan.png')] bg-[size:30%] bg-[position:calc(100%)_bottom] bg-no-repeat px-6 !font-semibold italic"
          >
            Points campaign
            <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
          </div>
        </ReliefCard>
      </div>

      {/* INFOS USG & sUSG */}
      <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:justify-start">
        <IndicatorCards
          className={cn(globalData.USGPrice === "-" ? "shimmer" : "", "flex w-full items-center justify-around")}
          indicators={[
            { title: "USG", value: formatDollar(globalData.USGPrice, 4) },
            { title: "Supply", value: formatMillions(globalData.USGSupply) },
          ]}
        >
          <TokenImage token="USG" className="h-8 w-8" size={32} />
        </IndicatorCards>

        <IndicatorCards
          className={cn(globalData.sUSGPrice === "-" ? "shimmer" : "", "flex w-full items-center justify-around")}
          indicators={[
            { title: "sUSG ", value: formatDollar(globalData.sUSGPrice, 4) },
            { title: "Supply", value: formatMillions(globalData.sUSGSupply) },
            { title: "APY", value: sUSGCurrentAPY.toFixed(2) + "%" },
          ]}
        >
          <TokenImage token="sUSG" className="h-8 w-8" size={32} />
        </IndicatorCards>
      </div>

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

      {/* USG Collaterals & Market debts */}
      <div className="flex w-full flex-col items-start justify-start gap-3 md:flex-row">
        {userData && (
          <>
            <GraphUSGCollaterals userData={userData} marketTVLMaxValue={marketTVLMaxValue} />

            <GraphMarketDebts userData={userData} marketDebtMaxValue={marketDebtMaxValue} />
          </>
        )}
      </div>
    </div>
  )
}
