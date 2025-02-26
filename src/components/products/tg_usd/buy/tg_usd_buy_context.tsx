"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { BalanceAllowanceData, ZapToken } from "../tg_usd_type"
import { Abi, Address } from "viem"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import {
  computeSwapAssetPrice,
  doApprove,
  doCustomQuote,
  doCustomSwap,
  doSwap,
  fetchEnsoData,
  getBalances,
  getContractToCall,
  getBuyFormState,
  getQuoteFunction,
  getQuoteType,
  getSwapFunctionName,
  getZapTokenBalanceAllowance,
} from "./tg_usd_buy_controller"
import { AssetDataPriced, FormState } from "@/types"
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

  actionSwap: () => void

  actionApprove: () => void

  formState: FormState
}

export const TgUsdBuyContext = createContext<TgUsdBuyContextValues | undefined>(undefined)

export const TgUsdBuyProvider = ({ children, tokens }: TgUsdBuyContextProps) => {
  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [isBuying, setIsBuying] = useState<boolean>(true)

  const [receiveAsset, setReceiveAsset] = useState<string>("tgUSD")

  const [depositAsset, setDepositAsset] = useState<string>("ETH")

  const [isZapLoading, setIsSwapLoading] = useState(false)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [receiveWeiValue, setReceiveWeiValue] = useState<bigint | undefined>()

  const [ensoRouterAddress, setEnsoRouterAddress] = useState<Address | undefined>(undefined)

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
        price: swapAssetPrice,
      } as AssetDataPriced
    } else if (receiveAsset === "tgUSD") {
      return {
        address: "0x39826E09f8efb9df4C56Aeb9eEC0D2B8164d3B36",
        decimals: 18,
        displayDecimals: 5,
        symbol: "tgUSD",
        name: "tgUSD",
        price: 1,
      } as AssetDataPriced
    } else if (receiveAsset === "sgUSD") {
      return {
        address: "0x24eede899ed11525e2977a9673b3898e7705af3d",
        decimals: 18,
        displayDecimals: 5,
        symbol: "sgUSD",
        name: "sgUSD",
        price: 1,
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
    } else if (depositAsset === "tgUSD") {
      return {
        address: "0x39826E09f8efb9df4C56Aeb9eEC0D2B8164d3B36",
        decimals: 18,
        displayDecimals: 5,
        symbol: "tgUSD",
        name: "tgUSD",
        price: 1,
      } as AssetDataPriced
    } else if (depositAsset === "sgUSD") {
      return {
        address: "0x24eede899ed11525e2977a9673b3898e7705af3d",
        decimals: 18,
        displayDecimals: 5,
        symbol: "sgUSD",
        name: "sgUSD",
        price: 1,
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
    if (!depositAssetInfo || !receiveAssetInfo) return

    try {
      const walletClient = getWalletClient()
      if (!walletClient) throw new Error("Wallet client not found")

      const quoteType = getQuoteType(depositAssetInfo?.address, receiveAssetInfo?.address)
      const spenderAddress = (!!ensoRouterAddress && quoteType === "enso" ? ensoRouterAddress : receiveAssetInfo?.address) as Address

      const data = await getZapTokenBalanceAllowance(walletClient, depositAssetInfo.address, spenderAddress)

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

    if (value === undefined) {
      setDepositWeiValue(undefined)
      return
    }

    if (!depositAssetInfo || !receiveAssetInfo) return

    const quote = getQuoteType(depositAssetInfo?.symbol, receiveAssetInfo?.symbol)

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

    if (quote === "enso") {
      fetchValue()
    } else if (quote === "1") {
      setDepositWeiValue(value)
    } else {
      const method = getQuoteFunction(depositAssetInfo?.symbol, receiveAssetInfo?.symbol)
      if (depositWeiValue && method) {
        doCustomQuote(method, depositWeiValue, currentAddress, receiveAssetInfo?.address).then((v) => {
          setDepositWeiValue(v as bigint)
        })
      }
    }
  }

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)

    if (value === undefined) {
      setReceiveWeiValue(undefined)
      return
    }

    if (!depositAssetInfo || !receiveAssetInfo) return

    const quote = getQuoteType(depositAssetInfo?.symbol, receiveAssetInfo?.symbol)

    const fetchSwapValue = async () => {
      if (!value || !currentAddress || !depositAssetInfo || !receiveAssetInfo) return

      setIsSwapLoading(true)
      try {
        const data = await getTokenOutQuote(value, currentAddress, depositAssetInfo, receiveAssetInfo)

        if (data) {
          setReceiveWeiValue(data.amountOut)
          setEnsoRouterAddress(data?.tx?.to)
        }
      } catch (error) {
        console.error("Error fetching zap value:", error)
      } finally {
        setIsSwapLoading(false)
      }
    }

    if (quote === "enso") {
      fetchSwapValue()
    } else if (quote === "1") {
      setReceiveWeiValue(value)
    } else {
      const method = getQuoteFunction(depositAssetInfo?.symbol, receiveAssetInfo?.symbol)
      if (value && method) {
        doCustomQuote(method, value, currentAddress, receiveAssetInfo?.address).then((v) => {
          setReceiveWeiValue(v as bigint)
        })
      }
    }
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

  const actionApprove = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && receiveAssetInfo && depositAssetInfo) {
      const quoteType = getQuoteType(depositAssetInfo?.address, receiveAssetInfo?.address)
      const spender = (!!ensoRouterAddress && quoteType === "enso" ? ensoRouterAddress : receiveAssetInfo?.address) as Address

      await doApprove(walletClient, depositAssetInfo?.address, depositWeiValue || 0n, spender)
        .then(() => {
          fetchBalanceAllowanceData()
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error during approval:", error)
        })
    }
  }

  const actionSwap = async () => {
    setIsLoading(true)

    if (!depositAssetInfo || !receiveAssetInfo || !depositWeiValue) return

    const walletClient = getWalletClient()

    const swapFn = getSwapFunctionName(depositAssetInfo?.symbol, receiveAssetInfo?.symbol)

    if (swapFn && walletClient) {
      const contract = getContractToCall(depositAssetInfo?.symbol, receiveAssetInfo?.symbol)

      await doCustomSwap(walletClient, contract?.abi as Abi, swapFn, depositWeiValue || 0n, receiveAssetInfo?.address)
        .then(() => {
          fetchBalanceAllowanceData()
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error during approval:", error)
          setIsLoading(false)
        })
    } else {
      if (!depositWeiValue || !currentAddress) return

      try {
        const { routerCallData } = await fetchEnsoData(depositWeiValue, currentAddress, receiveAssetInfo, depositAssetInfo, 1)

        const walletClient = getWalletClient()

        await doSwap(walletClient!, routerCallData)

        setDepositWeiValue(undefined)
        setReceiveWeiValue(undefined)
        fetchBalanceAllowanceData()
        setIsLoading(false)
      } catch (error) {
        console.error("Error in actionSwap:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    setDepositWeiValue(undefined)
    setReceiveWeiValue(undefined)
  }, [isBuying, depositAsset, receiveAsset])

  const formState = useMemo(
    () => getBuyFormState(depositWeiValue, receiveWeiValue, isWellConnected, depositAssetInfo!, receiveAssetInfo!, balanceAllowanceData!),
    [depositWeiValue, receiveWeiValue, isWellConnected, depositAssetInfo, receiveAssetInfo, balanceAllowanceData!]
  )

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
    actionApprove,
    actionSwap,
    formState,
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
