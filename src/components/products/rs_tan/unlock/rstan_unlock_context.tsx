"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useRsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { doUnlock } from "./rstan_unlock_controller"
import { getPublicClient } from "@/services/service_rpc"

type RsTanUnlockContextProps = {
  children: ReactNode
}

type RsTanUnlockContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  depositPositionInfo: LockPosition | undefined

  depositPosition: string
  setDepositPosition: (arg: string) => void

  actionUnlock: () => void

  actionRageQuit: () => void

  tanReceived: bigint | undefined
}

export const RsTanUnlockContext = createContext<RsTanUnlockContextValues | undefined>(undefined)

export const RsTanUnlockProvider = ({ children }: RsTanUnlockContextProps) => {
  const { getWalletClient } = useWalletConnexionContext()

  const { loadData, lockData } = useRsTanContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [tanReceived, setTanReceived] = useState<bigint | undefined>(undefined)

  const [depositPosition, setDepositPosition] = useState<string>("")

  const depositPositionInfo = useMemo(() => {
    const pos = lockData?.positions.find((position) => position?.tokenId.toString() === depositPosition)

    return pos
  }, [depositPosition])

  useEffect(() => {
    const calculateTanReceived = async () => {
      try {
        const endLockTime = new Date(Number(depositPositionInfo?.endLockTime) * 1000)
        const publicClient = await getPublicClient()
        const currentBlockNumber = await publicClient.getBlockNumber()
        const block = await publicClient.getBlock({ blockNumber: currentBlockNumber })
        const currentTime = new Date(Number(block.timestamp) * 1000)
        const totalDurationLeft = endLockTime.getTime() - currentTime.getTime()
        const thirteenWeeksInMilliseconds = 13 * 7 * 24 * 60 * 60 * 1000
        const penalty = Math.max(0, Math.min(1, totalDurationLeft / thirteenWeeksInMilliseconds))
        const maxAmount = depositPositionInfo?.amount || BigInt(0)
        const totalTanReceived = (maxAmount * BigInt(Math.round((1 - penalty) * 1000000))) / BigInt(1000000)

        setTanReceived(totalTanReceived)
      } catch (error) {
        console.error("Error calculating tanReceived:", error)
        setTanReceived(0n)
      }
    }

    if (depositPositionInfo) {
      calculateTanReceived()
    }
  }, [depositPositionInfo])

  const actionUnlock = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && depositPositionInfo) {
      await doUnlock(depositPositionInfo?.tokenId, walletClient, "unlock")
      loadData()
      setIsLoading(false)
      setDepositPosition("")
    } else {
      setIsLoading(false)
    }
  }

  const actionRageQuit = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && depositPositionInfo) {
      await doUnlock(depositPositionInfo?.tokenId, walletClient, "rageQuit")
      loadData()
      setIsLoading(false)
      setDepositPosition("")
    } else {
      setIsLoading(false)
    }
  }

  const contextValue: RsTanUnlockContextValues = {
    isLoading,
    setIsLoading,
    depositPosition,
    setDepositPosition,
    depositPositionInfo,
    actionUnlock,
    actionRageQuit,
    tanReceived,
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
