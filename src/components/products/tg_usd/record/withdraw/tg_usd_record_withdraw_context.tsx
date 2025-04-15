"use client"

import { FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketWithdraw, getWithdrawFormState } from "./tg_usd_record_withdraw_controller"

type TgUsdWithdrawContextProps = {
  children: ReactNode
}

type TgUsdWithdrawContextValues = {
  actionWithdraw: () => void
  formState: FormState
  withdrawWeiValue?: bigint
  setWithdrawWeiValue: (arg: bigint | undefined) => void
  percentage: number
  setPercentage: (arg: number) => void
  maxWithdrawable: bigint
}

export const TgUsdWithdrawContext = createContext<TgUsdWithdrawContextValues | undefined>(undefined)

export const TgUsdWithdrawProvider = ({ children }: TgUsdWithdrawContextProps) => {
  const { marketData, loadOnChainData, setCurrentAmounts, collateralInfo } = useTgUsdRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [withdrawWeiValue, setWithdrawWeiValue] = useState<bigint | undefined>()

  const [percentage, setPercentage] = useState<number>(0)

  useEffect(() => {
    setCurrentAmounts({
      withdrawWeiValue: withdrawWeiValue || 0n,
    })
  }, [withdrawWeiValue])

  const actionWithdraw = () => {
    const walletClient = getWalletClient()
    if (walletClient) doMarketWithdraw(walletClient, { marketAddress: marketData!.marketAddress, withdrawWeiValue }).then(() => loadOnChainData())
  }

  const formState = useMemo(
    () => getWithdrawFormState(marketData, withdrawWeiValue, collateralInfo, isWellConnected),
    [marketData, withdrawWeiValue, isWellConnected, currentAddress]
  )

  const maxWithdrawable = useMemo(() => {
    if (marketData) {
      const collateralPriceRaw = BigInt(marketData?.collateralInfos?.collateralUSDPrice || 0n)
      const futureDebt = BigInt(marketData?.debtInfos?.positionDebt || 0n)
      const futureDeposited = BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n)
      const futureDepositedDollarRaw = (futureDeposited * collateralPriceRaw) / BigInt(10 ** 18)
      const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
      const maxWithDrawable =
        collateralPriceRaw !== 0n ? futureDepositedDollarRaw - (futureDebt * BigInt(10 ** 18)) / ((collateralPriceRaw * maxLTV) / 100n) : 0n

      return maxWithDrawable
    }

    return 0n
  }, [marketData])

  const contextValue: TgUsdWithdrawContextValues = {
    actionWithdraw,
    formState,
    withdrawWeiValue,
    setWithdrawWeiValue,
    percentage,
    maxWithdrawable,
    setPercentage,
  }

  return <TgUsdWithdrawContext.Provider value={contextValue}>{children}</TgUsdWithdrawContext.Provider>
}

export const useTgUsdWithdrawContext = () => {
  const context = useContext(TgUsdWithdrawContext)
  if (!context) {
    throw new Error("useTgUsdWithdrawContext must be used within a TgUsdWithdrawProvider")
  }
  return context
}
