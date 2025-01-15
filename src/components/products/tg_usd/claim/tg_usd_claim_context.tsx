"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Address } from "viem"
import { AssetDataPriced, ListState } from "@/types"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { ClaimableMarket, ClaimData, ClaimerInfo } from "../tg_usd_type"
import { computeAndReturnPrices, doClaim, getTgUsdClaimOnChainData, transformClaimOnChainData } from "./tg_usd_claim_controller"

type TgUsdClaimContextProps = {
  children: ReactNode
}

type TgUsdClaimContextValues = {
  isLoading: boolean
  displayRows: ClaimData[]
  actionClaim: (arg: Address, markets: Address[]) => void
  onClickClaim: (marketsToClaim: ClaimableMarket[]) => void
  addToClaimableMarkets: (rowData: ClaimableMarket) => void
  marketsToClaim: ClaimableMarket[]
  customSort: (arg: ListState) => void
}

export const TgUsdClaimContext = createContext<TgUsdClaimContextValues | undefined>(undefined)

export const TgUsdClaimProvider = ({ children }: TgUsdClaimContextProps) => {
  const rewardAccumulatorContractAddress = "0x01D4648B896F53183d652C02619c226727477C82"

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [claimInfo, setClaimInfo] = useState<ClaimerInfo[] | undefined>()
  const [rewardsInfo, setRewardsInfo] = useState<AssetDataPriced[]>()
  const [marketsToClaim, setMarketsToClaim] = useState<ClaimableMarket[]>([])

  const { getWalletClient, currentAddress } = useWalletConnexionContext()

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
  }, [])

  const loadData = useCallback(() => {
    getTgUsdClaimOnChainData().then((data) => {
      setClaimInfo(data)
    })
  }, [])

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
    actionClaim(rewardAccumulatorContractAddress, marketAddressesToClaim)
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

  const contextValue: TgUsdClaimContextValues = {
    displayRows,
    actionClaim,
    onClickClaim,
    addToClaimableMarkets,
    marketsToClaim,
    isLoading,
    customSort,
  }

  return <TgUsdClaimContext.Provider value={contextValue}>{children}</TgUsdClaimContext.Provider>
}

export const useTgUsdClaimContext = () => {
  const context = useContext(TgUsdClaimContext)
  if (!context) {
    throw new Error("useTgUsdClaimContext must be used within a TgUsdClaimProvider")
  }
  return context
}
