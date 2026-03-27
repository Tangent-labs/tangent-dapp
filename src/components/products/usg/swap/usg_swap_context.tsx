"use client"

import { useUSGContext } from "../usg_context"
import { SwapConfig, swapConfig } from "./swap_config"
import { formatBigInt, formatNumber } from "@/lib/number_formatter"
import { toastTx } from "@/components/design_system/toast"
import { USG_CONTRACT } from "../usg_repository"
import { getQuote, getRoute } from "../global_quote_controller"
import { AssetDataPriced, FormState } from "@/types"
import { useRootContext } from "@/components/products/root/root_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { Abi, Address, formatUnits, SendTransactionParameters, WalletClient, zeroAddress } from "viem"
import { BalanceAllowanceData, DepositReceiveAsset, LpUserPoints, USGStakingInfo } from "../usg_type"
import { doApprove, doCustomQuote, doCustomSwap, doSwap, getABI, getSwapFormState } from "./usg_swap_controller"
import { getTokenSymbolPriorityIndex } from "@/components/design_system/inputs/asset_selector"
import { buildAssetInfo, resolveAssetName } from "./utils"
import { useSearchParams } from "next/navigation"
import { USDC } from "@tangent/defi-resources/build/ressources/erc20/common"
import { Erc20Details, ERC20S } from "@/data/erc20s"
import {
  computedMinAmountOut,
  computeSwapAssetPrice,
  computeTransactionPotentialLoss,
  getBalances,
  getBalancesAndAllowances,
} from "../record/usg_record_controller"

type USGSwapContextProps = {
  children: ReactNode
}

type USGSwapContextValues = {
  isTxLoading: boolean

  sellWeiValue?: bigint
  setSellWeiValue: (arg: bigint | undefined) => void

  buyWeiValue?: bigint
  setBuyWeiValue: (arg: bigint | undefined) => void

  sellAssetAddress: string | null
  setSellAssetAddress: (arg: Address) => void

  buyAssetAddress: string | undefined
  setBuyAssetAddress: (arg: Address) => void

  sellAssetName: string | null
  buyAssetName: string | null

  depositSliderPercent: number
  setDepositSliderPercent: (arg: number) => void

  isBuyValueLoading: boolean
  setIsBuyValueLoading: (arg: boolean) => void

  isSellValueLoading: boolean
  setIsSellValueLoading: (arg: boolean) => void

  slippage: number
  setSlippage: (arg: number) => void

  balances: Record<Address, bigint> | null

  sellAssetPrice: number | null

  sellAssetInfo: AssetDataPriced | null

  buyAssetInfo: AssetDataPriced | null

  balanceAllowanceData: BalanceAllowanceData | null

  handleSellChange: (arg: bigint | undefined) => void

  handleBuyChange: (arg: bigint | undefined) => void

  actionSwap: () => void

  actionApprove: () => void

  toggleTokensSwitch: () => void

  formState: FormState

  computedAssets: DepositReceiveAsset[]

  USGsUSGMetrics: USGStakingInfo | undefined

  lpUserPoints: LpUserPoints

  zapValuesFormatted: { buyFormatted: string; minOutFormatted: string }

  isSwapBlockedByPriceImpact: boolean
  setIsSwapBlockedByPriceImpact: (b: boolean) => void

  isSwapBlockedBySlippage: boolean
  setIsSwapBlockedBySlippage: (b: boolean) => void

  slippageLoss: { tokenLoss: string; dollarLoss: string }

  priceImpact: number

  priceImpactLoss: string

  isSwapReady: boolean
}

export const USGSwapContext = createContext<USGSwapContextValues | undefined>(undefined)

export const USGSwapProvider = ({ children }: USGSwapContextProps) => {
  const searchParams = useSearchParams()

  const { curveRoutes, handleQuote } = useRootContext()
  const { USGsUSGMetrics, lpUserPoints } = useUSGContext()
  const { isWellConnected, walletClient, currentAddress } = useWalletConnexionContext()
  const [isTxLoading, setIsTxLoading] = useState<boolean>(false)

  const [sellAssetPrice, setSellAssetPrice] = useState<number | null>(null)
  const [buyAssetPrice, setBuyAssetPrice] = useState<number | null>(null)

  // --- Resolve names from addresses (for swapConfig, computeSwapAssetPrice, getABI) ---
  const [sellAssetAddress, setSellAssetAddress] = useState<string>(searchParams.get("tokenIn")?.toLowerCase() ?? USDC.toLowerCase())
  const [buyAssetAddress, setBuyAssetAddress] = useState<string>(searchParams.get("tokenOut")?.toLowerCase() ?? USG_CONTRACT.USG.toLowerCase())

  // --- Resolve names from addresses (for swapConfig, computeSwapAssetPrice, getABI) ---
  const sellAssetName = useMemo(() => resolveAssetName(sellAssetAddress), [sellAssetAddress])
  const buyAssetName = useMemo(() => resolveAssetName(buyAssetAddress), [buyAssetAddress])

  // --- Asset info (now resolved by address) ---
  const sellAssetInfo = useMemo(() => buildAssetInfo(sellAssetAddress, sellAssetPrice), [sellAssetAddress, sellAssetPrice])
  const buyAssetInfo = useMemo(() => buildAssetInfo(buyAssetAddress, buyAssetPrice), [buyAssetAddress, buyAssetPrice])

  const [sellWeiValue, setSellWeiValue] = useState<bigint | undefined>()
  const [buyWeiValue, setBuyWeiValue] = useState<bigint | undefined>()

  const [isBuyValueLoading, setIsBuyValueLoading] = useState(false)

  const [isSellValueLoading, setIsSellValueLoading] = useState(false)

  const [slippage, setSlippage] = useState<number>(0.2)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)
  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)
  const [balanceAllowanceData, setBalanceAllowanceData] = useState<BalanceAllowanceData | null>(null)
  const [swapData, setSwapData] = useState<SwapConfig | null>(null)

  const [isSwapBlockedBySlippage, setIsSwapBlockedBySlippage] = useState<boolean>(false)

  const [isSwapBlockedByPriceImpact, setIsSwapBlockedByPriceImpact] = useState<boolean>(false)

  const [priceImpact, setPriceImpact] = useState<number>(0)

  // Sync URL → state (browser back/forward)
  useEffect(() => {
    if (!sellAssetAddress || !buyAssetAddress) return

    const params = new URLSearchParams(searchParams.toString())
    params.set("tokenIn", sellAssetAddress)
    params.set("tokenOut", buyAssetAddress)

    const newUrl = `${window.location.pathname}?${params.toString()}`

    // Avoid pushing if URL is already correct
    if (window.location.search === `?${params.toString()}`) return

    window.history.pushState(null, "", newUrl)
  }, [sellAssetAddress, buyAssetAddress])

  // --- Balance/allowance ---
  useEffect(() => {
    if (sellAssetInfo && buyAssetInfo && walletClient) {
      fetchBalanceAllowanceData(walletClient)
    }
  }, [sellAssetInfo, buyAssetInfo, walletClient])

  const fetchBalanceAllowanceData = async (walletClient: WalletClient) => {
    if (!sellAssetInfo || !buyAssetInfo) return

    try {
      let spender = "" as Address

      if (buyAssetInfo?.address === USG_CONTRACT?.USG || sellAssetInfo?.address === USG_CONTRACT?.USG) {
        spender = USG_CONTRACT.CURVE_ROUTER as Address
      } else {
        spender = USG_CONTRACT.ENSO_ROUTER as Address
      }

      const data = await getBalancesAndAllowances(walletClient, sellAssetInfo.address, spender)
      setBalanceAllowanceData(data ? (data[0] as BalanceAllowanceData) : null)
    } catch (error) {
      console.error("Failed to fetch balance/allowance:", error)
    }
  }

  // Fetch balances of all tokens
  useEffect(() => {
    const tokenAddresses: Address[] = ERC20S.map((el) => el.address)

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
        }
      })
    }
  }, [currentAddress])
  // --- Quote handlers ---

  const sellDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const buyDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const sellQuoteIdRef = useRef(0)
  const buyQuoteIdRef = useRef(0)

  const handleSellChange = (value: bigint | undefined) => {
    setPriceImpact(0)
    setSellWeiValue(value)

    if (value === undefined) {
      setBuyWeiValue(undefined)
      setIsBuyValueLoading(false)
      return
    }

    if (!sellAssetInfo || !buyAssetInfo) return

    setIsBuyValueLoading(true)

    if (sellDebounceRef.current) clearTimeout(sellDebounceRef.current)

    const quote = swapData?.quote

    if (quote === "1") {
      setBuyWeiValue(value)
      setIsBuyValueLoading(false)
      return
    }
    const quoteId = ++sellQuoteIdRef.current

    sellDebounceRef.current = setTimeout(async () => {
      try {
        //
        if (quote === "enso") {
          const quote = await getQuote(value, currentAddress || zeroAddress, buyAssetInfo?.address, sellAssetInfo?.address, curveRoutes)
          const handledQuote = handleQuote(quote.quote, quote.priceImpact)

          if (quoteId !== sellQuoteIdRef.current) return
          if (quote) {
            setPriceImpact(Number(handledQuote.validPriceImpact) / 100)
            setBuyWeiValue(handledQuote.validQuote)
          }
        }
        //
        else {
          const quoteContractAddress = [sellAssetInfo, buyAssetInfo].find((el) => el.symbol === swapData?.quoteContract)?.address as Address

          if (value && quote) {
            const v = await doCustomQuote(quote, value, currentAddress, quoteContractAddress)
            if (quoteId !== sellQuoteIdRef.current) return
            setBuyWeiValue(v as bigint)
          }
        }
      } finally {
        if (quoteId === sellQuoteIdRef.current) {
          setIsBuyValueLoading(false)
        }
      }
    }, 1000)
  }

  const handleBuyChange = (value: bigint | undefined) => {
    setPriceImpact(0)
    setBuyWeiValue(value)

    if (value === undefined) {
      setSellWeiValue(undefined)
      setIsSellValueLoading(false)
      return
    }

    if (!sellAssetInfo || !buyAssetInfo) return

    setIsSellValueLoading(true)

    if (buyDebounceRef.current) clearTimeout(buyDebounceRef.current)

    const quote = swapData?.quote

    if (quote === "1") {
      setSellWeiValue(value)
      setIsSellValueLoading(false)
      return
    }
    const quoteId = ++buyQuoteIdRef.current

    buyDebounceRef.current = setTimeout(async () => {
      try {
        if (quote === "enso") {
          const quote = await getQuote(value, currentAddress || zeroAddress, sellAssetInfo?.address, buyAssetInfo?.address, curveRoutes)
          const handledQuote = handleQuote(quote.quote, quote.priceImpact)

          if (quoteId !== buyQuoteIdRef.current) return
          if (quote) {
            setPriceImpact(Number(handledQuote.validPriceImpact) / 100)
            setSellWeiValue(handledQuote.validQuote)
          }
        } else {
          if (value && quote) {
            const v = await doCustomQuote(quote, value, currentAddress, buyAssetInfo?.address)
            if (quoteId !== buyQuoteIdRef.current) return
            setSellWeiValue(v as bigint)
          }
        }
      } finally {
        if (quoteId === buyQuoteIdRef.current) {
          setIsSellValueLoading(false)
        }
      }
    }, 1000)
  }

  // --- Price fetching (needs name for computeSwapAssetPrice) ---
  useEffect(() => {
    if (!buyAssetName || !USGsUSGMetrics) return

    const fetchSwapAssetData = async () => {
      setIsBuyValueLoading(true)
      try {
        const data = await computeSwapAssetPrice(buyAssetName, USGsUSGMetrics.USGPrice, USGsUSGMetrics.sUSGPrice)
        setBuyAssetPrice(data)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsBuyValueLoading(false)
      }
    }

    fetchSwapAssetData()
  }, [buyAssetName, USGsUSGMetrics?.USGPrice])

  useEffect(() => {
    if (!sellAssetName || !USGsUSGMetrics) return

    const fetchSwapAssetData = async () => {
      setIsBuyValueLoading(true)
      try {
        const data = await computeSwapAssetPrice(sellAssetName, USGsUSGMetrics.USGPrice, USGsUSGMetrics.sUSGPrice)
        setSellAssetPrice(data)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsBuyValueLoading(false)
      }
    }

    fetchSwapAssetData()
  }, [sellAssetName, USGsUSGMetrics?.USGPrice])

  // --- Actions ---
  const actionApprove = async () => {
    setIsTxLoading(true)

    if (walletClient && buyAssetInfo && sellAssetInfo) {
      let spender = "" as Address

      if (buyAssetInfo?.address === USG_CONTRACT?.USG || sellAssetInfo?.address === USG_CONTRACT?.USG) {
        spender = USG_CONTRACT.CURVE_ROUTER as Address
      } else {
        spender = USG_CONTRACT.ENSO_ROUTER as Address
      }

      await toastTx(doApprove(walletClient, sellAssetInfo?.address, sellWeiValue || 0n, spender), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
        success: () => ({
          type: "Success",
          content: `${sellAssetInfo?.symbol} approved successfully.`,
        }),
      })

      fetchBalanceAllowanceData(walletClient)
      setIsTxLoading(false)
    }
  }

  const actionSwap = async () => {
    try {
      setIsTxLoading(true)

      if (!sellAssetInfo || !buyAssetInfo || !sellWeiValue) return

      const swapFn = swapData?.swap

      if (swapFn && walletClient) {
        const contract = getABI(sellAssetInfo?.symbol, buyAssetInfo?.symbol)
        const quoteType = swapData?.quote
        const contractSymbol = swapData?.contract
        const swapContractToken = [sellAssetInfo, buyAssetInfo].find((el) => el.symbol === contractSymbol)?.address as Address

        await toastTx(doCustomSwap(walletClient, contract?.abi as Abi, swapFn, sellWeiValue || 0n, swapContractToken, quoteType === "enso"), {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: "Transaction successful.",
          }),
          error: () => {
            return { type: "Error", content: "Transaction failed." }
          },
        })

        setSellWeiValue(undefined)
        setBuyWeiValue(undefined)
        fetchBalanceAllowanceData(walletClient)
        setIsTxLoading(false)
      } else {
        if (!sellWeiValue || !currentAddress || !buyWeiValue) return

        try {
          const routeData = await getRoute(
            sellAssetInfo?.address,
            buyAssetInfo?.address,
            sellWeiValue,
            computedMinAmountOut(buyWeiValue, slippage),
            currentAddress,
            currentAddress,
            curveRoutes
          )

          const tx = {
            data: routeData?.data as `0x${string}`,
            to: routeData?.routerAddress,
            value: 0n,
          } as SendTransactionParameters

          await toastTx(doSwap(walletClient!, tx), {
            pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
            success: () => ({
              type: "Success",
              content: "Transaction successful.",
            }),
            error: () => {
              return { type: "Error", content: "Transaction failed." }
            },
          })

          setSellWeiValue(undefined)
          setBuyWeiValue(undefined)
          fetchBalanceAllowanceData(walletClient!)
          setIsTxLoading(false)
        } catch (error) {
          console.error("Error in actionSwap:", error)
          setIsTxLoading(false)
        }
      }
    } catch (error) {
      console.error("Error in actionSwap:", error)
      setIsTxLoading(false)
    }
  }

  // --- Swap config resolution (uses names as keys) ---
  useEffect(() => {
    setSellWeiValue(undefined)
    setBuyWeiValue(undefined)

    if (sellAssetName && buyAssetName) {
      try {
        const swapDataFromConfig = swapConfig[sellAssetName][buyAssetName]

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
  }, [sellAssetName, buyAssetName])

  const formState = useMemo(
    () =>
      getSwapFormState(
        isSwapBlockedByPriceImpact,
        isSwapBlockedBySlippage,
        swapData?.approval === "noApprovalNeeded",
        sellWeiValue,
        buyWeiValue,
        isWellConnected,
        sellAssetInfo!,
        buyAssetInfo!,
        balanceAllowanceData!,
        isTxLoading || isBuyValueLoading
      ),
    [
      isSwapBlockedByPriceImpact,
      isSwapBlockedBySlippage,
      sellWeiValue,
      buyWeiValue,
      isWellConnected,
      sellAssetInfo,
      buyAssetInfo,
      balanceAllowanceData!,
      isTxLoading || isBuyValueLoading,
    ]
  )

  // --- Toggle just swaps the two addresses ---
  const toggleTokensSwitch = () => {
    setBuyAssetAddress(sellAssetAddress)
    setSellAssetAddress(buyAssetAddress)
  }

  const computedAssets = useMemo(() => {
    return (
      ERC20S
        // .filter((el) => ["USDC", "WETH", "USG", "sUSG", "ETH"].includes(el.symbol!)) cool to debug that shit
        .map((el: Erc20Details) => {
          const balWei = balances?.[el.address] ?? 0n
          const balNumber = Number(formatUnits(balWei, el.decimals))
          const formattedBal = formatNumber(balNumber, el.displayDecimals ?? 2)
          return {
            ...el,
            value: el.name as string,
            address: el.address as Address,
            balanceWei: balWei,
            balanceNumber: balNumber,
            balanceFormatted: formattedBal,
          }
        })
        .sort((a, b) => {
          if (a.balanceNumber !== b.balanceNumber) {
            return b.balanceNumber - a.balanceNumber
          }
          return getTokenSymbolPriorityIndex(a.symbol) - getTokenSymbolPriorityIndex(b.symbol)
        })
    )
  }, [balances])

  const zapValuesFormatted = useMemo(() => {
    if (buyWeiValue) {
      const minAmountOutWei = computedMinAmountOut(buyWeiValue, slippage)
      const decimals = buyAssetInfo?.decimals || 18
      const displayDecimals = buyAssetInfo?.displayDecimals || 2
      const buyFormatted = formatBigInt(buyWeiValue, decimals, displayDecimals)
      const minOutFormatted = formatBigInt(minAmountOutWei, decimals, displayDecimals)

      return { buyFormatted, minOutFormatted }
    }
    return { buyFormatted: "-", minOutFormatted: "-" }
  }, [buyWeiValue, slippage])

  const priceImpactLoss = useMemo(() => {
    const { dollarLoss } = computeTransactionPotentialLoss(buyWeiValue as bigint, buyAssetInfo!, priceImpact)

    return dollarLoss
  }, [buyWeiValue, priceImpact, buyAssetInfo])

  const slippageLoss = useMemo(() => {
    const { tokenLoss, dollarLoss } = computeTransactionPotentialLoss(buyWeiValue as bigint, buyAssetInfo!, slippage)

    return { tokenLoss, dollarLoss }
  }, [buyWeiValue, slippage, buyAssetInfo])

  useEffect(() => {
    setIsSwapBlockedBySlippage(!!sellWeiValue && !!buyWeiValue && slippage >= 1)
  }, [slippage, buyWeiValue, sellWeiValue])

  useEffect(() => {
    setIsSwapBlockedByPriceImpact(!!sellWeiValue && !!buyWeiValue && priceImpact >= 1)
  }, [buyWeiValue, sellWeiValue, priceImpact])

  const isSwapReady = useMemo(() => {
    return !!buyWeiValue && !!sellWeiValue
  }, [buyWeiValue, sellWeiValue])

  const contextValue: USGSwapContextValues = {
    isTxLoading,

    sellWeiValue,
    setSellWeiValue,

    buyWeiValue,
    setBuyWeiValue,

    buyAssetAddress,
    setBuyAssetAddress,

    sellAssetAddress,
    setSellAssetAddress,

    sellAssetName,
    buyAssetName,

    isBuyValueLoading,
    setIsBuyValueLoading,

    isSellValueLoading,
    setIsSellValueLoading,

    balances,
    sellAssetInfo,
    sellAssetPrice,
    balanceAllowanceData,
    handleSellChange,
    handleBuyChange,
    buyAssetInfo,

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

    zapValuesFormatted,

    isSwapBlockedByPriceImpact,
    setIsSwapBlockedByPriceImpact,

    isSwapBlockedBySlippage,
    setIsSwapBlockedBySlippage,

    slippageLoss,

    priceImpact,

    priceImpactLoss,

    isSwapReady,
  }

  return <USGSwapContext.Provider value={contextValue}>{children}</USGSwapContext.Provider>
}

export const useUSGSwapContext = () => {
  const context = useContext(USGSwapContext)
  if (!context) {
    throw new Error("useUSGSwapContext must be used within a USGSwapProvider")
  }
  return context
}
