"use client"

import { AssetApr, AssetDataPriced } from "@/types"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { getBoosterListData } from "../booster_list/booster_list_controller"
import { BoosterClaimListRow, BoosterExistingAsset, OutputBoosterList } from "../booster_type"
import { getBoosterApr } from "../booster_controller"
import { doClaimAll, transformBoosterClaimList, transformBoosterClaimTotals, transformCallData } from "./booster_claim_controller"
import { useEffectDebounce } from "@/hooks/useDebounce"
import { Address } from "viem"

type BoosterClaimContextProps = {
  children: ReactNode
  rewardsInfo: AssetDataPriced[]
  assetsInfos: Record<BoosterExistingAsset, AssetDataPriced>
}

type BoosterClaimContextValues = {
  rewardsInfo: AssetDataPriced[]
  displayRows?: BoosterClaimListRow[]
  actionClaim: (arg: Address) => void
  actionClaimAll: () => void
  totals: {
    depositedDollarValue: number
    claimableDollarValue: number
  }
}

export const BoosterClaimContext = createContext<BoosterClaimContextValues | undefined>(undefined)

export const BoosterClaimProvider = ({ children, rewardsInfo, assetsInfos }: BoosterClaimContextProps) => {
  const [rows, setRows] = useState<OutputBoosterList | undefined>()
  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  const [aprs, setAprs] = useState<Record<BoosterExistingAsset, AssetApr> | undefined>()

  const loadData = () => {
    getBoosterListData(currentAddress).then((data) => {
      setRows(data)
    })
  }

  useEffectDebounce(
    () => {
      loadData()
    },
    [currentAddress],
    1000
  )

  useEffect(() => {
    loadApr()
  }, [])

  const loadApr = useCallback(() => {
    getBoosterApr().then(setAprs)
  }, [])

  const displayRows = useMemo(() => {
    return transformBoosterClaimList(rows, aprs, assetsInfos, rewardsInfo)
  }, [rows, aprs])

  const totals = useMemo(() => {
    return transformBoosterClaimTotals(rows, rewardsInfo)
  }, [rows])

  const actionClaim = (stakingAddress: Address) => {
    const args = transformCallData(displayRows, [stakingAddress])
    const walletClient = getWalletClient()
    doClaimAll(args, walletClient!).then(loadData)
  }

  const actionClaimAll = () => {
    const args = transformCallData(
      displayRows,
      displayRows.map((row) => row.stakingAddress)
    )
    const walletClient = getWalletClient()
    doClaimAll(args, walletClient!).then(loadData)
  }

  const contextValue: BoosterClaimContextValues = {
    rewardsInfo,
    displayRows,
    actionClaim,
    actionClaimAll,
    totals,
  }
  return <BoosterClaimContext.Provider value={contextValue}>{children}</BoosterClaimContext.Provider>
}

export const useBoosterClaimContext = () => {
  const context = useContext(BoosterClaimContext)
  if (!context) {
    throw new Error("useBoosterClaimContext must be used within a BoosterClaimProvider")
  }
  return context
}
