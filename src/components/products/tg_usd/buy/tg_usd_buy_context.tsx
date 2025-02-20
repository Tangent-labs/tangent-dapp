"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { BalanceAllowanceData, ZapToken } from "../tg_usd_type"
import { Address } from "viem"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { computeSwapAssetPrice, getBalances, getZapTokenBalanceAllowance } from "./tg_usd_buy_controller"
import { AssetDataPriced } from "@/types"
import { getTokenInQuote, getTokenOutQuote } from "./buy_actions"

type TgUsdBuyContextProps = {
  children: ReactNode
  tokens: ZapToken[]
}

type TgUsdBuyContextValues = {
  isLoading: boolean

  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void

  receiveWeiValue?: bigint
  setReceiveWeiValue: (arg: bigint | undefined) => void

  setDepositAsset: (arg: string) => void
  depositAsset: string | undefined

  setIsBuying: (arg: boolean) => void
  isBuying: boolean

  setReceiveAsset: (arg: string) => void
  receiveAsset: string | undefined

  tokens: ZapToken[]

  isZapLoading: boolean
  setIsSwapLoading: (arg: boolean) => void

  balances: Record<Address, bigint> | null

  swapAssetPrice: number | null

  depositAssetInfo: AssetDataPriced | null

  receiveAssetInfo: AssetDataPriced | null

  balanceAllowanceData: BalanceAllowanceData | null

  handleDepositChange: (arg: bigint | undefined) => void

  handleReceiveChange: (arg: bigint | undefined) => void
}

export const TgUsdBuyContext = createContext<TgUsdBuyContextValues | undefined>(undefined)

export const TgUsdBuyProvider = ({ children, tokens }: TgUsdBuyContextProps) => {
  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [isBuying, setIsBuying] = useState<boolean>(true)

  const [receiveAsset, setReceiveAsset] = useState<string | undefined>(undefined)

  const [depositAsset, setDepositAsset] = useState<string | undefined>(undefined)

  const [isZapLoading, setIsSwapLoading] = useState(false)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [receiveWeiValue, setReceiveWeiValue] = useState<bigint | undefined>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number | null>(null)

  const [swapedAssetPrice, setSwapedAssetPrice] = useState<number | null>(null)

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

  const [balanceAllowanceData, setBalanceAllowanceData] = useState<BalanceAllowanceData | null>(null)

  const receiveAssetInfo = useMemo(() => {
    if (receiveAsset === "ETH") {
      return {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        displayDecimals: 5,
        symbol: "ETH",
        name: "ETH",
        price: swapedAssetPrice,
      } as AssetDataPriced
    }

    const assetInfo = tokens.find((el: ZapToken) => el.name === receiveAsset) || undefined

    if (!swapedAssetPrice || !assetInfo) return null

    const asset: AssetDataPriced = {
      address: assetInfo?.address,
      decimals: assetInfo?.decimals,
      displayDecimals: 2,
      symbol: assetInfo?.symbol,
      name: assetInfo?.name,
      price: swapedAssetPrice,
    }

    return asset
  }, [receiveAsset, swapedAssetPrice])

  const depositAssetInfo = useMemo(() => {
    if (depositAsset === "ETH") {
      return {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        displayDecimals: 5,
        symbol: "ETH",
        name: "ETH",
        price: swapAssetPrice,
      } as AssetDataPriced
    }

    const assetInfo = tokens.find((el: ZapToken) => el.name === depositAsset) || undefined

    if (!swapAssetPrice || !assetInfo) return null

    const asset: AssetDataPriced = {
      address: assetInfo?.address,
      decimals: assetInfo?.decimals,
      displayDecimals: 2,
      symbol: assetInfo?.symbol,
      name: assetInfo?.name,
      price: swapAssetPrice,
    }

    return asset
  }, [depositAsset, swapAssetPrice])

  const fetchBalanceAllowanceData = async () => {
    if (!depositAssetInfo) return

    try {
      const walletClient = getWalletClient()
      if (!walletClient) throw new Error("Wallet client not found")

      const data = await getZapTokenBalanceAllowance(walletClient, depositAssetInfo.address)

      setBalanceAllowanceData(data ? (data[0] as BalanceAllowanceData) : null)
    } catch (error) {
      console.error("Failed to fetch balance/allowance:", error)
    }
  }

  useEffect(() => {
    const tokenAddresses: Address[] = tokens.map((el) => el.address)

    if (currentAddress && tokenAddresses.length > 0) {
      getBalances(currentAddress, tokenAddresses).then((data) => {
        if (data) {
          const tokenBalances = tokenAddresses.reduce(
            (acc, address, index) => {
              acc[address] = data[index] || BigInt(0)
              return acc
            },
            {} as Record<Address, bigint>
          )
          setIsLoading(false)
          setBalances(tokenBalances)
        }
      })
    }
  }, [currentAddress, tokens])

  const handleReceiveChange = (value: bigint | undefined) => {
    setReceiveWeiValue(value)

    const fetchValue = async () => {
      if (!value || !currentAddress || !depositAssetInfo || !receiveAssetInfo) return

      setIsSwapLoading(true)
      try {
        const data = await getTokenInQuote(value, currentAddress, receiveAssetInfo, depositAssetInfo)

        if (data) {
          setDepositWeiValue(data.amountOut)
        }
      } catch (error) {
        console.error("Error fetching zap value:", error)
      } finally {
        setIsSwapLoading(false)
      }
    }

    fetchValue()
  }

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)

    const fetchSwapValue = async () => {
      if (!value || !currentAddress || !depositAssetInfo || !receiveAssetInfo) return

      setIsSwapLoading(true)
      try {
        const data = await getTokenOutQuote(value, currentAddress, depositAssetInfo, receiveAssetInfo)

        if (data) {
          setReceiveWeiValue(data.amountOut)
        }
      } catch (error) {
        console.error("Error fetching zap value:", error)
      } finally {
        setIsSwapLoading(false)
      }
    }

    fetchSwapValue()
  }

  useEffect(() => {
    if (!receiveAsset) return

    const fetchSwapAssetData = async () => {
      setIsSwapLoading(true)
      try {
        const data = await computeSwapAssetPrice(tokens, receiveAsset)
        setSwapedAssetPrice(data)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsSwapLoading(false)
      }
    }

    fetchSwapAssetData()
  }, [receiveAsset])

  useEffect(() => {
    if (!depositAsset) return

    const fetchSwapAssetData = async () => {
      setIsSwapLoading(true)
      try {
        const data = await computeSwapAssetPrice(tokens, depositAsset)
        setSwapAssetPrice(data)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsSwapLoading(false)
      }
    }

    fetchSwapAssetData()
  }, [depositAsset])

  useEffect(() => {
    fetchBalanceAllowanceData()
  }, [depositAssetInfo])

  const contextValue: TgUsdBuyContextValues = {
    isLoading,
    depositWeiValue,
    setDepositWeiValue,
    depositAsset,
    setDepositAsset,
    tokens,
    isZapLoading,
    setIsSwapLoading,
    receiveAsset,
    setReceiveAsset,
    isBuying,
    setIsBuying,
    balances,
    depositAssetInfo,
    swapAssetPrice,
    balanceAllowanceData,
    handleDepositChange,
    handleReceiveChange,
    receiveWeiValue,
    receiveAssetInfo,
    setReceiveWeiValue,
  }

  return <TgUsdBuyContext.Provider value={contextValue}>{children}</TgUsdBuyContext.Provider>
}

export const useTgUsdBuyContext = () => {
  const context = useContext(TgUsdBuyContext)
  if (!context) {
    throw new Error("useTgUsdBuyContext must be used within a TgUsdBuyProvider")
  }
  return context
}
