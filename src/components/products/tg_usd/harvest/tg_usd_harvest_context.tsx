"use client"

import { Address } from "viem"
import { useUSGContext } from "../tg_usd_context"
import { AssetDataPriced, ListState } from "@/types"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { HarvestableMarket, HarvesterInfo, HarvesterInfoDisplay, USGStakingInfo } from "../tg_usd_type"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { computeAndReturnPrices, doHarvest, getTgUsdHarvestOnChainData, transformHarvestOnChainData } from "./tg_usd_harvest_controller"

type USGHarvestContextProps = {
  children: ReactNode
}

type USGHarvestContextValues = {
  isLoading: boolean
  displayRows: HarvesterInfoDisplay[]
  actionHarvest: (arg: Address) => void
  customSort: (arg: ListState) => void
  onClickHarvestAll: () => void
  marketsToHarvest: HarvestableMarket[]
  addToHarvestableMarkets: (rowData: HarvestableMarket) => void
  onClickHarvest: () => void
  USGsUSGMetrics: USGStakingInfo | undefined
}

export const USGHarvestContext = createContext<USGHarvestContextValues | undefined>(undefined)

export const USGHarvestProvider = ({ children }: USGHarvestContextProps) => {
  const { USGsUSGMetrics } = useUSGContext()

  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [harvestInfo, setHarvestInfo] = useState<HarvesterInfo[] | undefined>()

  const [rewardsInfo, setRewardsInfo] = useState<AssetDataPriced[]>()

  const [marketsToHarvest, setMarketsToHarvest] = useState<HarvestableMarket[]>([])

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

  const onClickHarvestAll = () => {
    if (marketsToHarvest.length === displayRows.length) {
      setMarketsToHarvest([])
    } else {
      const markets = displayRows.map((el) => {
        return { marketName: el.asset, harvestable: el.rewards.totalDollar, marketAddress: el.asset } as HarvestableMarket
      })
      setMarketsToHarvest(markets)
    }
  }

  const customSort = (listState: ListState) => {
    const { key, direction } = listState.sort!

    displayRows.sort((elementA: HarvesterInfoDisplay, elementB: HarvesterInfoDisplay) => {
      const aValue = Number(elementA[key as keyof HarvesterInfoDisplay])
      const bValue = Number(elementB[key as keyof HarvesterInfoDisplay])

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const addToHarvestableMarkets = (rowData: HarvestableMarket) => {
    setMarketsToHarvest((prevMarkets: HarvestableMarket[]) => {
      const market = prevMarkets.find((market) => market.marketName === rowData.marketName)

      if (market) {
        return prevMarkets.filter((m) => m.marketName !== market.marketName)
      } else {
        return [...prevMarkets, { marketName: rowData.marketName, harvestable: rowData.harvestable, marketAddress: rowData.marketAddress }]
      }
    })
  }

  const onClickHarvest = () => {
    console.info("onClickHarvest")
  }

  const contextValue: USGHarvestContextValues = {
    isLoading,
    displayRows,
    customSort,
    onClickHarvestAll,
    actionHarvest,
    marketsToHarvest,
    addToHarvestableMarkets,
    onClickHarvest,
    USGsUSGMetrics,
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
