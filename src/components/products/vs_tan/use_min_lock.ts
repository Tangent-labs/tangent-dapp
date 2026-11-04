"use client"

import { useEffect, useState } from "react"
import { getPublicClient } from "@/services/service_rpc"
import { VSTAN_CONTRACT } from "./rs_tan_repository"

// vsTAN.minLock() : the minimum a new position has to reach. createLock enforces it, and split
// enforces it on BOTH sides of the split. Not part of the LockUI view, and not in the generated
// VsTAN ABI either, so it is read on its own.
const minLockAbi = [{ inputs: [], name: "minLock", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" }] as const

export const getMinLock = async (): Promise<bigint> => {
  const publicClient = getPublicClient()

  return await publicClient.readContract({ address: VSTAN_CONTRACT.VSTAN, abi: minLockAbi, functionName: "minLock" })
}

export const useMinLock = () => {
  const [minLock, setMinLock] = useState<bigint | undefined>()

  useEffect(() => {
    getMinLock()
      .then(setMinLock)
      .catch((error) => {
        // Without it the minimum simply isn't enforced client side, the contract still rejects
        console.error("Failed to read vsTAN minLock:", error)
      })
  }, [])

  return minLock
}
