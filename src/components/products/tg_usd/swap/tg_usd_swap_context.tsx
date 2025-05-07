"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { BalanceAllowanceData, SwapToken, DepositReceiveAsset } from "../tg_usd_type"
import { Abi, Address } from "viem"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { AssetDataPriced, ExistingAsset, FormState } from "@/types"
import { SwapConfig, swapConfig } from "./swap_config"
import { tgUsdTokens } from "../tg_usd_repository"
import {
  computeSwapAssetPrice,
  doApprove,
  doCustomQuote,
  doCustomSwap,
  doSwap,
  fetchEnsoData,
  getBalances,
  getABI,
  getSwapFormState,
  getSwapTokenBalanceAllowance,
} from "./tg_usd_swap_controller"
import { useTgUsdContext } from "../tg_usd_context"
import { returnEnsoQuote } from "../global_quote_controller"

type TgUsdSwapContextProps = {
  children: ReactNode
}

type TgUsdSwapContextValues = {
  isLoading: boolean

  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void

  receiveWeiValue?: bigint
  setReceiveWeiValue: (arg: bigint | undefined) => void

  setDepositAsset: (arg: string) => void
  depositAsset: string | null

  setIsBuying: (arg: boolean) => void
  isBuying: boolean

  setReceiveAsset: (arg: string) => void
  receiveAsset: string | undefined

  tokens: SwapToken[]

  depositSliderPercent: number
  setDepositSliderPercent: (arg: number) => void

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

  computedAssets: { depositAssets: DepositReceiveAsset[]; receiveAssets: DepositReceiveAsset[] }
}

export const TgUsdSwapContext = createContext<TgUsdSwapContextValues | undefined>(undefined)

export const TgUsdSwapProvider = ({ children }: TgUsdSwapContextProps) => {
  const { tokens } = useTgUsdContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [isBuying, setIsBuying] = useState<boolean>(true)

  const [receiveAsset, setReceiveAsset] = useState<string>("tgUSD")

  const [depositAsset, setDepositAsset] = useState<string | null>(null)

  const [isZapLoading, setIsSwapLoading] = useState(false)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [receiveWeiValue, setReceiveWeiValue] = useState<bigint | undefined>()

  const [ensoRouterAddress, setEnsoRouterAddress] = useState<Address | undefined>(undefined)

  const [swapAssetPrice, setSwapAssetPrice] = useState<number | null>(null)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)

  const [swapedAssetPrice, setSwapedAssetPrice] = useState<number | null>(null)

  const [slippage, setSlippage] = useState<number>(5)

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

  const [balanceAllowanceData, setBalanceAllowanceData] = useState<BalanceAllowanceData | null>(null)

  const [swapData, setSwapData] = useState<SwapConfig | null>(null)

  const receiveAssetInfo = useMemo(() => {
    const tgTokens: SwapToken[] = Object.entries(tgUsdTokens).flatMap(([, tokens]) => {
      return Object.entries(tokens).map(([name, address]) => ({
        name,
        symbol: name,
        value: name,
        address: address as Address,
        decimals: 18,
        displayDecimals: 2,
        logoURI: "null",
      }))
    })

    const assetInfo =
      tokens.find((el: SwapToken) => el.name === receiveAsset || el.symbol === receiveAsset) ||
      tgTokens.find((el: SwapToken) => el.name === receiveAsset || el.symbol === receiveAsset)

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
    const tgTokens: SwapToken[] = Object.entries(tgUsdTokens).flatMap(([, tokens]) => {
      return Object.entries(tokens).map(([name, address]) => ({
        name,
        symbol: name,
        value: name,
        address: address as Address,
        decimals: 18,
        displayDecimals: 2,
        logoURI: "null",
      }))
    })

    const assetInfo =
      tokens.find((el: SwapToken) => el.name === depositAsset || el.symbol === depositAsset) ||
      tgTokens.find((el: SwapToken) => el.name === depositAsset || el.symbol === depositAsset)

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

      const quoteType = swapData?.quote

      const spenderAddress = (!!ensoRouterAddress && quoteType === "enso" ? ensoRouterAddress : receiveAssetInfo?.address) as Address

      const data = await getSwapTokenBalanceAllowance(walletClient, depositAssetInfo.address, spenderAddress)

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
          setBalances(tokenBalances)
          setIsLoading(false)
        }
      })
    }
  }, [currentAddress, tokens])

  const handleReceiveChange = (value: bigint | undefined) => {
    // TODO : REMOVE
    setSlippage(10)
    //

    setReceiveWeiValue(value)

    if (value === undefined) {
      setDepositWeiValue(undefined)
      return
    }

    if (!depositAssetInfo || !receiveAssetInfo) return

    const quote = swapData?.quote

    const fetchValue = async () => {
      if (!value || !currentAddress || !depositAssetInfo || !receiveAssetInfo) return

      setIsSwapLoading(true)
      try {
        const { quote } = await returnEnsoQuote(value, currentAddress, depositAssetInfo?.address, receiveAssetInfo?.address, slippage)

        if (quote) {
          setDepositWeiValue(quote)
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
      if (depositWeiValue && quote) {
        doCustomQuote(quote, depositWeiValue, currentAddress, receiveAssetInfo?.address).then((v) => {
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

    const quote = swapData?.quote

    const fetchSwapValue = async () => {
      if (!value || !currentAddress || !depositAssetInfo || !receiveAssetInfo) return

      setIsSwapLoading(true)
      try {
        const { quote } = await returnEnsoQuote(value, currentAddress, receiveAssetInfo?.address, depositAssetInfo?.address, slippage)

        if (quote) {
          setReceiveWeiValue(quote)
          setEnsoRouterAddress("0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf")
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
      const quote = swapData?.quote

      const quoteContractAddress = [depositAssetInfo, receiveAssetInfo].find((el) => el.symbol === swapData?.quoteContract)?.address as Address

      if (value && quote) {
        doCustomQuote(quote, value, currentAddress, quoteContractAddress).then((v) => {
          setReceiveWeiValue(v as bigint)
        })
      }
    }
  }

  useEffect(() => {
    if (!receiveAsset) return

    const fetchSwapAssetData = async () => {
      setIsSwapLoading(true)
      setSwapedAssetPrice(1)

      try {
        const data = await computeSwapAssetPrice(tokens, receiveAsset)

        if (data) {
          setSwapedAssetPrice(data)
        } else {
          setSwapedAssetPrice(1)
        }
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
        setSwapAssetPrice(data ?? 1)
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
  }, [depositAssetInfo, receiveAssetInfo])

  const actionApprove = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && receiveAssetInfo && depositAssetInfo) {
      const quoteType = swapData?.quote

      const spender = (!!ensoRouterAddress && quoteType === "enso" ? ensoRouterAddress : receiveAssetInfo?.address) as Address

      await doApprove(walletClient, depositAssetInfo?.address, depositWeiValue || 0n, spender)
        .then(() => {
          fetchBalanceAllowanceData()
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error during approval:", error)
          setIsLoading(false)
        })
    }
  }

  const actionSwap = async () => {
    setIsLoading(true)

    if (!depositAssetInfo || !receiveAssetInfo || !depositWeiValue) return

    const walletClient = getWalletClient()

    const swapFn = swapData?.swap

    if (swapFn && walletClient) {
      const contract = getABI(depositAssetInfo?.symbol, receiveAssetInfo?.symbol)

      const quoteType = swapData?.quote

      const contractSymbol = swapData?.contract

      const swapContractToken = [depositAssetInfo, receiveAssetInfo].find((el) => el.symbol === contractSymbol)?.address as Address

      doCustomSwap(walletClient, contract?.abi as Abi, swapFn, depositWeiValue || 0n, swapContractToken, quoteType === "enso")
        .then(() => {
          setDepositWeiValue(undefined)
          setReceiveWeiValue(undefined)
          fetchBalanceAllowanceData()
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error during doCustomSwap:", error)
          setIsLoading(false)
        })
    } else {
      if (!depositWeiValue || !currentAddress) return

      try {
        const { routerCallData } = await fetchEnsoData(depositWeiValue, currentAddress, receiveAssetInfo, depositAssetInfo, slippage)

        doSwap(walletClient!, routerCallData)
          .then(() => {
            setDepositWeiValue(undefined)
            setReceiveWeiValue(undefined)
            fetchBalanceAllowanceData()
            setIsLoading(false)
          })
          .catch((error) => {
            console.error("Error during swap:", error)
            setIsLoading(false)
          })
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

    if (depositAsset && receiveAsset) {
      try {
        const swapDataFromConfig = swapConfig[depositAsset][receiveAsset]

        setSwapData(
          !!swapDataFromConfig
            ? swapDataFromConfig
            : {
                approval: "approve",
                quote: "enso",
                swap: null,
                isStaked: false,
                contract: "0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf",
              }
        )
      } catch {
        setSwapData({
          approval: "approve",
          quote: "enso",
          swap: null,
          isStaked: false,
          contract: "0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf",
        })
      }
    }
  }, [isBuying, depositAsset, receiveAsset])

  const formState = useMemo(
    () =>
      getSwapFormState(
        swapData?.approval === "noApprovalNeeded",
        depositWeiValue,
        receiveWeiValue,
        isWellConnected,
        depositAssetInfo!,
        receiveAssetInfo!,
        balanceAllowanceData!
      ),
    [depositWeiValue, receiveWeiValue, isWellConnected, depositAssetInfo, receiveAssetInfo, balanceAllowanceData!]
  )

  useEffect(() => {
    if (!depositAsset || !receiveAsset) return

    setReceiveAsset(depositAsset)
    setDepositAsset(receiveAsset)
  }, [isBuying])

  const computedAssets = useMemo(() => {
    if (!balances) return { depositAssets: [], receiveAssets: [] }

    const tgTokens = Object.entries(tgUsdTokens).flatMap(([, tokens]) => {
      return Object.entries(tokens).map(([name, address]) => ({
        name,
        symbol: name,
        value: name,
        address,
        balance: balances[address as Address] || BigInt(0),
      }))
    })

    const tokenOptions = tokens.map((el: SwapToken) => ({
      ...el,
      value: el.name as string,
      balance: balances[el.address] || BigInt(0),
    }))

    const depositAssets = isBuying
      ? [
          ...[
            {
              symbol: "ETH",
              name: "Ethereum",
              value: "ETH",
              decimals: 18,
              address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              logo: "ETH" as ExistingAsset,
              displayDecimals: 5,
              balance: balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] || BigInt(0),
            },
            ...tokenOptions,
            ...tgTokens,
          ].sort((a, b) => Number(b.balance - a.balance)),
        ]
      : [
          ...tgTokens,
          ...[
            {
              symbol: "ETH",
              name: "Ethereum",
              value: "ETH",
              decimals: 18,
              address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              logo: "ETH" as ExistingAsset,
              displayDecimals: 5,
              balance: balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] || BigInt(0),
            },
            ...tokenOptions,
          ].sort((a, b) => Number(b.balance - a.balance)),
        ]

    const receiveAssets = isBuying
      ? [
          ...tgTokens,
          ...[
            {
              symbol: "ETH",
              name: "Ethereum",
              value: "ETH",
              decimals: 18,
              address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              logo: "ETH" as ExistingAsset,
              displayDecimals: 5,
              balance: balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] || BigInt(0),
            },
            ...tokenOptions,
          ].sort((a, b) => Number(b.balance - a.balance)),
        ]
      : [
          ...[
            {
              symbol: "ETH",
              name: "Ethereum",
              value: "ETH",
              decimals: 18,
              address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              logo: "ETH" as ExistingAsset,
              displayDecimals: 5,
              balance: balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] || BigInt(0),
            },
            ...tokenOptions,
            ...tgTokens,
          ].sort((a, b) => Number(b.balance - a.balance)),
        ]

    return { depositAssets, receiveAssets }
  }, [balances, isBuying])

  const contextValue: TgUsdSwapContextValues = {
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
    computedAssets,
    depositSliderPercent,
    setDepositSliderPercent,
  }

  return <TgUsdSwapContext.Provider value={contextValue}>{children}</TgUsdSwapContext.Provider>
}

export const useTgUsdSwapContext = () => {
  const context = useContext(TgUsdSwapContext)
  if (!context) {
    throw new Error("useTgUsdSwapContext must be used within a TgUsdSwapProvider")
  }
  return context
}
