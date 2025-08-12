"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useRsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { doUnlock } from "./rstan_unlock_controller"
import { getCurrentBlock } from "@/services/service_rpc"

type RsTanUnlockContextProps = {
  children: ReactNode
}

type RsTanUnlockContextValues = {
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

export const RsTanUnlockContext = createContext<RsTanUnlockContextValues | undefined>(undefined)

export const RsTanUnlockProvider = ({ children }: RsTanUnlockContextProps) => {
  const { getWalletClient } = useWalletConnexionContext()

  const { loadData, lockData } = useRsTanContext()

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
    const walletClient = getWalletClient()

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
    const walletClient = getWalletClient()

    if (walletClient && unlockPositionInfo) {
      await doUnlock(unlockPositionInfo?.tokenId, walletClient, "rageQuit", claimAsSUSG)
      loadData()
      setIsLoading(false)
      setUnlockPosition("")
    } else {
      setIsLoading(false)
    }
  }

  const contextValue: RsTanUnlockContextValues = {
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

  return <RsTanUnlockContext.Provider value={contextValue}>{children}</RsTanUnlockContext.Provider>
}

export const useRsTanUnlockContext = () => {
  const context = useContext(RsTanUnlockContext)
  if (!context) {
    throw new Error("useRsTanUnlockContext must be used within a RsTanUnlockProvider")
  }
  return context
}
