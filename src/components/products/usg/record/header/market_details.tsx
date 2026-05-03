"use client"

import { useState } from "react"
import { USGMarketInfo } from "../usg_market_info"
import { useUSGRecordContext } from "../usg_record_context"
import { MarketDetailsInfos } from "./components/market_details_info"
import { SlidingTabs } from "../../airdrop/tasks/components/SlidingTabs"

export const MarketDetails = () => {
  const { marketData } = useUSGRecordContext()

  const [selectedFeature, setSelectedFeature] = useState<string>("Market info")

  return (
    <div className="hidden w-full md:flex md:flex-col">
      <SlidingTabs className="mb-3" labels={["Market info", "Collateral info"]} value={selectedFeature} onSwitchTab={(e: string) => setSelectedFeature(e)} />

      {selectedFeature === "Market info" && <USGMarketInfo />}

      {selectedFeature === "Collateral info" && marketData && <MarketDetailsInfos marketData={marketData} />}
    </div>
  )
}
