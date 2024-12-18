"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { doHarvest, getBoosterHarvestOnChainData, transformHarvestOnChainData } from "./booster_harvest_controller"
import { HarvesterInfo, HarvesterInfoDisplay } from "../booster_type"
import { AssetDataPriced } from "@/types"
import { Address } from "viem"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"

type BoosterHarvestContextProps = {
  children: ReactNode
  rewardsInfo: AssetDataPriced[]
}

type BoosterHarvestContextValues = {
  isLoading: boolean
  displayRows: HarvesterInfoDisplay[]
  actionHarvest: (arg: Address) => void
}

export const BoosterHarvestContext = createContext<BoosterHarvestContextValues | undefined>(undefined)

export const BoosterHarvestProvider = ({ children, rewardsInfo }: BoosterHarvestContextProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [harvestInfo, setHarvestInfo] = useState<HarvesterInfo[] | undefined>()

  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    setIsLoading(true)
    loadData()
  }, [])

  const displayRows = useMemo(() => {
    if (!harvestInfo) return []
    const rows = transformHarvestOnChainData(harvestInfo, rewardsInfo)
    return rows
  }, [harvestInfo])

  const loadData = useCallback(() => {
    getBoosterHarvestOnChainData().then((data) => {
      setHarvestInfo(data)
      setIsLoading(false)
    })
  }, [])

  const actionHarvest = useCallback(
    (stakingAddress: Address) => {
      const walletClient = getWalletClient()
      doHarvest(stakingAddress, walletClient!).then(loadData)
    },
    [currentAddress]
  )

  const contextValue: BoosterHarvestContextValues = {
    isLoading,
    displayRows,
    actionHarvest,
  }

  return <BoosterHarvestContext.Provider value={contextValue}>{children}</BoosterHarvestContext.Provider>
}

export const useBoosterHarvestContext = () => {
  const context = useContext(BoosterHarvestContext)
  if (!context) {
    throw new Error("useBoosterHarvestContext must be used within a BoosterHarvestProvider")
  }
  return context
}
