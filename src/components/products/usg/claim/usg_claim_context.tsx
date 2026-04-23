"use client"

import { zeroAddress } from "viem"
import { useUSGContext } from "../usg_context"
import { USGMarkets } from "../usg_repository"
import { AssetDataPriced, ListState } from "@/types"
import { formatDollar, formatMillions } from "@/lib/number_formatter"
import { ClaimableMarket, ClaimData, ClaimerInfo, USGStakingInfo } from "../usg_type"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import {
  getRewardTokensInfos,
  getUSGClaimOnChainData,
  sortClaimListByType,
  transformClaimOnChainData,
  doSimpleClaim,
  doMultiClaim,
} from "./usg_claim_controller"

type USGClaimContextProps = {
  children: ReactNode
}

type USGClaimContextValues = {
  isChainviewLoading: boolean
  isTxLoading: boolean
  displayRows: ClaimData[]
  onClickClaim: (marketsToClaim: ClaimableMarket[]) => void
  addToClaimableMarkets: (rowData: ClaimableMarket) => void
  marketsToClaim: ClaimableMarket[]
  getSortedRows: (rows: ClaimData[], arg: ListState) => ClaimData[]
  onClickClaimAll: () => void
  USGsUSGMetrics: USGStakingInfo | undefined

  totalDeposited: string
  totalClaimable: string
  weightedAPRAverage: string
}

export const USGClaimContext = createContext<USGClaimContextValues | undefined>(undefined)

export const USGClaimProvider = ({ children }: USGClaimContextProps) => {
  const { USGsUSGMetrics, marketAprs } = useUSGContext()

  const { walletClient, currentAddress, isWalletContextLoaded } = useWalletConnexionContext()

  const [isChainviewLoading, setIsChainviewLoading] = useState<boolean>(true)
  const [isTxLoading, setIsTxLoading] = useState<boolean>(false)

  const [claimInfo, setClaimInfo] = useState<ClaimerInfo[] | undefined>()

  const [rewardsInfo, setRewardsInfo] = useState<AssetDataPriced[]>()

  const [marketsToClaim, setMarketsToClaim] = useState<ClaimableMarket[]>([])

  useEffect(() => {
    loadPrices()
  }, [claimInfo])

  const loadPrices = async () => {
    if (!claimInfo) return
    const allInfos = await getRewardTokensInfos(claimInfo)
    setRewardsInfo(allInfos)
  }

  useEffect(() => {
    if (isWalletContextLoaded) {
      loadData()
    }
  }, [currentAddress])

  function loadData() {
    setIsChainviewLoading(true)
    getUSGClaimOnChainData(currentAddress || zeroAddress)
      .then((data) => {
        setClaimInfo(data)
      })
      .catch((e) => console.error(e))
      .finally(() => setIsChainviewLoading(false))
  }

  const displayRows = useMemo(() => {
    if (!claimInfo || !rewardsInfo || !marketAprs) return []
    const rows = transformClaimOnChainData(claimInfo, rewardsInfo, marketAprs)

    return rows.filter((market) => {
      let isSmthinToClaim = false
      market.claimable.forEach((r) => {
        if (r.amount !== "0") {
          isSmthinToClaim = true
        }
      })
      return isSmthinToClaim
    })
  }, [claimInfo, rewardsInfo, marketAprs])

  useEffect(() => {
    if (!claimInfo || !rewardsInfo || !marketAprs) return

    setIsChainviewLoading(false)
    setMarketsToClaim([])
  }, [claimInfo, rewardsInfo, marketAprs])

  const getSortedRows = (rows: ClaimData[], listState: ListState) => {
    const { key, direction } = listState.sort!

    return [...rows].sort((elementA: ClaimData, elementB: ClaimData) => {
      let aValue: number | string = elementA[key as keyof ClaimData] as number | string
      let bValue: number | string = elementB[key as keyof ClaimData] as number | string

      if (key === "marketName") {
        const compared = elementA.marketName.localeCompare(elementB.marketName)
        return direction === "asc" ? compared : -compared
      }

      if (key === "apr") {
        return sortClaimListByType(elementA, elementB, direction)
      }

      if (key === "totalClaimableValue" || key === "totalDepositedValue") {
        aValue = Number(elementA[key as keyof ClaimData] ?? 0)
        bValue = Number(elementB[key as keyof ClaimData] ?? 0)
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const onClickClaim = (marketsToClaim: ClaimableMarket[]) => {
    const marketAddressesToClaim = marketsToClaim.map((el) => el.marketAddress)
    if (!walletClient) return
    setIsTxLoading(true)
    if (marketAddressesToClaim.length === 1) {
      doSimpleClaim(marketAddressesToClaim[0], walletClient)
        .then(() => {
          setMarketsToClaim([])
          loadData()
        })
        .catch((e) => console.error(e))
        .finally(() => setIsTxLoading(false))
    } else {
      doMultiClaim(marketAddressesToClaim, getRewardAmountToBeClaimed(), walletClient)
        .then(() => {
          setMarketsToClaim([])
          loadData()
        })
        .catch((e) => console.error(e))
        .finally(() => setIsTxLoading(false))
    }
  }

  function getRewardAmountToBeClaimed() {
    const set = new Set<string>()
    marketsToClaim.forEach((m) => {
      m.rewards.forEach((r) => {
        if (r.amount !== "0") {
          set.add(r.symbol)
        }
      })
    })
    return Array.from(set).length
  }

  const addToClaimableMarkets = (rowData: ClaimableMarket) => {
    setMarketsToClaim((prevMarkets: ClaimableMarket[]) => {
      const market = prevMarkets.find((market) => market.marketAddress === rowData.marketAddress)

      const marketConfig = USGMarkets.find((m) => m.marketAddress === rowData.marketAddress)

      if (market) {
        return prevMarkets.filter((m) => m.marketAddress !== market.marketAddress).sort((m1, m2) => Number(m2.claimable) - Number(m1.claimable))
      } else {
        return [
          ...prevMarkets,
          {
            marketName: rowData.marketName,
            claimable: rowData.claimable,
            marketAddress: rowData.marketAddress,
            logoKey: marketConfig?.logoKey,
            rewards: rowData.rewards,
          },
        ].sort((m1, m2) => Number(m2.claimable) - Number(m1.claimable))
      }
    })
  }

  const onClickClaimAll = () => {
    if (marketsToClaim.length === displayRows.length) {
      setMarketsToClaim([])
    } else {
      const markets = displayRows
        .map((el) => {
          const marketConfig = USGMarkets.find((m) => m.marketAddress === el.marketAddress)

          return {
            marketName: el.marketName,
            claimable: el.totalClaimableValue,
            rewards: el.claimable,
            marketAddress: el.marketAddress,
            logoKey: marketConfig?.logoKey,
          } as ClaimableMarket
        })
        .sort((m1, m2) => Number(m2.claimable) - Number(m1.claimable))
      setMarketsToClaim(markets)
    }
  }

  const totals = useMemo(() => {
    let weightedAPRAverage = 0
    let totalValueDeposited = 0
    let totalClaimable = 0

    // Computes all totals with one loop only
    displayRows.forEach((row) => {
      const depositedValue = Number(row.totalDepositedValue)
      totalValueDeposited += depositedValue
      weightedAPRAverage += Number(row.apr.current) * depositedValue
      totalClaimable += Number(row.totalClaimableValue)
    })
    // Prevent denom to be zero
    weightedAPRAverage = totalValueDeposited !== 0 ? weightedAPRAverage / totalValueDeposited : 0

    return {
      totalDeposited: `$${formatMillions(totalValueDeposited)}`,
      totalClaimable: formatDollar(totalClaimable, 2),
      weightedAPRAverage: weightedAPRAverage === 0 ? "-%" : weightedAPRAverage.toFixed(2) + "%",
    }
  }, [displayRows])

  const contextValue: USGClaimContextValues = {
    displayRows,
    onClickClaim,
    addToClaimableMarkets,
    marketsToClaim,
    isChainviewLoading,
    isTxLoading,
    getSortedRows,
    onClickClaimAll,
    USGsUSGMetrics,
    totalDeposited: totals.totalDeposited,
    totalClaimable: totals.totalClaimable,
    weightedAPRAverage: totals.weightedAPRAverage,
  }

  return <USGClaimContext.Provider value={contextValue}>{children}</USGClaimContext.Provider>
}

export const useUSGClaimContext = () => {
  const context = useContext(USGClaimContext)
  if (!context) {
    throw new Error("useUSGClaimContext must be used within a USGClaimProvider")
  }
  return context
}
