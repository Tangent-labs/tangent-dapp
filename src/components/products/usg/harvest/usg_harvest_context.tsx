"use client"

import { ToastComponent } from "@/components/design_system/toast"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { AssetDataPriced, ListState } from "@/types"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import { Address } from "viem"
import { useUSGContext } from "../usg_context"
import { HarvestableMarket, HarvesterInfo, HarvesterInfoDisplay, USGStakingInfo } from "../usg_type"
import {
  doHarvest,
  doMultiHarvest,
  ExtraRewards,
  getRewardTokensInfos,
  getStakeDaoMerkleData,
  getUSGHarvestOnChainData,
  Merk,
  transformHarvestOnChainData,
} from "./usg_harvest_controller"

type USGHarvestContextProps = {
  children: ReactNode
}

type USGHarvestContextValues = {
  isChainviewLoading: boolean
  isTxLoading: boolean
  displayRows: HarvesterInfoDisplay[]
  actionHarvest: (arg: Address) => void
  // Harvest overrides how the provider's internal sort state is applied because several columns are computed.
  getSortedRows: (rows: HarvesterInfoDisplay[], arg: ListState) => HarvesterInfoDisplay[]
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

  const [isChainviewLoading, setIsChainviewLoading] = useState<boolean>(true)

  const [isTxLoading, setIsTxLoading] = useState<boolean>(false)

  const [harvestInfo, setHarvestInfo] = useState<(HarvesterInfo & { marketType: number })[] | undefined>()

  const [rewardsInfo, setRewardsInfo] = useState<AssetDataPriced[]>()

  const [marketsToHarvest, setMarketsToHarvest] = useState<HarvestableMarket[]>([])

  const [stakeDaoMerkle, setStakeDaoMerkle] = useState<Merk[]>([])

  const stakeDaoMarkets = useMemo(() => {
    if (!harvestInfo) return []
    return harvestInfo.filter((market) => market?.marketType === 2)
  }, [harvestInfo])

  useEffect(() => {
    loadChainviewData()
  }, [])

  // Fetch prices and infos of ERC20 rewards
  useEffect(() => {
    if (!harvestInfo) return
    getRewardTokensInfos(harvestInfo)
      .then((data) => {
        setRewardsInfo(data)
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => setIsChainviewLoading(false))
  }, [harvestInfo])

  // Fetch Merkle data from StakeDao
  useEffect(() => {
    if (stakeDaoMarkets.length === 0) return
    getStakeDaoMerkleData(stakeDaoMarkets).then((data) => {
      setStakeDaoMerkle(data)
    })
  }, [stakeDaoMarkets])

  const loadChainviewData = useCallback(() => {
    getUSGHarvestOnChainData().then((data) => {
      setHarvestInfo(data)
    })
  }, [])

  const displayRows = useMemo(() => {
    if (!harvestInfo || !rewardsInfo) return []
    return transformHarvestOnChainData(harvestInfo, rewardsInfo)
  }, [harvestInfo, rewardsInfo])

  const actionHarvest = () => {
    const market = marketsToHarvest[0].marketAddress.toLowerCase()

    const merkle = stakeDaoMerkle.find((m) => market === m.marketAddress.toLowerCase())

    let extraReward: ExtraRewards | undefined = undefined
    if (merkle) {
      merkle.merkleData.forEach((t) => {
        const amount = BigInt(t.merkle.amount)
        if (amount !== 0n) {
          extraReward = { token: t.merkle.token, claimable: amount, proof: t.merkle.proof }
        }
      })
    }

    doHarvest(market, walletClient!, extraReward)
      .then(() => {
        loadChainviewData()
        setMarketsToHarvest([])
        toast.success(ToastComponent, { data: { type: "Success", content: "Market harvested successfully" } })
      })
      .catch((e) => console.error(e))
      .finally(() => setIsTxLoading(false))
  }

  const actionHarvestMultipleMarkets = () => {
    const marketAddresses = marketsToHarvest.map((el) => el.marketAddress)

    doMultiHarvest(marketAddresses, getRewardAmountToBeClaimed(), walletClient!)
      .then(() => {
        loadChainviewData()
        setMarketsToHarvest([])
        toast.success(ToastComponent, { data: { type: "Success", content: "Markets harvested successfully" } })
      })
      .catch((e) => console.error(e))
      .finally(() => setIsTxLoading(false))
  }

  const onClickSelectAll = () => {
    // If everythin is already selected
    if (marketsToHarvest.length === displayRows.length) {
      setMarketsToHarvest([])
    } else {
      const markets = displayRows
        .map((el) => {
          return {
            ...el,
            marketName: el.asset,
            harvestable: (el.rewards.totalDollar * el?.percentage) / 100,
            marketAddress: el.contractAddress,
          } satisfies HarvestableMarket
        })
        .sort((m1, m2) => Number(m2.rewards.totalDollar) - Number(m1.rewards.totalDollar))
      setMarketsToHarvest(markets)
    }
  }

  function getRewardAmountToBeClaimed() {
    const set = new Set<string>()
    marketsToHarvest.forEach((m) => {
      m.rewards.details.forEach((d) => {
        if (d.rawAmount !== "0") {
          set.add(d.symbol)
        }
      })
    })
    return Array.from(set).length
  }

  const getSortedRows = (rows: HarvesterInfoDisplay[], listState: ListState) => {
    const { key, direction } = listState.sort!

    return [...rows].sort((elementA: HarvesterInfoDisplay, elementB: HarvesterInfoDisplay) => {
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
        return prevMarkets
          .filter((m) => m.marketAddress !== market.marketAddress)
          .sort((m1, m2) => Number(m2.rewards.totalDollar) - Number(m1.rewards.totalDollar))
      } else {
        return [
          ...prevMarkets,
          {
            ...rowData,
            harvestable: (rowData.harvestable * rowData?.percentage) / 100,
          },
        ].sort((m1, m2) => Number(m2.rewards.totalDollar) - Number(m1.rewards.totalDollar))
      }
    })
  }

  const onClickHarvest = () => {
    setIsTxLoading(true)
    if (marketsToHarvest.length > 1) {
      actionHarvestMultipleMarkets()
    } else {
      actionHarvest()
    }
  }

  const contextValue: USGHarvestContextValues = {
    isChainviewLoading,
    isTxLoading,
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
