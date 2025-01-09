"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Address } from "viem"
import { AssetDataPriced } from "@/types"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { ClaimData, ClaimerInfo } from "../tg_usd_type"
import { computeAndReturnPrices, doClaim, getTgUsdClaimOnChainData, transformClaimOnChainData } from "./tg_usd_claim_controller"

type TgUsdClaimContextProps = {
  children: ReactNode
}

type TgUsdClaimContextValues = {
  isLoading: boolean
  displayRows: ClaimData[]
  actionClaim: (arg: Address, markets: Address[]) => void
}

export const TgUsdClaimContext = createContext<TgUsdClaimContextValues | undefined>(undefined)

export const TgUsdClaimProvider = ({ children }: TgUsdClaimContextProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [claimInfo, setClaimInfo] = useState<ClaimerInfo[] | undefined>()
  const [rewardsInfo, setRewardsInfo] = useState<AssetDataPriced[] | undefined>()

  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    setIsLoading(true)
    loadPrices()
  }, [claimInfo])

  const loadPrices = async () => {
    if (!claimInfo) return

    const allInfos = await computeAndReturnPrices(claimInfo)

    setRewardsInfo(allInfos)
  }

  useEffect(() => {
    setIsLoading(true)
    loadData()
  }, [])

  const loadData = useCallback(() => {
    getTgUsdClaimOnChainData().then((data) => {
      setClaimInfo(data)
      setIsLoading(false)
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

  const contextValue: TgUsdClaimContextValues = {
    isLoading,
    displayRows,
    actionClaim,
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
