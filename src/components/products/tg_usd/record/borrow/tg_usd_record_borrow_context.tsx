"use client"

import { FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketBorrow, getBorrowFormState } from "./tg_usd_record_borrow_controller"

const DECIMALS = BigInt(10 ** 18)

type TgUsdBorrowContextProps = {
  children: ReactNode
}

type TgUsdBorrowContextValues = {
  actionBorrow: () => void
  formState: FormState
  borrowWeiValue?: bigint
  setBorrowWeiValue: (arg: bigint | undefined) => void
  borrowPercentage: number
  setBorrowPercentage: (arg: number) => void
  maxBorrowableValue: bigint
}

export const TgUsdBorrowContext = createContext<TgUsdBorrowContextValues | undefined>(undefined)

export const TgUsdBorrowProvider = ({ children }: TgUsdBorrowContextProps) => {
  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, loadOnChainData, setCurrentAmounts } = useTgUsdRecordContext()

  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()

  const [borrowPercentage, setBorrowPercentage] = useState<number>(0)

  const actionBorrow = () => {
    const walletClient = getWalletClient()
    if (walletClient)
      doMarketBorrow(walletClient, { marketAddress: marketData!.marketAddress, borrowWeiValue }).then(() => {
        setBorrowWeiValue(0n)
        loadOnChainData()
        setBorrowPercentage(0)
      })
  }

  useEffect(() => {
    setCurrentAmounts({
      borrowWeiValue: borrowWeiValue || 0n,
    })
  }, [borrowWeiValue])

  const maxBorrowableValue = useMemo(() => {
    if (marketData?.collateralInfos) {
      const collateralPriceRaw = BigInt(marketData?.collateralInfos?.collateralUSDPrice || 0n)
      const futureDebt = BigInt(marketData?.debtInfos?.positionDebt || 0n)
      const futureDeposited = BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n)
      const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
      const maxBorrowable = (futureDeposited * maxLTV) / 100n - (futureDebt * DECIMALS) / collateralPriceRaw

      return maxBorrowable
    }

    return 0n
  }, [marketData])

  const formState = useMemo(
    () => getBorrowFormState(marketData, borrowWeiValue, isWellConnected),
    [marketData, borrowWeiValue, isWellConnected, currentAddress]
  )

  const contextValue: TgUsdBorrowContextValues = {
    actionBorrow,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
    borrowPercentage,
    setBorrowPercentage,
    maxBorrowableValue,
  }

  return <TgUsdBorrowContext.Provider value={contextValue}>{children}</TgUsdBorrowContext.Provider>
}

export const useTgUsdBorrowContext = () => {
  const context = useContext(TgUsdBorrowContext)
  if (!context) {
    throw new Error("useTgUsdBorrowContext must be used within a TgUsdBorrowProvider")
  }
  return context
}
