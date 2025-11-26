"use client"

import { useState } from "react"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { MarketDetailsInfos } from "./components/market_details_info"
import { SlidingTabs } from "../../airdrop/tasks/components/SlidingTabs"
import MarketDetailsParameters from "./components/market_details_parameters"
import { MarketDetailsContracts } from "./components/market_details_contracts"

export const MarketDetails = () => {
  const { marketData, marketContracts } = useUSGRecordContext()

  const [selectedFeature, setSelectedFeature] = useState<string>("Parameters")

  return (
    <div className="my-2 hidden w-full md:flex md:flex-col">
      <SlidingTabs labels={["Parameters", "Info", "Contracts"]} value={selectedFeature} onSwitchTab={(e: string) => setSelectedFeature(e)} />

      {selectedFeature === "Parameters" && <MarketDetailsParameters />}

      {selectedFeature === "Info" && marketData && <MarketDetailsInfos marketData={marketData} />}

      {selectedFeature === "Contracts" && <MarketDetailsContracts marketContracts={marketContracts} />}
    </div>
  )
}
