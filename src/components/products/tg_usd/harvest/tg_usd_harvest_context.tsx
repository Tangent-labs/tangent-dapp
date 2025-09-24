"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Address } from "viem"
import { computeAndReturnPrices, doHarvest, getTgUsdHarvestOnChainData, transformHarvestOnChainData } from "./tg_usd_harvest_controller"
import { AssetDataPriced } from "@/types"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { HarvesterInfo, HarvesterInfoDisplay } from "../tg_usd_type"

type USGHarvestContextProps = {
  children: ReactNode
}

type USGHarvestContextValues = {
  isLoading: boolean
  displayRows: HarvesterInfoDisplay[]
  actionHarvest: (arg: Address) => void
}

export const USGHarvestContext = createContext<USGHarvestContextValues | undefined>(undefined)

export const USGHarvestProvider = ({ children }: USGHarvestContextProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [harvestInfo, setHarvestInfo] = useState<HarvesterInfo[] | undefined>()
  const [rewardsInfo, setRewardsInfo] = useState<AssetDataPriced[]>()

  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    setIsLoading(true)
    loadPrices()
  }, [harvestInfo])

  const loadPrices = async () => {
    if (!harvestInfo) return

    const allInfos = await computeAndReturnPrices(harvestInfo)

    setRewardsInfo(allInfos)
  }

  useEffect(() => {
    setIsLoading(true)
    loadData()
  }, [])

  const loadData = useCallback(() => {
    getTgUsdHarvestOnChainData().then((data) => {
      setHarvestInfo(data)
      setIsLoading(false)
    })
  }, [])

  const displayRows = useMemo(() => {
    if (!harvestInfo || !rewardsInfo) return []

    const rows = transformHarvestOnChainData(harvestInfo, rewardsInfo)
    return rows
  }, [harvestInfo, rewardsInfo])

  const actionHarvest = useCallback(
    (stakingAddress: Address) => {
      const walletClient = getWalletClient()
      doHarvest(stakingAddress, walletClient!).then(loadData)
    },
    [currentAddress]
  )

  const contextValue: USGHarvestContextValues = {
    isLoading,
    displayRows,
    actionHarvest,
  }

  return <USGHarvestContext.Provider value={contextValue}>{children}</USGHarvestContext.Provider>
}

export const useUSGHarvestContext = () => {
  const context = useContext(USGHarvestContext)
  if (!context) {
    throw new Error("useUSGHarvestContext must be used within a USGHarvestProvider")
  }
  return context
}
