"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { doIncreaseLockTime, doTogglePermaLock, getRsTanData } from "./rstan_layout_controller"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"
import { LockData, LockPosition } from "../tg_usd/tg_usd_type"

type RsTanContextProps = {
  children: ReactNode
}

type RsTanContextValues = {
  loadData: () => void

  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  extendToPermaLock: boolean
  setExtendToPermaLock: (arg: boolean) => void

  lockData: LockData | undefined
  setLockData: (arg: LockData | undefined) => void

  selectedPosition: LockPosition | undefined
  setSelectedPosition: (arg: LockPosition | undefined) => void

  onClickExtend: (pos: LockPosition) => void

  onClickRemovePermaLock: () => void
}

export const RsTanContext = createContext<RsTanContextValues | undefined>(undefined)

export const RsTanProvider = ({ children }: RsTanContextProps) => {
  const { currentAddress, getWalletClient } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [extendToPermaLock, setExtendToPermaLock] = useState<boolean>(false)

  const [selectedPosition, setSelectedPosition] = useState<LockPosition | undefined>(undefined)

  const [lockData, setLockData] = useState<LockData | undefined>(undefined)

  useEffect(() => {
    loadData()
  }, [currentAddress])

  useEffect(() => {
    setExtendToPermaLock(false)
  }, [selectedPosition])

  const loadData = useCallback(() => {
    if (currentAddress) {
      getRsTanData(currentAddress).then((d) => {
        setLockData(d)
        setIsLoading(false)
      })
    }
  }, [currentAddress])

  const onClickExtend = async () => {
    setIsLoading(true)

    const walletClient = getWalletClient()

    if (walletClient && selectedPosition) {
      if (extendToPermaLock) {
        await doTogglePermaLock(selectedPosition?.tokenId, walletClient)
        loadData()
        setIsLoading(false)
      } else {
        await doIncreaseLockTime(selectedPosition?.tokenId, walletClient)
        loadData()
        setIsLoading(false)
      }
    }
  }

  const onClickRemovePermaLock = async () => {
    const walletClient = getWalletClient()

    if (walletClient && selectedPosition) {
      await doTogglePermaLock(selectedPosition?.tokenId, walletClient)
      loadData()
      setIsLoading(false)
    }
  }

  const contextValue: RsTanContextValues = {
    loadData,
    isLoading,
    setIsLoading,
    lockData,
    setLockData,
    selectedPosition,
    setSelectedPosition,
    onClickExtend,
    extendToPermaLock,
    setExtendToPermaLock,
    onClickRemovePermaLock,
  }

  return <RsTanContext.Provider value={contextValue}>{children}</RsTanContext.Provider>
}

export const useRsTanContext = () => {
  const context = useContext(RsTanContext)
  if (!context) {
    throw new Error("useRsTanContext must be used within a RsTanProvider")
  }
  return context
}
