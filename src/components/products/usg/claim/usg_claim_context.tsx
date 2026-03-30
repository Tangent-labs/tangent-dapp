"use client"

import { Address, zeroAddress } from "viem"
import { useUSGContext } from "../usg_context"
import { USG_CONTRACT, USGMarkets } from "../usg_repository"
import { AssetDataPriced, ListState } from "@/types"
import { SortedRows } from "@/components/design_system/list/list_context"
import { formatDollar, formatMillions } from "@/lib/number_formatter"
import { ClaimableMarket, ClaimData, ClaimerInfo, USGStakingInfo } from "../usg_type"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { getRewardTokensInfos, doClaim, getUSGClaimOnChainData, sortClaimListByType, transformClaimOnChainData } from "./usg_claim_controller"

type USGClaimContextProps = {
  children: ReactNode
}

type USGClaimContextValues = {
  isLoading: boolean
  displayRows: ClaimData[]
  actionClaim: (arg: Address, markets: Address[]) => void
  onClickClaim: (marketsToClaim: ClaimableMarket[]) => void
  addToClaimableMarkets: (rowData: ClaimableMarket) => void
  marketsToClaim: ClaimableMarket[]
  getSortedRows: (rows: SortedRows, arg: ListState) => ClaimData[]
  onClickClaimAll: () => void
  USGsUSGMetrics: USGStakingInfo | undefined

  totalDeposited: string
  totalClaimable: string
}

export const USGClaimContext = createContext<USGClaimContextValues | undefined>(undefined)

export const USGClaimProvider = ({ children }: USGClaimContextProps) => {
  const { USGsUSGMetrics, marketAprs } = useUSGContext()

  const { walletClient, currentAddress } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

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
    loadData()
  }, [currentAddress])

  const loadData = useCallback(() => {
    getUSGClaimOnChainData(currentAddress || zeroAddress).then((data) => {
      setClaimInfo(data)
    })
  }, [currentAddress])

  const displayRows = useMemo(() => {
    if (!claimInfo || !rewardsInfo || !marketAprs) return []
    const rows = transformClaimOnChainData(claimInfo, rewardsInfo, marketAprs)

    return rows.filter((market) => Number(market?.totalDepositedValue) > 0)
  }, [claimInfo, rewardsInfo, marketAprs])

  useEffect(() => {
    if (!claimInfo || !rewardsInfo || !marketAprs) return

    setIsLoading(false)
    setMarketsToClaim([])
  }, [claimInfo, rewardsInfo, marketAprs])

  const actionClaim = useCallback(
    (contractAddress: Address, markets: Address[]) => {
      doClaim(contractAddress, markets, rewardsInfo?.length, walletClient!).then(() => {
        setIsLoading(true)
        loadData()
      })
    },
    [currentAddress, rewardsInfo]
  )

  const getSortedRows = (rows: SortedRows, listState: ListState) => {
    const { key, direction } = listState.sort!
    const claimRows = rows as ClaimData[]

    return [...claimRows].sort((elementA: ClaimData, elementB: ClaimData) => {
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
    actionClaim(USG_CONTRACT.REWARD_ACCUMULATOR, marketAddressesToClaim)
  }

  const addToClaimableMarkets = (rowData: ClaimableMarket) => {
    setMarketsToClaim((prevMarkets: ClaimableMarket[]) => {
      const market = prevMarkets.find((market) => market.marketAddress === rowData.marketAddress)

      const marketConfig = USGMarkets.find((m) => m.marketAddress === rowData.marketAddress)

      if (market) {
        return prevMarkets.filter((m) => m.marketAddress !== market.marketAddress)
      } else {
        return [
          ...prevMarkets,
          { marketName: rowData.marketName, claimable: rowData.claimable, marketAddress: rowData.marketAddress, logoKey: marketConfig?.logoKey },
        ]
      }
    })
  }

  const onClickClaimAll = () => {
    if (marketsToClaim.length === displayRows.length) {
      setMarketsToClaim([])
    } else {
      const markets = displayRows.map((el) => {
        const marketConfig = USGMarkets.find((m) => m.marketAddress === el.marketAddress)

        return {
          marketName: el.marketName,
          claimable: el.totalClaimableValue,
          marketAddress: el.marketAddress,
          logoKey: marketConfig?.logoKey,
        } as ClaimableMarket
      })
      setMarketsToClaim(markets)
    }
  }

  const totals = useMemo(() => {
    return {
      totalDeposited: `$${formatMillions(displayRows.reduce((sum, token) => sum + parseFloat(token.totalDepositedValue), 0).toString())}`,
      totalClaimable: formatDollar(displayRows.reduce((sum, token) => sum + parseFloat(token.totalClaimableValue), 0).toString(), 2),
    }
  }, [displayRows])

  const contextValue: USGClaimContextValues = {
    displayRows,
    actionClaim,
    onClickClaim,
    addToClaimableMarkets,
    marketsToClaim,
    isLoading,
    getSortedRows,
    onClickClaimAll,
    USGsUSGMetrics,
    totalDeposited: totals.totalDeposited,
    totalClaimable: totals.totalClaimable,
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
