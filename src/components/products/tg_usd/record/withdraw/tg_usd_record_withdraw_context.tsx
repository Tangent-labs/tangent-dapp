"use client"

import { FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketWithdraw, getWithdrawFormState } from "./tg_usd_record_withdraw_controller"
import { maxUint256 } from "viem"

type TgUsdWithdrawContextProps = {
  children: ReactNode
}

type TgUsdWithdrawContextValues = {
  actionWithdraw: () => void
  formState: FormState
  withdrawWeiValue?: bigint
  setWithdrawWeiValue: (arg: bigint | undefined) => void
  withdrawPercentage: number
  setWithdrawPercentage: (arg: number) => void
  maxWithdrawable: bigint
}

export const TgUsdWithdrawContext = createContext<TgUsdWithdrawContextValues | undefined>(undefined)

export const TgUsdWithdrawProvider = ({ children }: TgUsdWithdrawContextProps) => {
  const { marketData, loadOnChainData, setCurrentAmounts } = useTgUsdRecordContext()

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
        withdrawWeiValue: withdrawPercentage === 100 ? maxUint256 : withdrawWeiValue,
      }).then(() => {
        loadOnChainData()
        setWithdrawWeiValue(0n)
        setWithdrawPercentage(0)
      })
  }

  const maxWithdrawable = useMemo(() => {
    if (marketData) {
      const collateralPriceRaw = marketData?.collateralInfos?.collateralUSDPrice
      const futureDebt = marketData?.debtInfos?.userDebt
      const futureDeposited = BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n)
      const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
      const maxWithDrawable = collateralPriceRaw !== 0n ? futureDeposited - (futureDebt * BigInt(10 ** 18)) / ((collateralPriceRaw * maxLTV) / 100n) : 0n

      return maxWithDrawable > 0n ? maxWithDrawable : 0n
    }

    return 0n
  }, [marketData])

  const formState = useMemo(() => {
    if (marketData) {
      return getWithdrawFormState(marketData, withdrawWeiValue!, maxWithdrawable, isWellConnected)
    }
    return { canProcess: false, cantProcessReasons: [], haveToApprove: false }
  }, [marketData, withdrawWeiValue, isWellConnected, currentAddress, maxWithdrawable])

  const contextValue: TgUsdWithdrawContextValues = {
    actionWithdraw,
    formState,
    withdrawWeiValue,
    setWithdrawWeiValue,
    withdrawPercentage,
    maxWithdrawable,
    setWithdrawPercentage,
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
