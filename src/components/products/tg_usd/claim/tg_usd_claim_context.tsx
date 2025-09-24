"use client"

import { Address } from "viem"
import { USG_CONTRACT } from "../tg_usd_repository"
import { AssetDataPriced, ListState } from "@/types"
import { ClaimableMarket, ClaimData, ClaimerInfo } from "../tg_usd_type"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { computeAndReturnPrices, doClaim, getTgUsdClaimOnChainData, transformClaimOnChainData } from "./tg_usd_claim_controller"

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
  customSort: (arg: ListState) => void
}

export const USGClaimContext = createContext<USGClaimContextValues | undefined>(undefined)

export const USGClaimProvider = ({ children }: USGClaimContextProps) => {
  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [claimInfo, setClaimInfo] = useState<ClaimerInfo[] | undefined>()

  const [rewardsInfo, setRewardsInfo] = useState<AssetDataPriced[]>()

  const [marketsToClaim, setMarketsToClaim] = useState<ClaimableMarket[]>([])

  useEffect(() => {
    loadPrices()
  }, [claimInfo])

  const loadPrices = async () => {
    if (!claimInfo) return
    const allInfos = await computeAndReturnPrices(claimInfo)
    setRewardsInfo(allInfos)
  }

  useEffect(() => {
    loadData()
  }, [currentAddress])

  const loadData = useCallback(() => {
    if (currentAddress) {
      getTgUsdClaimOnChainData(currentAddress).then((data) => {
        setClaimInfo(data)
      })
    }
  }, [currentAddress])

  const displayRows = useMemo(() => {
    if (!claimInfo || !rewardsInfo) return []
    const rows = transformClaimOnChainData(claimInfo, rewardsInfo)
    setIsLoading(false)
    setMarketsToClaim([])
    return rows
  }, [claimInfo, rewardsInfo])

  const actionClaim = useCallback(
    (contractAddress: Address, markets: Address[]) => {
      const walletClient = getWalletClient()
      doClaim(contractAddress, markets, rewardsInfo?.length, walletClient!).then(() => {
        setIsLoading(true)
        loadData()
      })
    },
    [currentAddress, rewardsInfo]
  )

  const customSort = (listState: ListState) => {
    const { key, direction } = listState.sort!

    displayRows.sort((elementA: ClaimData, elementB: ClaimData) => {
      const aValue = elementA[key as keyof ClaimData]
      const bValue = elementB[key as keyof ClaimData]

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
      const market = prevMarkets.find((market) => market.marketName === rowData.marketName)

      if (market) {
        return prevMarkets.filter((m) => m.marketName !== market.marketName)
      } else {
        return [...prevMarkets, { marketName: rowData.marketName, claimable: rowData.claimable, marketAddress: rowData.marketAddress }]
      }
    })
  }

  const contextValue: USGClaimContextValues = {
    displayRows,
    actionClaim,
    onClickClaim,
    addToClaimableMarkets,
    marketsToClaim,
    isLoading,
    customSort,
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
