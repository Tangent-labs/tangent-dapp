"use client"

import { FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketBorrow, getBorrowFormState } from "./usg_record_borrow_controller"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"
import { computeMaxBorrowable } from "../tg_usd_record_controller"
import { useUSGContext } from "../../tg_usd_context"

type USGBorrowContextProps = {
  children: ReactNode
}

type USGBorrowContextValues = {
  actionBorrow: () => void
  formState: FormState
  borrowWeiValue?: bigint
  setBorrowWeiValue: (arg: bigint | undefined) => void
  borrowPercentage: number
  setBorrowPercentage: (arg: number) => void
  maxBorrowableValue: bigint
}

export const USGBorrowContext = createContext<USGBorrowContextValues | undefined>(undefined)

export const USGBorrowProvider = ({ children }: USGBorrowContextProps) => {
  const { loadUSGsUSGMetrics } = useUSGContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, loadOnChainData, setCurrentAmounts } = useUSGRecordContext()

  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()

  const [borrowPercentage, setBorrowPercentage] = useState<number>(0)

  const actionBorrow = () => {
    const walletClient = getWalletClient()
    if (walletClient)
      doMarketBorrow(walletClient, { marketAddress: marketData!.marketAddress, borrowWeiValue })
        .then(() => {
          setBorrowWeiValue(0n)
          loadOnChainData()
          setBorrowPercentage(0)
          loadUSGsUSGMetrics()
        })
        .catch(() => {
          toast.error(ToastComponent, { data: { type: "Error", content: "Borrow failed." } })
        })
  }

  useEffect(() => {
    setCurrentAmounts({
      borrowWeiValue: borrowWeiValue || 0n,
    })
  }, [borrowWeiValue])

  const maxBorrowableValue = useMemo(() => {
    if (marketData?.collateralInfos && currentAddress) {
      const futureDebt = marketData?.debtInfos?.userDebt

      const maxBorrowable = (marketData?.collateralInfos?.positionCollateralUSDValue * marketData?.constants.maxLTV) / BigInt(100000n) - futureDebt

      const computedMaxBorrowable = computeMaxBorrowable(maxBorrowable, marketData?.constants?.maxMarketDebt, marketData?.debtInfos?.totalDebt)

      return computedMaxBorrowable
    }

    return 0n
  }, [marketData, currentAddress])

  const formState = useMemo(
    () => getBorrowFormState(marketData, borrowWeiValue, isWellConnected, maxBorrowableValue),
    [marketData, borrowWeiValue, isWellConnected, currentAddress, maxBorrowableValue]
  )

  const contextValue: USGBorrowContextValues = {
    actionBorrow,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
    borrowPercentage,
    setBorrowPercentage,
    maxBorrowableValue,
  }

  return <USGBorrowContext.Provider value={contextValue}>{children}</USGBorrowContext.Provider>
}

export const useUSGBorrowContext = () => {
  const context = useContext(USGBorrowContext)
  if (!context) {
    throw new Error("useUSGBorrowContext must be used within a USGBorrowProvider")
  }
  return context
}
