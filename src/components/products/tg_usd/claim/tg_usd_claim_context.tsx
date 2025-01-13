"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Address } from "viem"
import { AssetDataPriced } from "@/types"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { ClaimableMarket, ClaimData, ClaimerInfo } from "../tg_usd_type"
import { computeAndReturnPrices, doClaim, getTgUsdClaimOnChainData, transformClaimOnChainData } from "./tg_usd_claim_controller"

type TgUsdClaimContextProps = {
  children: ReactNode
}

type TgUsdClaimContextValues = {
  displayRows: ClaimData[]
  actionClaim: (arg: Address, markets: Address[]) => void
  onClickClaim: (marketsToClaim: ClaimableMarket[]) => void
  addToClaimableMarkets: (rowData: ClaimableMarket) => void
  marketsToClaim: ClaimableMarket[]
}

export const TgUsdClaimContext = createContext<TgUsdClaimContextValues | undefined>(undefined)

export const TgUsdClaimProvider = ({ children }: TgUsdClaimContextProps) => {
  const rewardAccumulatorContractAddress = "0xDC0a0B1Cd093d321bD1044B5e0Acb71b525ABb6b"

  const [claimInfo, setClaimInfo] = useState<ClaimerInfo[] | undefined>()
  const [rewardsInfo, setRewardsInfo] = useState<AssetDataPriced[] | undefined>()
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

    return rows
  }, [claimInfo, rewardsInfo])

  const actionClaim = useCallback(
    (contractAddress: Address, markets: Address[]) => {
      const walletClient = getWalletClient()
      doClaim(contractAddress, markets, rewardsInfo?.length || 1, walletClient!).then(loadData)
    },
    [currentAddress]
  )

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
