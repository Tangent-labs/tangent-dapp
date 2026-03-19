"use client"

import { FormState } from "@/types"
import { useUSGContext } from "../../usg_context"
import { toastTx } from "@/components/design_system/toast"
import { useUSGRecordContext } from "../usg_record_context"
import { doMarketWithdraw, getWithdrawFormState } from "./usg_record_withdraw_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

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
  selectedAsset: string | undefined
  setSelectedAsset: (v: string | undefined) => void
  withdrawLoading: boolean
}

export const USGWithdrawContext = createContext<USGWithdrawContextValues | undefined>(undefined)

export const USGWithdrawProvider = ({ children }: USGWithdrawContextProps) => {
  const WITHDRAW_BUFFER = BigInt(10 ** 16)

  const { loadUSGsUSGMetrics } = useUSGContext()

  const { isWellConnected, walletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, loadOnChainData, setCurrentAmounts, collateralInfo } = useUSGRecordContext()

  const [withdrawWeiValue, setWithdrawWeiValue] = useState<bigint | undefined>()

  const [withdrawPercentage, setWithdrawPercentage] = useState<number>(0)

  const [selectedAsset, setSelectedAsset] = useState<string>()

  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false)

  useEffect(() => {
    if (collateralInfo) {
      setSelectedAsset(collateralInfo.name)
    }
  }, [collateralInfo?.name])

  useEffect(() => {
    setCurrentAmounts({
      withdrawWeiValue: withdrawWeiValue || 0n,
    })
  }, [withdrawWeiValue])

  const actionWithdraw = async () => {
    setWithdrawLoading(true)

    if (walletClient) {
      await toastTx(
        doMarketWithdraw(walletClient, {
          marketAddress: marketData!.marketAddress,
          withdrawWeiValue,
          isReceiptOut: selectedAsset !== collateralInfo?.name,
        }),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => {
            loadUSGsUSGMetrics()
            loadOnChainData()
            setWithdrawWeiValue(undefined)
            setWithdrawPercentage(0)
            setWithdrawLoading(false)
            return { type: "Success", content: "Transaction successful." }
          },
          error: () => {
            setWithdrawLoading(false)
            return { type: "Error", content: "Transaction failed." }
          },
        }
      )
    }
  }

  const maxWithdrawable = useMemo(() => {
    if (marketData && currentAddress) {
      const collateralPriceRaw = marketData?.collateralInfos?.collateralUSDPrice
      const futureDebt = marketData?.debtInfos?.userDebt
      const futureDeposited = BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n)
      const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
      const maxWithDrawable = collateralPriceRaw !== 0n ? futureDeposited - (futureDebt * BigInt(10 ** 18)) / ((collateralPriceRaw * maxLTV) / 100n) : 0n

      if (futureDebt === 0n) {
        return maxWithDrawable > 0n ? maxWithDrawable : 0n
      }

      return maxWithDrawable > WITHDRAW_BUFFER ? maxWithDrawable - WITHDRAW_BUFFER : 0n
    }

    return 0n
  }, [marketData, currentAddress])

  const formState = useMemo(() => {
    if (marketData) {
      return getWithdrawFormState(marketData, withdrawWeiValue!, maxWithdrawable, isWellConnected)
    }
    return { canProcess: false, cantProcessReasons: [], haveToApprove: false }
  }, [marketData, withdrawWeiValue, isWellConnected, currentAddress, maxWithdrawable])

  useEffect(() => {
    setWithdrawWeiValue(undefined)
    setWithdrawPercentage(0)
  }, [selectedAsset, marketData])

  const contextValue: USGWithdrawContextValues = {
    actionWithdraw,
    formState,
    withdrawWeiValue,
    setWithdrawWeiValue,
    withdrawPercentage,
    maxWithdrawable,
    setWithdrawPercentage,
    setSelectedAsset,
    selectedAsset,
    withdrawLoading,
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
