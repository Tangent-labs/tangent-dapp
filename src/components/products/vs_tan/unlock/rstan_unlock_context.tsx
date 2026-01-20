"use client"

import { doUnlock } from "./rstan_unlock_controller"
import { LockPosition } from "../../usg/usg_type"
import { getCurrentBlock } from "@/services/service_rpc"
import { useVsTanContext } from "../rstan_layout_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

type VsTanUnlockContextProps = {
  children: ReactNode
}

type VsTanUnlockContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  unlockPositionInfo: LockPosition | undefined

  unlockPosition: string
  setUnlockPosition: (arg: string) => void

  actionUnlock: () => void

  actionRageQuit: () => void

  tanReceived: bigint | undefined

  claimAsSUSG: boolean
  setClaimAsSUSG: (arg: boolean) => void
}

export const VsTanUnlockContext = createContext<VsTanUnlockContextValues | undefined>(undefined)

export const VsTanUnlockProvider = ({ children }: VsTanUnlockContextProps) => {
  const { walletClient } = useWalletConnexionContext()

  const { loadData, lockData } = useVsTanContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [claimAsSUSG, setClaimAsSUSG] = useState<boolean>(false)

  const [tanReceived, setTanReceived] = useState<bigint | undefined>(undefined)

  const [unlockPosition, setUnlockPosition] = useState<string>("")

  const unlockPositionInfo = useMemo(() => {
    const pos = lockData?.positions.find((position) => position?.tokenId.toString() === unlockPosition)

    return pos
  }, [unlockPosition])

  useEffect(() => {
    const calculateTanReceived = async () => {
      try {
        const endLockTime = new Date(Number(unlockPositionInfo?.endLockTime) * 1000)

        const currentBlock = await getCurrentBlock()

        const currentTime = new Date(Number(currentBlock.timestamp) * 1000)
        const totalDurationLeft = endLockTime.getTime() - currentTime.getTime()
        const thirteenWeeksInMilliseconds = 13 * 7 * 24 * 60 * 60 * 1000
        const penalty = Math.max(0, Math.min(1, totalDurationLeft / thirteenWeeksInMilliseconds))
        const maxAmount = unlockPositionInfo?.amount || BigInt(0)
        const totalTanReceived = (maxAmount * BigInt(Math.round((1 - penalty) * 1000000))) / BigInt(1000000)

        setTanReceived(totalTanReceived)
      } catch (error) {
        console.error("Error calculating tanReceived:", error)
        setTanReceived(0n)
      }
    }

    if (unlockPositionInfo) {
      calculateTanReceived()
    }
  }, [unlockPositionInfo])

  const actionUnlock = async () => {
    setIsLoading(true)

    if (walletClient && unlockPositionInfo) {
      await doUnlock(unlockPositionInfo?.tokenId, walletClient, "unlock", claimAsSUSG)
      loadData()
      setIsLoading(false)
      setUnlockPosition("")
    } else {
      setIsLoading(false)
    }
  }

  const actionRageQuit = async () => {
    setIsLoading(true)

    if (walletClient && unlockPositionInfo) {
      await doUnlock(unlockPositionInfo?.tokenId, walletClient, "rageQuit", claimAsSUSG)
      loadData()
      setIsLoading(false)
      setUnlockPosition("")
    } else {
      setIsLoading(false)
    }
  }

  const contextValue: VsTanUnlockContextValues = {
    isLoading,
    setIsLoading,
    unlockPosition,
    setUnlockPosition,
    unlockPositionInfo,
    actionUnlock,
    actionRageQuit,
    tanReceived,
    claimAsSUSG,
    setClaimAsSUSG,
  }

  return <VsTanUnlockContext.Provider value={contextValue}>{children}</VsTanUnlockContext.Provider>
}

export const useVsTanUnlockContext = () => {
  const context = useContext(VsTanUnlockContext)
  if (!context) {
    throw new Error("useVsTanUnlockContext must be used within a VsTanUnlockProvider")
  }
  return context
}
