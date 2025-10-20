"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { doIncreaseLockTime, doTogglePermaLock, getVsTanData } from "./rstan_layout_controller"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"
import { BalanceAllowanceData, LockData, LockPosition } from "../tg_usd/tg_usd_type"
import { getBalancesAndAllowances } from "../tg_usd/record/tg_usd_record_controller"
import { Address, zeroAddress } from "viem"
import { VSTAN_CONTRACT } from "./rs_tan_repository"
import { usePathname } from "next/navigation"

type VsTanContextProps = {
  children: ReactNode
}

type VsTanContextValues = {
  loadData: () => void

  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  extendToPermaLock: boolean
  setExtendToPermaLock: (arg: boolean) => void

  lockData: LockData | undefined
  setLockData: (arg: LockData | undefined) => void

  selectedPosition: LockPosition | undefined
  setSelectedPosition: (arg: LockPosition | undefined) => void

  balanceAllowanceData: BalanceAllowanceData | null
  setBalanceAllowanceData: (arg: BalanceAllowanceData) => void

  onClickExtend: (pos: LockPosition) => void

  fetchBalanceAllowanceData: (address: Address) => void

  onClickRemovePermaLock: () => void

  feature: string
}

export const VsTanContext = createContext<VsTanContextValues | undefined>(undefined)

export const VsTanProvider = ({ children }: VsTanContextProps) => {
  const path = usePathname()

  const { currentAddress, getWalletClient, isWalletInitialized } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [extendToPermaLock, setExtendToPermaLock] = useState<boolean>(false)

  const [selectedPosition, setSelectedPosition] = useState<LockPosition | undefined>(undefined)

  const [lockData, setLockData] = useState<LockData | undefined>(undefined)

  const [balanceAllowanceData, setBalanceAllowanceData] = useState<BalanceAllowanceData | null>(null)

  const feature = useMemo(() => {
    const lastIndexOfSlash = path.lastIndexOf("/") + 1
    const currentFeature = path.substring(lastIndexOfSlash, path.length)
    return currentFeature
  }, [path])

  /**
   * On init
   */
  useEffect(() => {
    if (isWalletInitialized) {
      loadData()
    }
  }, [isWalletInitialized])

  /**
   * On user logs in
   */
  useEffect(() => {
    if (isWalletInitialized && currentAddress && lockData) {
      loadData()
    }
  }, [currentAddress])

  useEffect(() => {
    setExtendToPermaLock(false)
  }, [selectedPosition])

  const loadData = useCallback(() => {
    getVsTanData(currentAddress || zeroAddress)
      .then((d) => {
        setLockData(d)
        setIsLoading(false)
      })
      .catch(() => {
        console.error("Failed to fetch vsTanData")
      })
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

  const fetchBalanceAllowanceData = async (depositAssetInfo: Address) => {
    if (!depositAssetInfo) return

    try {
      const walletClient = getWalletClient()

      const data = await getBalancesAndAllowances(walletClient!, depositAssetInfo, VSTAN_CONTRACT?.VSTAN)

      setBalanceAllowanceData(data ? (data[0] as BalanceAllowanceData) : null)
    } catch (error) {
      console.error("Failed to fetch balance/allowance:", error)
    }
  }

  const contextValue: VsTanContextValues = {
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
    balanceAllowanceData,
    setBalanceAllowanceData,
    fetchBalanceAllowanceData,
    feature,
  }

  return <VsTanContext.Provider value={contextValue}>{children}</VsTanContext.Provider>
}

export const useVsTanContext = () => {
  const context = useContext(VsTanContext)
  if (!context) {
    throw new Error("useVsTanContext must be used within a VsTanProvider")
  }
  return context
}
