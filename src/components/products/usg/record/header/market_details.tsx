"use client"

import { useState } from "react"
import USGMarketInfo from "../usg_market_info"
import { useUSGRecordContext } from "../usg_record_context"
import { MarketDetailsInfos } from "./components/market_details_info"
import { SlidingTabs } from "../../airdrop/tasks/components/SlidingTabs"
import { MarketDetailsContracts } from "./components/market_details_contracts"

export const MarketDetails = () => {
  const { marketData, marketContracts } = useUSGRecordContext()

  const [selectedFeature, setSelectedFeature] = useState<string>("Market info")

  return (
    <div className="my-2 hidden w-full md:flex md:flex-col">
      <SlidingTabs labels={["Market info", "Collateral info", "Contracts"]} value={selectedFeature} onSwitchTab={(e: string) => setSelectedFeature(e)} />

      {selectedFeature === "Market info" && <USGMarketInfo />}

      {selectedFeature === "Collateral info" && marketData && <MarketDetailsInfos marketData={marketData} />}

      {selectedFeature === "Contracts" && <MarketDetailsContracts marketContracts={marketContracts} />}
    </div>
  )
}
