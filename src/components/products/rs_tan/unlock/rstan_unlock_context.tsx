"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useRsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { doUnlock } from "./rstan_unlock_controller"

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

  computedTanReceivedValue: string

  computedTanForfeitedValue: string
}

export const RsTanUnlockContext = createContext<RsTanUnlockContextValues | undefined>(undefined)

export const RsTanUnlockProvider = ({ children }: RsTanUnlockContextProps) => {
  const { getWalletClient } = useWalletConnexionContext()

  const { loadData, lockData } = useRsTanContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [depositPosition, setDepositPosition] = useState<string>("New")

  const depositPositionInfo = useMemo(() => {
    const pos = lockData?.positions.find((position) => position?.tokenId.toString() === depositPosition)

    return pos
  }, [depositPosition])

  const actionUnlock = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && depositPositionInfo) {
      await doUnlock(depositPositionInfo?.tokenId, walletClient)
      loadData()
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }

  const computedTanReceivedValue = "douze"

  const computedTanForfeitedValue = "douze"

  const contextValue: RsTanUnlockContextValues = {
    isLoading,
    setIsLoading,
    depositPosition,
    setDepositPosition,
    depositPositionInfo,
    actionUnlock,
    computedTanReceivedValue,
    computedTanForfeitedValue,
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
