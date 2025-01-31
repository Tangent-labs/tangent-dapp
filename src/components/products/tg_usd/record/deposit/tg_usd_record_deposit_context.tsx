"use client"

import { TgUsdMarket, ZapperData, ZapToken } from "../../tg_usd_type"
import { AssetDataPriced, FormState } from "@/types"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { computeSwapAssetPrice, doApproveMarketDeposit, doMarketDeposit, getDepositFormState, getEnsoRouteForZap } from "./tg_usd_record_deposit_controller"

type TgUsdDepositContextProps = {
  children: ReactNode
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
  tokens: ZapToken[]
}

type TgUsdDepositContextValues = {
  marketInfo: TgUsdMarket
  collateralInfo: AssetDataPriced
  isStaking: boolean
  setIsStaking: (arg: boolean) => void
  isDepositAndBorrow: boolean
  setIsDepositAndBorrow: (arg: boolean) => void
  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void
  actionDeposit: () => void
  actionApprove: () => void
  formState: FormState
  borrowWeiValue?: bigint
  setBorrowWeiValue: (arg: bigint | undefined) => void
  setDepositAsset: (arg: string) => void
  depositAsset: string | undefined
  tokens: ZapToken[]
  ensoData: ZapperData | null
  isLoading: boolean
  setIsLoading: (arg: boolean) => void
  swapAssetPrice: number | null
}

export const TgUsdDepositContext = createContext<TgUsdDepositContextValues | undefined>(undefined)

export const TgUsdDepositProvider = ({ children, collateralInfo, marketInfo, tokens }: TgUsdDepositContextProps) => {
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [isDepositAndBorrow, setIsDepositAndBorrow] = useState<boolean>(false)
  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()
  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()
  const { marketData, loadOnChainData, setCurrentAmounts } = useTgUsdRecordContext()
  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()
  const [depositAsset, setDepositAsset] = useState<string | undefined>(undefined)

  const [ensoData, setEnsoData] = useState<ZapperData | null>(null)
  const [swapAssetPrice, setSwapAssetPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!ensoData || !depositAsset) return

    const fetchSwapAssetData = async () => {
      setIsLoading(true)
      try {
        const data = await computeSwapAssetPrice(tokens, depositAsset)
        setSwapAssetPrice(data)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSwapAssetData()
  }, [ensoData])

  useEffect(() => {
    if (!depositWeiValue || !currentAddress || !depositAsset) return

    const fetchEnsoData = async () => {
      setIsLoading(true)
      try {
        const data = await getEnsoRouteForZap(depositWeiValue, currentAddress, collateralInfo, tokens, depositAsset)
        setEnsoData(data)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnsoData()
  }, [depositWeiValue, depositAsset, currentAddress])

  useEffect(() => {
    setCurrentAmounts({
      depositWeiValue: depositWeiValue || 0n,
      borrowWeiValue: borrowWeiValue || 0n,
    })
  }, [depositWeiValue, borrowWeiValue])

  const actionApprove = () => {
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue)
      doApproveMarketDeposit(walletClient, collateralInfo?.address, {
        depositWeiValue,
        isDepositAndBorrow,
        isStaking,
        marketAddress: marketInfo?.marketAddress,
      }).then(() => loadOnChainData())
  }

  const actionDeposit = () => {
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue)
      doMarketDeposit(walletClient, { depositWeiValue, isDepositAndBorrow, isStaking, marketAddress: marketInfo?.marketAddress, borrowWeiValue }).then(() =>
        loadOnChainData()
      )
  }

  const formState = useMemo(
    () => getDepositFormState(marketData, depositWeiValue, borrowWeiValue, isDepositAndBorrow, isWellConnected),
    [marketData, isDepositAndBorrow, borrowWeiValue, depositWeiValue, isWellConnected, currentAddress]
  )

  const contextValue: TgUsdDepositContextValues = {
    marketInfo,
    collateralInfo,
    isStaking,
    setIsStaking,
    isDepositAndBorrow,
    setIsDepositAndBorrow,
    depositWeiValue,
    setDepositWeiValue,
    actionApprove,
    actionDeposit,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
    setDepositAsset,
    depositAsset,
    tokens,
    ensoData,
    isLoading,
    setIsLoading,
    swapAssetPrice,
  }

  return <TgUsdDepositContext.Provider value={contextValue}>{children}</TgUsdDepositContext.Provider>
}

export const useTgUsdDepositContext = () => {
  const context = useContext(TgUsdDepositContext)
  if (!context) {
    throw new Error("useTgUsdDepositContext must be used within a TgUsdDepositProvider")
  }
  return context
}
