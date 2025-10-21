"use client"

import { FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketWithdraw, getWithdrawFormState } from "./usg_record_withdraw_controller"
import { useUSGContext } from "../../tg_usd_context"

type USGWithdrawContextProps = {
  children: ReactNode
}

type USGWithdrawContextValues = {
  actionWithdraw: () => void
  formState: FormState
  withdrawWeiValue?: bigint
  setWithdrawWeiValue: (arg: bigint | undefined) => void
  withdrawPercentage: number
  setWithdrawPercentage: (arg: number) => void
  maxWithdrawable: bigint
}

export const USGWithdrawContext = createContext<USGWithdrawContextValues | undefined>(undefined)

export const USGWithdrawProvider = ({ children }: USGWithdrawContextProps) => {
  const { loadUSGsUSGMetrics } = useUSGContext()

  const { marketData, loadOnChainData, setCurrentAmounts } = useUSGRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [withdrawWeiValue, setWithdrawWeiValue] = useState<bigint | undefined>()

  const [withdrawPercentage, setWithdrawPercentage] = useState<number>(0)

  useEffect(() => {
    setCurrentAmounts({
      withdrawWeiValue: withdrawWeiValue || 0n,
    })
  }, [withdrawWeiValue])

  const actionWithdraw = () => {
    const walletClient = getWalletClient()
    if (walletClient)
      doMarketWithdraw(walletClient, {
        marketAddress: marketData!.marketAddress,
        withdrawWeiValue,
      }).then(() => {
        loadUSGsUSGMetrics()
        loadOnChainData()
        setWithdrawWeiValue(0n)
        setWithdrawPercentage(0)
      })
  }

  const maxWithdrawable = useMemo(() => {
    if (marketData && currentAddress) {
      const collateralPriceRaw = marketData?.collateralInfos?.collateralUSDPrice
      const futureDebt = marketData?.debtInfos?.userDebt
      const futureDeposited = BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n)
      const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
      const maxWithDrawable = collateralPriceRaw !== 0n ? futureDeposited - (futureDebt * BigInt(10 ** 18)) / ((collateralPriceRaw * maxLTV) / 100n) : 0n

      return maxWithDrawable > 0n ? maxWithDrawable : 0n
    }

    return 0n
  }, [marketData, currentAddress])

  const formState = useMemo(() => {
    if (marketData) {
      return getWithdrawFormState(marketData, withdrawWeiValue!, maxWithdrawable, isWellConnected)
    }
    return { canProcess: false, cantProcessReasons: [], haveToApprove: false }
  }, [marketData, withdrawWeiValue, isWellConnected, currentAddress, maxWithdrawable])

  const contextValue: USGWithdrawContextValues = {
    actionWithdraw,
    formState,
    withdrawWeiValue,
    setWithdrawWeiValue,
    withdrawPercentage,
    maxWithdrawable,
    setWithdrawPercentage,
  }

  return <USGWithdrawContext.Provider value={contextValue}>{children}</USGWithdrawContext.Provider>
}

export const useUSGWithdrawContext = () => {
  const context = useContext(USGWithdrawContext)
  if (!context) {
    throw new Error("useUSGWithdrawContext must be used within a USGWithdrawProvider")
  }
  return context
}
