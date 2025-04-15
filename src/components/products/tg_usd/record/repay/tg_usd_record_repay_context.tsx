"use client"

import { FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketRepay, getRepayFormState } from "./tg_usd_record_repay_controller"
import { formatUnits } from "viem"

type TgUsdRepayContextProps = {
  children: ReactNode
}

type TgUsdRepayContextValues = {
  actionRepay: () => void
  formState: FormState
  repayWeiValue?: bigint
  setRepayWeiValue: (arg: bigint | undefined) => void
  maxRepayableValue: bigint
  percentage: number
  setPercentage: (arg: number) => void
}

export const TgUsdRepayContext = createContext<TgUsdRepayContextValues | undefined>(undefined)

export const TgUsdRepayProvider = ({ children }: TgUsdRepayContextProps) => {
  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, loadOnChainData, setCurrentAmounts } = useTgUsdRecordContext()

  const [repayWeiValue, setRepayWeiValue] = useState<bigint | undefined>()

  const [percentage, setPercentage] = useState<number>(0)

  useEffect(() => {
    setCurrentAmounts({
      repayWeiValue: repayWeiValue || 0n,
    })
  }, [repayWeiValue])

  const actionRepay = () => {
    const walletClient = getWalletClient()
    if (walletClient) doMarketRepay(walletClient, { marketAddress: marketData!.marketAddress, repayWeiValue }).then(() => loadOnChainData())
  }

  const formState = useMemo(() => getRepayFormState(marketData, repayWeiValue, isWellConnected), [marketData, repayWeiValue, isWellConnected, currentAddress])

  const maxRepayableValue = useMemo(() => {
    if (marketData) {
      return BigInt(marketData.debtInfos.positionDebt)
    }

    return 0n
  }, [marketData])

  useEffect(() => {
    if (marketData && repayWeiValue && maxRepayableValue) {
      const existingDebt = BigInt(marketData.debtInfos.positionDebt)

      const minimumLoan = BigInt(marketData.constants.minimumLoan)
      if (existingDebt - repayWeiValue! > 0n && existingDebt - repayWeiValue! < minimumLoan) {
        const p = Math.round(100 - 300000 / Number(formatUnits(maxRepayableValue, 18)))
        const newValue = maxRepayableValue - minimumLoan

        setTimeout(() => {
          setPercentage(p)
          setRepayWeiValue(newValue)
        }, 500)
      }
    }
  }, [percentage, marketData, repayWeiValue, maxRepayableValue])

  const contextValue: TgUsdRepayContextValues = {
    actionRepay,
    formState,
    repayWeiValue,
    setRepayWeiValue,
    maxRepayableValue,
    percentage,
    setPercentage,
  }

  return <TgUsdRepayContext.Provider value={contextValue}>{children}</TgUsdRepayContext.Provider>
}

export const useTgUsdRepayContext = () => {
  const context = useContext(TgUsdRepayContext)
  if (!context) {
    throw new Error("useTgUsdRepayContext must be used within a TgUsdRepayProvider")
  }
  return context
}
