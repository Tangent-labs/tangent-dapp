"use client"

import { TgUsdMarket, ZapToken } from "../../tg_usd_type"
import { AssetDataPriced, FormState } from "@/types"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import {
  computeSwapAssetPrice,
  doApproveMarketDeposit,
  doMarketDeposit,
  getDepositFormState,
  getTokenInQuote,
  getTokenOutQuote,
} from "./tg_usd_record_deposit_controller"
import { parseEther } from "viem"

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
  isLoading: boolean
  setIsLoading: (arg: boolean) => void
  swapAssetPrice: number | null

  zapValue: bigint | null
  setZapValue: (arg: bigint) => void
  handleDepositChange: (arg: bigint | undefined) => void
  handleZapChange: (arg: string) => void
}

export const TgUsdDepositContext = createContext<TgUsdDepositContextValues | undefined>(undefined)

export const TgUsdDepositProvider = ({ children, collateralInfo, marketInfo, tokens }: TgUsdDepositContextProps) => {
  const { marketData, loadOnChainData, setCurrentAmounts } = useTgUsdRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [isDepositAndBorrow, setIsDepositAndBorrow] = useState<boolean>(false)
  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()
  const [depositAsset, setDepositAsset] = useState<string | undefined>(undefined)
  const [swapAssetPrice, setSwapAssetPrice] = useState<number | null>(null)
  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()
  const [zapValue, setZapValue] = useState<bigint | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !currentAddress || !depositAsset) return

      setIsLoading(true)
      try {
        const data = await getTokenOutQuote(value, currentAddress, collateralInfo, tokens, depositAsset)

        if (data) {
          setZapValue(data.amountOut)
        }
      } catch (error) {
        console.error("Error fetching zap value:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchZapValue()
  }

  const handleZapChange = (value: string) => {
    setZapValue(parseEther(value))

    if (value === "") {
      setDepositWeiValue(undefined)
      return
    }

    const debounceTimeout = setTimeout(async () => {
      if (!parseEther(value) || !currentAddress || !depositAsset) return
      setIsLoading(true)

      try {
        const data = await getTokenInQuote(parseEther(value), currentAddress, collateralInfo, tokens, depositAsset)
        if (data) {
          setDepositWeiValue(data.amountOut)
        }
      } catch (error) {
        console.error("Error fetching depositWeiValue:", error)
      } finally {
        setIsLoading(false)
      }
    }, 1000)

    return () => clearTimeout(debounceTimeout)
  }

  useEffect(() => {
    if (!depositAsset) return

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
  }, [depositAsset])

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
    isLoading,
    setIsLoading,
    zapValue,
    setZapValue,
    handleDepositChange,
    handleZapChange,
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
