"use client"

import { Address } from "viem"
import { toast } from "react-toastify"
import { useUSGContext } from "../usg_context"
import { AssetDataPriced, ListState } from "@/types"
import { ToastComponent } from "@/components/design_system/toast"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { SortedRows } from "@/components/design_system/list/list_context"
import { HarvestableMarket, HarvesterInfo, HarvesterInfoDisplay, USGStakingInfo } from "../usg_type"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { computeAndReturnPrices, doHarvest, doMultiHarvest, getUSGHarvestOnChainData, transformHarvestOnChainData } from "./usg_harvest_controller"

type USGHarvestContextProps = {
  children: ReactNode
}

type USGHarvestContextValues = {
  isLoading: boolean
  displayRows: HarvesterInfoDisplay[]
  actionHarvest: (arg: Address) => void
  // Harvest overrides how the provider's internal sort state is applied because several columns are computed.
  getSortedRows: (rows: SortedRows, arg: ListState) => HarvesterInfoDisplay[]
  onClickSelectAll: () => void
  marketsToHarvest: HarvestableMarket[]
  addToHarvestableMarkets: (rowData: HarvestableMarket) => void
  onClickHarvest: () => void
  USGsUSGMetrics: USGStakingInfo | undefined
}

export const USGHarvestContext = createContext<USGHarvestContextValues | undefined>(undefined)

export const USGHarvestProvider = ({ children }: USGHarvestContextProps) => {
  const { USGsUSGMetrics } = useUSGContext()

  const { walletClient } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [harvestInfo, setHarvestInfo] = useState<HarvesterInfo[] | undefined>()

  const [rewardsInfo, setRewardsInfo] = useState<AssetDataPriced[]>()

  const [marketsToHarvest, setMarketsToHarvest] = useState<HarvestableMarket[]>([])

  useEffect(() => {
    loadPrices()
  }, [harvestInfo])

  const loadPrices = async () => {
    if (!harvestInfo) return

    const allInfos = await computeAndReturnPrices(harvestInfo)

    setRewardsInfo(allInfos)
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(() => {
    getUSGHarvestOnChainData().then((data) => {
      setHarvestInfo(data)
      setIsLoading(false)
    })
  }, [])

  const displayRows = useMemo(() => {
    if (!harvestInfo || !rewardsInfo) return []

    const rows = transformHarvestOnChainData(harvestInfo, rewardsInfo)
    setIsLoading(false)

    return rows.filter((market) => market?.rewards?.totalDollar > 0)
  }, [harvestInfo, rewardsInfo])

  const actionHarvest = () => {
    doHarvest(marketsToHarvest[0].marketAddress, walletClient!).then(() => {
      loadData()
      setMarketsToHarvest([])
      toast.success(ToastComponent, { data: { type: "Success", content: "Market harvested successfully" } })
    })
  }

  const actionHarvestMultipleMarkets = () => {
    const marketAddresses = marketsToHarvest.map((el) => el.marketAddress)

    doMultiHarvest(marketAddresses, walletClient!).then(() => {
      loadData()
      setMarketsToHarvest([])
      toast.success(ToastComponent, { data: { type: "Success", content: "Markets harvested successfully" } })
    })
  }

  const onClickSelectAll = () => {
    if (marketsToHarvest.length === displayRows.length) {
      setMarketsToHarvest([])
    } else {
      const markets = displayRows.map((el) => {
        return {
          marketName: el.asset,
          harvestable: (el.rewards.totalDollar * el?.percentage) / 100,
          marketAddress: el.contractAddress,
          percentage: el.percentage,
        } satisfies HarvestableMarket
      })
      setMarketsToHarvest(markets)
    }
  }

  const getSortedRows = (rows: SortedRows, listState: ListState) => {
    const { key, direction } = listState.sort!
    const harvestRows = rows as HarvesterInfoDisplay[]

    return [...harvestRows].sort((elementA: HarvesterInfoDisplay, elementB: HarvesterInfoDisplay) => {
      let aValue: number | string = elementA[key as keyof HarvesterInfoDisplay] as number | string
      let bValue: number | string = elementB[key as keyof HarvesterInfoDisplay] as number | string

      if (key === "totalRewards") {
        aValue = elementA.rewards.totalDollar
        bValue = elementB.rewards.totalDollar
      }

      if (key === "harvesterRewards") {
        aValue = (elementA.rewards.totalDollar * elementA.percentage) / 100
        bValue = (elementB.rewards.totalDollar * elementB.percentage) / 100
      }

      if (key === "lastHarvestDate") {
        const [aDay, aMonth, aYear] = elementA.lastHarvestDate.split("-").map(Number)
        const [bDay, bMonth, bYear] = elementB.lastHarvestDate.split("-").map(Number)

        aValue = new Date(aYear, aMonth - 1, aDay).getTime()
        bValue = new Date(bYear, bMonth - 1, bDay).getTime()
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const addToHarvestableMarkets = (rowData: HarvestableMarket) => {
    setMarketsToHarvest((prevMarkets: HarvestableMarket[]) => {
      const market = prevMarkets.find((market) => market.marketAddress === rowData.marketAddress)

      if (market) {
        return prevMarkets.filter((m) => m.marketAddress !== market.marketAddress)
      } else {
        return [
          ...prevMarkets,
          {
            marketName: rowData.marketName,
            harvestable: (rowData.harvestable * rowData?.percentage) / 100,
            marketAddress: rowData.marketAddress,
            percentage: rowData?.percentage,
          },
        ]
      }
    })
  }

  const onClickHarvest = () => {
    if (marketsToHarvest.length > 1) {
      actionHarvestMultipleMarkets()
    } else {
      actionHarvest()
    }
  }

  const contextValue: USGHarvestContextValues = {
    isLoading,
    displayRows,
    getSortedRows,
    onClickSelectAll,
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
