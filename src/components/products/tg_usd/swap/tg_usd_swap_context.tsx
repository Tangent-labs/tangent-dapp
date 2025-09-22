"use client"

import { toast } from "react-toastify"
import { useUSGContext } from "../tg_usd_context"
import { SwapConfig, swapConfig } from "./swap_config"
import { getQuote, getRoute } from "../global_quote_controller"
import { USG_CONTRACT, tgUsdTokens } from "../tg_usd_repository"
import { ToastComponent } from "@/components/design_system/toast"
import { AssetDataPriced, ExistingAsset, FormState } from "@/types"
import { Abi, Address, SendTransactionParameters, WalletClient } from "viem"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { getBalances, getBalancesAndAllowances } from "../record/tg_usd_record_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { BalanceAllowanceData, SwapToken, DepositReceiveAsset, LpUserPoints, USGStakingInfo } from "../tg_usd_type"
import { computeSwapAssetPrice, doApprove, doCustomQuote, doCustomSwap, doSwap, getABI, getSwapFormState } from "./tg_usd_swap_controller"

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

  isSwapLoading: boolean
  setIsSwapLoading: (arg: boolean) => void

  slippage: number
  setSlippage: (arg: number) => void

  balances: Record<Address, bigint> | null

  swapAssetPrice: number | null

  depositAssetInfo: AssetDataPriced | null

  receiveAssetInfo: AssetDataPriced | null

  balanceAllowanceData: BalanceAllowanceData | null

  handleDepositChange: (arg: bigint | undefined) => void

  handleReceiveChange: (arg: bigint | undefined) => void

  actionSwap: () => void

  actionApprove: () => void

  toggleTokensSwitch: () => void

  formState: FormState

  computedAssets: { depositAssets: DepositReceiveAsset[]; receiveAssets: DepositReceiveAsset[] }

  USGsUSGMetrics: USGStakingInfo | undefined

  lpUserPoints: LpUserPoints
}

export const TgUsdSwapContext = createContext<TgUsdSwapContextValues | undefined>(undefined)

export const TgUsdSwapProvider = ({ children }: TgUsdSwapContextProps) => {
  const { tokens, USGsUSGMetrics, loadUSGsUSGMetrics, lpUserPoints } = useUSGContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [isBuying, setIsBuying] = useState<boolean>(true)

  const [receiveAsset, setReceiveAsset] = useState<string>("USG")

  const [depositAsset, setDepositAsset] = useState<string>("USDC")

  const [isSwapLoading, setIsSwapLoading] = useState(false)

  const [slippage, setSlippage] = useState<number>(1)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [receiveWeiValue, setReceiveWeiValue] = useState<bigint | undefined>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number | null>(null)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)

  const [swapedAssetPrice, setSwapedAssetPrice] = useState<number | null>(null)

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

  useEffect(() => {
    loadUSGsUSGMetrics()
  }, [currentAddress])

  useEffect(() => {
    const walletClient = getWalletClient()
    if (depositAssetInfo && receiveAssetInfo && walletClient) {
      fetchBalanceAllowanceData(walletClient)
    }
  }, [depositAssetInfo, receiveAssetInfo, getWalletClient])

  const fetchBalanceAllowanceData = async (walletClient: WalletClient) => {
    if (!depositAssetInfo || !receiveAssetInfo) return

    try {
      let spender = "" as Address

      if (receiveAssetInfo?.address === USG_CONTRACT?.USG || depositAssetInfo?.address === USG_CONTRACT?.USG) {
        spender = USG_CONTRACT.CURVE_ROUTER as Address
      } else {
        spender = USG_CONTRACT.ENSO_ROUTER as Address
      }

      const data = await getBalancesAndAllowances(walletClient, depositAssetInfo.address, spender)

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
        const { quote } = await getQuote(value, currentAddress, depositAssetInfo?.address, receiveAssetInfo?.address)

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
    setIsSwapLoading(true)
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
        const { quote } = await getQuote(value, currentAddress, receiveAssetInfo?.address, depositAssetInfo?.address)

        if (quote) {
          setReceiveWeiValue(quote)
          setIsSwapLoading(false)
        }
      } catch (error) {
        console.error("Error fetching zap value:", error)
        setIsSwapLoading(false)
      }
    }

    if (quote === "enso") {
      fetchSwapValue()
    } else if (quote === "1") {
      setReceiveWeiValue(value)
      setIsSwapLoading(false)
    } else {
      const quote = swapData?.quote

      const quoteContractAddress = [depositAssetInfo, receiveAssetInfo].find((el) => el.symbol === swapData?.quoteContract)?.address as Address

      if (value && quote) {
        doCustomQuote(quote, value, currentAddress, quoteContractAddress).then((v) => {
          setReceiveWeiValue(v as bigint)
          setIsSwapLoading(false)
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

  const actionApprove = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && receiveAssetInfo && depositAssetInfo) {
      let spender = "" as Address

      if (receiveAssetInfo?.address === USG_CONTRACT?.USG || depositAssetInfo?.address === USG_CONTRACT?.USG) {
        spender = USG_CONTRACT.CURVE_ROUTER as Address
      } else {
        spender = USG_CONTRACT.ENSO_ROUTER as Address
      }

      await doApprove(walletClient, depositAssetInfo?.address, depositWeiValue || 0n, spender)
        .then(() => {
          fetchBalanceAllowanceData(walletClient)
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
          setDepositWeiValue(0n)
          setReceiveWeiValue(undefined)
          fetchBalanceAllowanceData(walletClient)
          setIsLoading(false)
        })
        .catch(() => {
          toast.error(ToastComponent, { data: { type: "Error", content: "Swap failed." } })
          setIsLoading(false)
        })
    } else {
      if (!depositWeiValue || !currentAddress) return

      try {
        const routeData = await getRoute(
          depositAssetInfo?.address,
          receiveAssetInfo?.address,
          depositWeiValue,
          (BigInt(receiveWeiValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
          currentAddress,
          currentAddress
        )

        const tx = {
          data: routeData?.data as `0x${string}`,
          to: routeData?.routerAddress,
          value: 0n,
        } as SendTransactionParameters

        doSwap(walletClient!, tx)
          .then(() => {
            setDepositWeiValue(undefined)
            setReceiveWeiValue(undefined)
            fetchBalanceAllowanceData(walletClient!)
            setIsLoading(false)
            toast.success(ToastComponent, { data: { type: "Success", content: "Swap successful!" } })
          })
          .catch(() => {
            toast.error(ToastComponent, { data: { type: "Error", content: "Swap failed." } })
            setIsLoading(false)
          })
      } catch (error) {
        console.error("Error in actionSwap:", error)
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
                contract: USG_CONTRACT.ENSO_ROUTER,
              }
        )
      } catch {
        setSwapData({
          approval: "approve",
          quote: "enso",
          swap: null,
          isStaked: false,
          contract: USG_CONTRACT.ENSO_ROUTER,
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

  const toggleTokensSwitch = () => {
    setReceiveAsset(depositAsset)
    setDepositAsset(receiveAsset)
  }

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
    isSwapLoading,
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
    slippage,
    setSlippage,
    toggleTokensSwitch,
    USGsUSGMetrics,
    lpUserPoints,
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
