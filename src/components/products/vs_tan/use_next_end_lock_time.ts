"use client"

import { useEffect, useState } from "react"
import { getCurrentBlock } from "@/services/service_rpc"
import { EPOCH_DURATION, LOCK_DURATION_IN_EPOCHS } from "./rs_tan_repository"

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
