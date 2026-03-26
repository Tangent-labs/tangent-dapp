"use client"

import { FormState } from "@/types"
import { useUSGContext } from "../../usg_context"
import { toastTx } from "@/components/design_system/toast"
import { useUSGRecordContext } from "../usg_record_context"
import { computeMaxBorrowable } from "../usg_record_controller"
import { doMarketBorrow, getBorrowFormState } from "./usg_record_borrow_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

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
  borrowLoading: boolean
}

export const USGBorrowContext = createContext<USGBorrowContextValues | undefined>(undefined)

export const USGBorrowProvider = ({ children }: USGBorrowContextProps) => {
  const { loadUSGsUSGMetrics } = useUSGContext()

  const { canInteract, walletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, loadOnChainData, setCurrentAmounts } = useUSGRecordContext()

  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()

  const [borrowPercentage, setBorrowPercentage] = useState<number>(0)

  const [borrowLoading, setBorrowLoading] = useState<boolean>(false)

  const actionBorrow = async () => {
    if (!walletClient) return

    setBorrowLoading(true)

    try {
      await toastTx(doMarketBorrow(walletClient, { marketAddress: marketData!.marketAddress, borrowWeiValue }), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({ type: "Success", content: "Borrow successful." }),
        error: () => ({ type: "Error", content: "Borrow failed." }),
      })
      setBorrowWeiValue(undefined)
      loadOnChainData()
      setBorrowPercentage(0)
      loadUSGsUSGMetrics()
    } finally {
      setBorrowLoading(false)
    }
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
    () => getBorrowFormState(marketData, borrowWeiValue, canInteract, maxBorrowableValue, borrowLoading),
    [marketData, borrowWeiValue, canInteract, currentAddress, maxBorrowableValue, borrowLoading]
  )

  const contextValue: USGBorrowContextValues = {
    actionBorrow,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
    borrowPercentage,
    setBorrowPercentage,
    maxBorrowableValue,
    borrowLoading,
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
