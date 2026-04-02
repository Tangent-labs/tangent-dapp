"use client"

import { Address } from "viem"
import { toast } from "react-toastify"
import { useUSGContext } from "../usg_context"
import { AssetDataPriced, ListState, TokenAmount } from "@/types"
import { ToastComponent } from "@/components/design_system/toast"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { SortedRows } from "@/components/design_system/list/list_context"
import { HarvestableMarket, HarvesterInfo, HarvesterInfoDisplay, USGStakingInfo } from "../usg_type"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  getRewardTokensInfos,
  doHarvest,
  doMultiHarvest,
  getUSGHarvestOnChainData,
  transformHarvestOnChainData,
  getStakeDaoMerkleData,
  Merk,
} from "./usg_harvest_controller"
import { COMMON_ERC20S } from "@tangent/defi-resources"

type USGHarvestContextProps = {
  children: ReactNode
}

type USGHarvestContextValues = {
  isChainviewLoading: boolean
  isTxLoading: boolean
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
    getStakeDaoMerkleData(stakeDaoMarkets).then((data) => setStakeDaoMerkle(data))
  }, [stakeDaoMarkets])

  const loadChainviewData = useCallback(() => {
    getUSGHarvestOnChainData().then((data) => {
      setHarvestInfo(data)
    })
  }, [])

  const displayRows = useMemo(() => {
    if (!harvestInfo || !rewardsInfo) return []
    const rows = transformHarvestOnChainData(harvestInfo, rewardsInfo)
    return rows.filter((market) => market?.rewards?.totalDollar > 0)
  }, [harvestInfo, rewardsInfo])

  // Rewards already claimed by our markets on the Merkle claim contract of StakeDao
  const stakeDaoMerkleAlreadyClaimed = useMemo(() => {
    if (stakeDaoMarkets.length === 0) return []
    return stakeDaoMarkets.map((market) => {
      return { marketAddress: market.marketAddress, alreadyClaimed: market.claimableRewards.filter((cR) => cR.token !== COMMON_ERC20S.CRV) }
    })
  }, [stakeDaoMarkets])

  // Rewards claimable on our markets from extra rewards of StakeDAO
  // Need to have stakeDaoMemo already claimed & the answers of the call to StakeDAO merkle
  // We have to do this because :
  //  - StakeDAO API call returns the totalClaimable
  //  - Contract call returns what has been already claimed
  // => What is claimable is the total - claimed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stakeDaoMerkleClaimable = useMemo(() => {
    if (stakeDaoMerkleAlreadyClaimed.length === 0 || stakeDaoMerkle.length === 0) return []
    return stakeDaoMerkleAlreadyClaimed.map((ac) => {
      const claimable: TokenAmount[] = []
      const merkle = stakeDaoMerkle.find((sdm) => ac.marketAddress.toLowerCase() === sdm.marketAddress.toLowerCase())!

      ac.alreadyClaimed.forEach((t) => {
        const totalClaimable = BigInt(merkle.merkleData.find((md) => md.tokenObj.address.toLowerCase() === t.token)?.merkle.amount || 0n)
        claimable.push({ token: t.token, amount: totalClaimable - t.amount })
      })

      return { marketAddress: ac.marketAddress, claimable: claimable }
    })
  }, [stakeDaoMerkleAlreadyClaimed, stakeDaoMerkle])

  const actionHarvest = () => {
    doHarvest(marketsToHarvest[0].marketAddress, walletClient!)
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
