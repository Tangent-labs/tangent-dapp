"use client"

import { useEffect, useState } from "react"
import { getSUsgShares } from "./claim/rstan_claim_controller"

// What the user actually receives for a USG reward : the USG figure, or its sUSG share equivalent
// when claiming as sUSG (1 sUSG is worth more than 1 USG)
export const useSUsgReceived = (usgAmount: bigint | undefined, claimAsSUSG: boolean) => {
  const [shares, setShares] = useState<bigint | undefined>()

  useEffect(() => {
    setShares(undefined)

    if (!claimAsSUSG || !usgAmount) return

    getSUsgShares(usgAmount)
      .then(setShares)
      .catch((error) => {
        // Fall back to showing the USG figure rather than a wrong one
        console.error("Failed to convert the claimable amount to sUSG shares:", error)
      })
  }, [claimAsSUSG, usgAmount])

  return (claimAsSUSG && shares) || usgAmount || 0n
}
