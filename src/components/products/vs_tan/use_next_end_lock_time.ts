"use client"

import { useEffect, useState } from "react"
import { getCurrentBlock } from "@/services/service_rpc"
import { EPOCH_DURATION, LOCK_DURATION_IN_EPOCHS } from "./rs_tan_repository"

/**
 * End of the epoch a lock created or extended right now would land on, plus the chain clock it was
 * read from. Both the lock form and the positions list need it, and it depends only on where the
 * chain sits in the epoch — never on the form — so it refreshes with the rest of the on chain data.
 *
 * The chain timestamp is returned alongside because a local fork can run days behind the wall clock,
 * and the contract compares against block.timestamp, not Date.now().
 *
 * Note : vsTAN exposes nextEndLockTime(), but it is absent from currently deployed contracts, so the
 * epoch is computed here instead.
 */
export const useNextEndLockTime = (refreshKey?: unknown) => {
  const [nextEndLockTime, setNextEndLockTime] = useState<string | null>(null)

  const [chainTimestamp, setChainTimestamp] = useState<bigint | undefined>()

  useEffect(() => {
    const computeEndLockTime = async () => {
      try {
        const currentBlock = await getCurrentBlock()

        const weekId = currentBlock.timestamp / EPOCH_DURATION
        const adjustedTime = (weekId + LOCK_DURATION_IN_EPOCHS) * EPOCH_DURATION

        setChainTimestamp(currentBlock.timestamp)
        setNextEndLockTime(adjustedTime.toString())
      } catch (error) {
        console.error("Failed to compute the next end lock time:", error)
      }
    }

    computeEndLockTime()
  }, [refreshKey])

  return { nextEndLockTime, chainTimestamp }
}
