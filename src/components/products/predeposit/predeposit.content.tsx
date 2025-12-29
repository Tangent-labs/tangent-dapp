"use client"

import { usePredepositContext } from "./predeposit.context"
import { PredepositFAQ } from "./components/predeposit-faq"
import { PredepositHeading } from "./components/predeposit-heading"
import { PredepositDepositSection } from "./components/predeposit-deposit-section"

export const PredepositContent = () => {
  const { predepositStatus } = usePredepositContext()

  return (
    <div className="mb-6 flex flex-col items-start justify-center">
      <PredepositHeading
        USGUSDCAccumulatedBalance={predepositStatus?.USGUSDCData.USGUSDCAccumulatedBalance || 0n}
        USGfrxUSDAccumulatedBalance={predepositStatus?.USGfrxUSDData.USGfrxUSDAccumulatedBalance || 0n}
        accumulatedBalance={(predepositStatus?.USGUSDCData.USGUSDCAccumulatedTotal || 0n) + (predepositStatus?.USGfrxUSDData.USGfrxUSDAccumulatedTotal || 0n)}
      />

      <PredepositDepositSection
        totalDeposited={(predepositStatus?.USGUSDCData.USGUSDCAccumulatedTotal || 0n) + (predepositStatus?.USGfrxUSDData.USGfrxUSDAccumulatedTotal || 0n)}
        usgUsdcDeposited={predepositStatus?.USGUSDCData.USGUSDCAccumulatedTotal || 0n}
        usdFrxUSDDeposited={predepositStatus?.USGfrxUSDData.USGfrxUSDAccumulatedTotal || 0n}
      />

      <PredepositFAQ />
    </div>
  )
}
