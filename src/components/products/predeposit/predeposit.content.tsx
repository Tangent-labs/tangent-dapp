"use client"

import { PredepositDepositSection } from "./components/predeposit-deposit-section"
import { PredepositHeading } from "./components/predeposit-heading"

export const PredepositContent = () => {
  return (
    <div className="flex flex-col items-start justify-center">
      <PredepositHeading />
      <PredepositDepositSection
        totalDeposited={1230490000000000000000000n}
        usdFrxUSDDeposited={800000000000000000000000n}
        usgUsdcDeposited={1200000000000000000000000n}
      />
    </div>
  )
}
