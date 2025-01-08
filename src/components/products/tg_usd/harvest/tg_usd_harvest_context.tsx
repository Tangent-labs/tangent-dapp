"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Address } from "viem"
import { doHarvest, getTgUsdHarvestOnChainData, transformHarvestOnChainData } from "./tg_usd_harvest_controller"
import { assetConfig, AssetConfigKey } from "@/services/repo_asset_infos"
import { AssetData, AssetDataPriced, ExistingAsset } from "@/types"
import { getTokensPrice } from "@/services/service_price"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { HarvesterInfoDisplay } from "../../booster/booster_type"
import { HarvesterInfo } from "../tg_usd_type"

type TgUsdHarvestContextProps = {
  children: ReactNode
}

type TgUsdHarvestContextValues = {
  isLoading: boolean
  displayRows: HarvesterInfoDisplay[]
  actionHarvest: (arg: Address) => void
}

export const TgUsdHarvestContext = createContext<TgUsdHarvestContextValues | undefined>(undefined)

export const TgUsdHarvestProvider = ({ children }: TgUsdHarvestContextProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [harvestInfo, setHarvestInfo] = useState<HarvesterInfo[] | undefined>()
  const [rewardsInfo, setRewardsInfo] = useState<AssetDataPriced[]>()

  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  /**
   * Not sure about this
   */

  useEffect(() => {
    setIsLoading(true)
    loadPrices()
  }, [harvestInfo])

  const loadPrices = async () => {
    if (!harvestInfo) return

    const tokens: ExistingAsset[] = []

    harvestInfo.forEach((el) => {
      el.tokenAmounts.forEach((t) => {
        if (!tokens.includes(t?.symbol)) tokens.push(t.symbol)
      })
    })

    try {
      const list: Record<AssetConfigKey, AssetData> = assetConfig

      const prices = await getTokensPrice(tokens)

      const allInfos = Object.entries(list)
        .filter(([k]) => tokens.indexOf(k as AssetConfigKey) !== -1)
        .map(([k, v]) => {
          return {
            ...v,
            price: (prices ? prices[k as AssetConfigKey] : 0) || 0,
          }
        })
        .sort((a, b) => {
          return (a?.logo ? tokens.indexOf(a.logo) : -1) - (b?.logo ? tokens.indexOf(b.logo) : -1)
        })

      setRewardsInfo(allInfos)
    } catch (error) {
      console.error("Failed to load asset information:", error)
    }
  }
  /**
   * END Not sure
   */

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

  const contextValue: TgUsdHarvestContextValues = {
    isLoading,
    displayRows,
    actionHarvest,
  }

  return <TgUsdHarvestContext.Provider value={contextValue}>{children}</TgUsdHarvestContext.Provider>
}

export const useTgUsdHarvestContext = () => {
  const context = useContext(TgUsdHarvestContext)
  if (!context) {
    throw new Error("useTgUsdHarvestContext must be used within a TgUsdHarvestProvider")
  }
  return context
}
