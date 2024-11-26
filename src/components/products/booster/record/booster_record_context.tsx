"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { getBoosterApr } from "@products/booster/booster_controller"
import { AssetApr, AssetDataPriced } from "@/types"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { BoosterDetailOut, BoosterExistingAsset, BoosterStakingInfo } from "@products/booster/booster_type"
import { useDebouncedCallback } from "use-debounce"
import { getBoosterRecordData } from "@products/booster/record/booster_record_controller"

type BoosterRecordProps = {
  children: ReactNode
  assetInfo?: AssetDataPriced
  asset: BoosterExistingAsset
  tokenInfo?: AssetDataPriced[]
  stakingInfo: BoosterStakingInfo
}

type BoosterRecordContextValues = {
  isLoading: boolean
  apr?: AssetApr
  onChainData?: BoosterDetailOut
  assetInfo?: AssetDataPriced
  tokenInfo?: AssetDataPriced[]
  stakingInfo: BoosterStakingInfo
  reloadOnChainData: () => void
}

export const BoosterRecordContext = createContext<BoosterRecordContextValues | undefined>(undefined)

export const BoosterRecordProvider = ({ children, asset, assetInfo, stakingInfo, tokenInfo }: BoosterRecordProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [onChainData, setOnChainData] = useState<BoosterDetailOut | undefined>()
  const [apr, setApr] = useState<AssetApr | undefined>()
  const { currentAddress } = useWalletConnexionContext()

  const loadData = useCallback(() => {
    setIsLoading(true)
    getBoosterRecordData(currentAddress, stakingInfo.stakingAddress).then((data) => {
      setOnChainData(data)
      setIsLoading(false)
    })
  }, [currentAddress])

  const reloadOnChainData = () => {
    getBoosterRecordData(currentAddress, stakingInfo.stakingAddress).then((data) => {
      setOnChainData(data)
    })
  }

  const debouncedLoadData = useDebouncedCallback(loadData, 1000)
  const loadApr = useCallback(() => {
    getBoosterApr(asset).then((a: Record<BoosterExistingAsset, AssetApr>) => {
      setApr(a[asset])
    })
  }, [])

  useEffect(() => {
    debouncedLoadData()
    return () => {
      debouncedLoadData.cancel()
    }
  }, [debouncedLoadData, currentAddress])

  useEffect(() => {
    loadApr()
  }, [])

  const contextValue: BoosterRecordContextValues = {
    isLoading,
    apr,
    onChainData,
    assetInfo,
    tokenInfo,
    stakingInfo,
    reloadOnChainData,
  }

  return <BoosterRecordContext.Provider value={contextValue}>{children}</BoosterRecordContext.Provider>
}

export const useBoosterRecordContext = () => {
  const context = useContext(BoosterRecordContext)
  if (!context) {
    throw new Error("useBoosterRecordContext must be used within a BoosterRecordProvider")
  }
  return context
}
