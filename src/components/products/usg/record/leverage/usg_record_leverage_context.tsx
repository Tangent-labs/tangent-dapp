"use client"

import { toast } from "react-toastify"
import { useUSGContext } from "../../usg_context"
import { USG_CONTRACT } from "../../usg_repository"
import { formatEther, formatUnits, maxUint256, parseEther, parseUnits } from "viem"
import { getQuote, getRoute } from "../../global_quote_controller"
import { AssetDataPriced, CollateralInfo, FormState } from "@/types"
import { Erc20Details, ERC20S } from "@/data/erc20s"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { useUSGMaketListContext } from "../../list/usg_market_list_context"
import { useRootContext } from "@/components/products/root/root_context"
import { getReceiptPrefix, useUSGRecordContext } from "../usg_record_context"
import { formatBigInt, formatBigIntAsNumber } from "@/lib/number_formatter"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { doMarketLeverage, doZapLeverage, getLeverageFormState } from "./usg_record_leverage_controller"
import { computedMinAmountOut, computeSwapAssetPrice, computeTransactionPotentialLoss, doApprove, matchBlockChainErrors } from "../usg_record_controller"

type USGLeverageContextProps = {
  children: ReactNode
}

export type BuyAndMinOutFormatted = {
  expectedFormatted: string
  minOutFormatted: string
  expectedWei?: bigint
  minOutWei?: bigint
}

type USGLeverageContextValues = {
  collateralInfo: AssetDataPriced

  isDepositDisabled: boolean
  setIsDepositDisabled: (arg: boolean) => void

  isLeverageAllPosition: boolean
  setIsLeverageAllPosition: (arg: boolean) => void

  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void
  actionApprove: () => void
  formState: FormState
  borrowWeiValue?: bigint
  setBorrowWeiValue: (arg: bigint | undefined) => void
  setDepositAsset: (arg: string) => void
  depositAsset: string | undefined

  isDepositLoading: boolean
  setIsDepositLoading: (arg: boolean) => void

  isZapLoading: boolean
  setIsZapLoading: (arg: boolean) => void

  isDumpUSGLoading: boolean
  setIsDumpUSGLoading: (arg: boolean) => void

  swapAssetPrice: number | null

  zapValue: bigint | undefined
  setZapValue: (arg: bigint) => void
  handleDepositChange: (arg: bigint | undefined) => void
  depositAssetInfo: AssetDataPriced | CollateralInfo

  slippage: number
  setSlippage: (arg: number) => void

  depositSliderPercent: number
  setDepositSliderPercent: (arg: number) => void

  leveragePercentage: number
  setLeveragePercentage: (arg: number) => void

  handleZapInputChange: (arg: bigint | undefined) => void

  actionLeverage: () => void

  actionZapLeverage: () => void

  leveragedCollateralQuote: bigint | undefined
  setLeveragedCollateralQuote: (arg: bigint) => void

  expectedCollateral: { sum: string; result: string }

  zapValuesFormatted: BuyAndMinOutFormatted
  usgDumpValuesFormatted: BuyAndMinOutFormatted
  swapValuesFormatted: BuyAndMinOutFormatted

  maxDepositString: string

  computedDepositAmount: bigint

  isZapping: boolean

  handleLeverageSliderChange: (arg: number) => void

  handleBorrowChange: (arg: bigint | undefined) => Promise<void>

  leverageInfo: { sliderLegendValues: string[]; startEndRange: [string, string, string]; maxLeverage: number }

  // aprVariation: { current: string; currentUpdated: string; projected: string; projectedUpdated: string }
  slippageLoss: { tokenLoss: string; dollarLoss: string }

  isTransactionBlockedBySlippage: boolean
  setIsTransactionBlockedBySlippage: (arg: boolean) => void

  priceImpactLoss: string

  priceImpact: number

  isTransactionBlockedByPriceImpact: boolean
  setIsTransactionBlockedByPriceImpact: (arg: boolean) => void

  leverageExceedsMaxLtv: boolean

  USGDumpPriceImpact: number

  USGDumpDollarLoss: number
}

export const USGLeverageContext = createContext<USGLeverageContextValues | undefined>(undefined)

export const USGLeverageProvider = ({ children }: USGLeverageContextProps) => {
  const {
    marketData,
    marketInfo,
    balanceAllowanceData,
    futureMarketDisplayData,
    collateralInfo,
    fetchBalanceAllowanceData,
    loadOnChainData,
    setCurrentAmounts,
    setIsTxLoading,
    isTxLoading,
  } = useUSGRecordContext()

  const { globalData } = useUSGMaketListContext()

  const { curveRoutes, handleQuote } = useRootContext()

  const { loadUSGsUSGMetrics } = useUSGContext()

  const { isWellConnected, walletClient, currentAddress } = useWalletConnexionContext()

  const [isDepositDisabled, setIsDepositDisabled] = useState<boolean>(false)

  const [isLeverageAllPosition, setIsLeverageAllPosition] = useState<boolean>(false)

  const [depositAsset, setDepositAsset] = useState<string | undefined>(undefined)

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

  const [leveragePercentage, setLeveragePercentage] = useState<number>(1)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()

  const [zapValue, setZapValue] = useState<bigint | undefined>()

  const [isDepositLoading, setIsDepositLoading] = useState(false)

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [isDumpUSGLoading, setIsDumpUSGLoading] = useState(false)

  const [leveragedCollateralQuote, setLeveragedCollateralQuote] = useState<bigint | undefined>()

  const [slippage, setSlippage] = useState<number>(0.2)

  const [isTransactionBlockedBySlippage, setIsTransactionBlockedBySlippage] = useState<boolean>(false)

  const [isTransactionBlockedByPriceImpact, setIsTransactionBlockedByPriceImpact] = useState<boolean>(false)

  const [priceImpact, setPriceImpact] = useState<number>(0)

  const [USGDumpPriceImpact, setUSGDumpPriceImpact] = useState<number>(0)

  const isZapping = useMemo(() => {
    const marketType = marketData?.marketType
    if (!depositAsset) return false

    return ![collateralInfo?.symbol, `${getReceiptPrefix(marketType)}${collateralInfo?.symbol}`].includes(depositAsset)
  }, [depositAsset, collateralInfo?.symbol])

  const depositAssetInfo = useMemo<AssetDataPriced | CollateralInfo>(() => {
    if (!!marketData && depositAsset === `Gauge ${collateralInfo?.symbol}`) {
      return {
        address: marketData?.constants?.receipt,
        decimals: 18,
        displayDecimals: 5,
        symbol: `Gauge ${collateralInfo?.symbol}`,
        name: `Gauge ${collateralInfo?.symbol}`,
        price: Number(formatUnits(marketData?.collateralInfos.collateralUSDPrice, 18)),
      }
    }

    if (!!marketData && (depositAsset === undefined || depositAsset === collateralInfo?.name)) {
      return { ...collateralInfo, price: Number(formatUnits(marketData?.collateralInfos.collateralUSDPrice, 18)) }
    }

    const assetInfo = ERC20S.find((el: Erc20Details) => el.name === depositAsset || el.symbol === depositAsset) || undefined

    if (!swapAssetPrice || !assetInfo) return collateralInfo

    const asset: AssetDataPriced = {
      address: assetInfo?.address,
      decimals: assetInfo?.decimals,
      displayDecimals: assetInfo?.displayDecimals || 2,
      symbol: assetInfo?.symbol,
      name: assetInfo?.name,
      price: swapAssetPrice,
    }

    return asset
  }, [depositAsset, swapAssetPrice, marketData])

  function computeBorrowValue(leveragedCollateralAmount: bigint, leverageFactor: number) {
    const collatToBuy = (leveragedCollateralAmount * parseUnits((leverageFactor - 1).toString(), 2)) / 100n
    const expectedCollateralFinalDollarValue = (collatToBuy * (marketData?.collateralInfos.collateralUSDPrice || 0n)) / parseEther("1")
    const usgAmountToBorrow = (expectedCollateralFinalDollarValue * parseEther("1")) / globalData.usgPriceWei
    return usgAmountToBorrow
  }

  const activeInputRef = useRef<"deposit" | "zap" | null>(null)
  const requestIdRef = useRef<number>(0)

  async function handleDepositChange(value: bigint | undefined) {
    activeInputRef.current = "deposit"
    const valueWei = BigInt(value || 0n)
    setDepositWeiValue(valueWei)

    // NO ZAP CASE
    if (!value || !depositAssetInfo || depositAssetInfo.address === marketInfo?.collatAddress) {
      const borrowedAmount = computeBorrowValue(valueWei, leveragePercentage)
      setBorrowWeiValue(borrowedAmount)
      await quoteDumpUSG(borrowedAmount)
      return
    }

    //  ZAP CASE
    const requestId = ++requestIdRef.current
    setIsZapLoading(true)

    getQuote(value, currentAddress, marketInfo?.collatAddress, depositAssetInfo?.address, curveRoutes)
      .then(async ({ quote, priceImpact: pI }) => {
        if (requestId !== requestIdRef.current) return

        const { validQuote, validPriceImpact } = handleQuote(quote, pI)

        if (validPriceImpact >= 0 && validQuote) {
          const borrowedAmount = computeBorrowValue(validQuote, leveragePercentage)
          setBorrowWeiValue(borrowedAmount)
          await quoteDumpUSG(borrowedAmount)
          setZapValue(validQuote)
          setPriceImpact(Number(validPriceImpact) / 100)
        }
      })
      .catch((e) => {
        if (requestId !== requestIdRef.current) return
        console.error("Error fetching zap value:", e)
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsZapLoading(false)
      })
  }

  async function handleZapInputChange(value: bigint | undefined) {
    activeInputRef.current = "zap"
    const valueWei = value ?? 0n

    setZapValue(valueWei)

    if (!value || !currentAddress || !depositAssetInfo) {
      setDepositWeiValue(undefined)
      return
    }

    const requestId = ++requestIdRef.current
    setIsDepositLoading(true)

    const borrowedAmount = computeBorrowValue(valueWei, leveragePercentage)
    setBorrowWeiValue(borrowedAmount)
    await quoteDumpUSG(borrowedAmount)

    getQuote(valueWei, currentAddress, depositAssetInfo?.address, marketInfo?.collatAddress, curveRoutes)
      .then(({ quote, priceImpact: pI }) => {
        if (requestId !== requestIdRef.current) return

        const { validQuote, validPriceImpact } = handleQuote(quote, pI)

        if (validPriceImpact >= 0 && validQuote) {
          setDepositWeiValue(BigInt(validQuote))
          setPriceImpact(Number(validPriceImpact) / 100)
        } else {
          setDepositWeiValue(undefined)
        }
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return
        console.error("Error fetching depositWeiValue:", err)
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsDepositLoading(false)
      })
  }

  const leverageDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestDumpUSGRequest = useRef(0)

  async function handleBorrowChange(borrowValue: bigint | undefined) {
    await quoteDumpUSG(borrowWeiValue)
    setBorrowWeiValue(borrowValue)
    const depositDollarValueWei = (((isZapping ? zapValue : depositWeiValue) || 0n) * (marketData?.collateralInfos.collateralUSDPrice || 0n)) / parseEther("1")
    const totalCollatDollarValue = depositDollarValueWei + (borrowValue || 0n)
    const leverageMultiplicator = Number(formatEther((totalCollatDollarValue * parseEther("1")) / depositDollarValueWei))

    setLeveragePercentage(leverageMultiplicator < leverageInfo.maxLeverage ? leverageMultiplicator : leverageInfo.maxLeverage)
  }

  // Computes the current LTV of the connected position
  const currentLTV = useMemo(() => {
    if (marketData) {
      if (marketData.collateralInfos.positionCollateralUSDValue !== 0n) {
        return (marketData.debtInfos.userDebt * 10n ** 18n) / marketData.collateralInfos.positionCollateralUSDValue
      } else {
        return maxUint256
      }
    }
    return 0n
  }, [marketData])

  function handleLeverageSliderChange(leverageValue: number) {
    setLeveragePercentage(leverageValue)

    if (leverageDebounceRef.current) clearTimeout(leverageDebounceRef.current)

    leverageDebounceRef.current = setTimeout(async () => {
      const amountToDeposit = isZapping && zapValue ? BigInt(zapValue) : BigInt(depositWeiValue || 0n)
      const amountStaked = marketData?.collateralInfos.positionCollateralAmount || 0n
      const maxLTV = (marketData?.constants.maxLTV || 0n) * 10n ** 13n
      const leveragedAmount = amountToDeposit + (amountStaked * (maxLTV - currentLTV)) / maxLTV
      const borrowWeiValue = computeBorrowValue(leveragedAmount, leverageValue)
      setBorrowWeiValue(borrowWeiValue)

      await quoteDumpUSG(borrowWeiValue)
    }, 400)
  }

  useEffect(() => {
    if (!depositAsset) return

    const fetchSwapAssetData = async () => {
      setIsZapLoading(true)
      try {
        const data = await computeSwapAssetPrice(depositAsset)
        setSwapAssetPrice(data || 0)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    fetchSwapAssetData()

    setDepositWeiValue(undefined)
    setDepositSliderPercent(0)

    setZapValue(undefined)

    setBorrowWeiValue(undefined)
    setLeveragePercentage(1)

    setLeveragedCollateralQuote(undefined)
  }, [depositAsset])

  useEffect(() => {
    if (zapValue && borrowWeiValue && leveragedCollateralQuote && !isDepositLoading) {
      setCurrentAmounts({
        depositWeiValue: (depositWeiValue || 0n) + leveragedCollateralQuote,
        borrowWeiValue: borrowWeiValue || 0n,
        zapValue: (BigInt(zapValue) || 0n) + leveragedCollateralQuote,
      })
    } else if (borrowWeiValue && leveragedCollateralQuote && !isDepositLoading) {
      setCurrentAmounts({
        depositWeiValue: (depositWeiValue || 0n) + leveragedCollateralQuote,
        borrowWeiValue: borrowWeiValue || 0n,
        zapValue: 0n,
      })
    }
  }, [depositWeiValue, borrowWeiValue, zapValue, leveragedCollateralQuote, isDepositLoading])

  useEffect(() => {
    setCurrentAmounts({
      depositWeiValue: 0n,
      borrowWeiValue: 0n,
      zapValue: 0n,
    })
  }, [])

  const actionApprove = async () => {
    if (walletClient && depositWeiValue) {
      setIsTxLoading(true)

      try {
        await toastTx(doApprove(walletClient, depositAssetInfo?.address, marketInfo?.marketAddress, depositWeiValue), {
          pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
          success: () => ({
            type: "Success",
            content: `${depositAssetInfo?.symbol} approved successfully.`,
          }),
          error: (err) => {
            const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
            return { type: "Error", content: error || "Unable to proceed with the transaction." }
          },
        })

        loadOnChainData()
        fetchBalanceAllowanceData(depositAssetInfo?.address)
        setIsTxLoading(false)
      } catch {
        setIsTxLoading(false)
      }
    }
  }

  const actionZapLeverage = async () => {
    try {
      if (!walletClient || !currentAddress || !depositWeiValue || !borrowWeiValue || !depositAssetInfo || !leveragedCollateralQuote || !zapValue) {
        toast.error(ToastComponent, { data: { type: "Error", content: "Error while computing leverage data." } })
        return
      }

      setIsTxLoading(true)

      const leverageData = await getRoute(
        USG_CONTRACT.USG,
        marketInfo?.collatAddress,
        borrowWeiValue,
        computedMinAmountOut(leveragedCollateralQuote, slippage),
        marketInfo?.marketAddress,
        USG_CONTRACT.ZAPPER,
        curveRoutes
      )

      const zapData = await getRoute(
        depositAssetInfo?.address,
        marketInfo?.collatAddress,
        depositWeiValue,
        computedMinAmountOut(zapValue, slippage),
        marketInfo?.marketAddress,
        currentAddress!,
        curveRoutes,
        currentAddress!
      )

      await toastTx(
        doZapLeverage(
          borrowWeiValue,
          computedMinAmountOut(leveragedCollateralQuote, slippage),
          leverageData!,
          depositAssetInfo?.address,
          depositWeiValue,
          computedMinAmountOut(zapValue, slippage),
          zapData!,
          walletClient,
          marketInfo?.marketAddress
        ),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: "Position successfully created.",
          }),
          error: () => {
            setIsTxLoading(false)
            return { type: "Error", content: "Something went wrong." }
          },
        }
      )

      resetAfterLeverageSuccess()
      setIsTxLoading(false)
    } catch (err) {
      console.error("ERROR : ", err)
      setIsTxLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Something went wrong." } })
    }
  }

  const actionLeverage = async () => {
    try {
      setIsTxLoading(true)

      if (!walletClient || !currentAddress || !leveragedCollateralQuote || !borrowWeiValue) return

      const leverageData = await getRoute(
        USG_CONTRACT.USG,
        marketInfo?.collatAddress,
        borrowWeiValue,
        leveragedCollateralQuote,
        marketInfo?.marketAddress,
        USG_CONTRACT.ZAPPER,
        curveRoutes
      )

      const isReceiptIn = marketData?.constants?.receipt.toLowerCase() === depositAssetInfo?.address.toLowerCase()

      await toastTx(
        doMarketLeverage(marketInfo?.marketAddress, walletClient, depositWeiValue || 0n, borrowWeiValue, leveragedCollateralQuote, isReceiptIn, leverageData!),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: "Position successfully created.",
          }),
          error: (err) => {
            const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
            return { type: "Error", content: error || "Unable to proceed with the transaction." }
          },
        }
      )

      resetAfterLeverageSuccess()
      setIsTxLoading(false)
    } catch (e) {
      console.error(e)
      setIsTxLoading(false)
    }
  }

  const resetAfterLeverageSuccess = () => {
    setIsLeverageAllPosition(false)
    setIsDepositDisabled(false)
    setCurrentAmounts({})
    setZapValue(undefined)
    setDepositWeiValue(undefined)
    setBorrowWeiValue(undefined)
    setLeveragedCollateralQuote(undefined)
    setDepositSliderPercent(0)
    setIsTxLoading(false)
    setLeveragePercentage(1)
    loadUSGsUSGMetrics()
    loadOnChainData()
    fetchBalanceAllowanceData(depositAssetInfo?.address)
  }

  const expectedCollateral = useMemo(() => {
    const quoteDetail = { sum: "", result: `0 ${collateralInfo?.symbol}` }

    if (marketData) {
      if (zapValue && leveragedCollateralQuote) {
        quoteDetail.sum = ` ${formatBigIntAsNumber(zapValue, 18, 3)} + ${formatBigIntAsNumber(leveragedCollateralQuote, 18, 3)}  ~= `
        quoteDetail.result = `${formatBigIntAsNumber(leveragedCollateralQuote + BigInt(zapValue || 0n), 18, 3)}  ${collateralInfo?.symbol}`
      } else if (depositWeiValue && leveragedCollateralQuote && !isLeverageAllPosition) {
        quoteDetail.sum = ` ${formatBigIntAsNumber(depositWeiValue, 18, 3)} + ${formatBigIntAsNumber(leveragedCollateralQuote, 18, 3)}  ~= `
        quoteDetail.result = `${formatBigIntAsNumber(leveragedCollateralQuote + depositWeiValue, 18, 3)}  ${collateralInfo?.symbol}`
      } else if (leveragedCollateralQuote && isDepositDisabled) {
        quoteDetail.sum = ` ${formatBigIntAsNumber(marketData?.collateralInfos?.positionCollateralAmount || 0n, 18, 3)} + ${formatBigIntAsNumber(leveragedCollateralQuote, 18, 3)}  ~= `
        quoteDetail.result = `${formatBigIntAsNumber(leveragedCollateralQuote + (marketData?.collateralInfos?.positionCollateralAmount || 0n), 18, 3)}  ${collateralInfo?.symbol}`
      } else if (depositWeiValue && leveragedCollateralQuote && isLeverageAllPosition) {
        quoteDetail.sum = ` ${formatBigIntAsNumber(marketData?.collateralInfos?.positionCollateralAmount + depositWeiValue, 18, 3)} + ${formatBigIntAsNumber(leveragedCollateralQuote, 18, 3)}  ~= `
        quoteDetail.result = `${formatBigIntAsNumber(leveragedCollateralQuote + (marketData?.collateralInfos?.positionCollateralAmount + depositWeiValue), 18, 3)}  ${collateralInfo?.symbol}`
      }
    }
    return quoteDetail
  }, [zapValue, depositWeiValue, leveragedCollateralQuote, collateralInfo?.symbol, marketData, isLeverageAllPosition, isDepositDisabled])

  // const aprVariation = useMemo(() => {
  //   let apr = { current: "", currentUpdated: "-", projected: "", projectedUpdated: "-" }

  //   if (marketData) {
  //     if (marketAprs && zapValue && leveragedCollateralQuote) {
  //       apr = computeAprVariation(marketAprs, currentConvexTVL, marketData, leveragedCollateralQuote + BigInt(zapValue))
  //     } else if (marketAprs && depositWeiValue && leveragedCollateralQuote) {
  //       apr = computeAprVariation(marketAprs, currentConvexTVL, marketData, leveragedCollateralQuote + depositWeiValue)
  //     } else {
  //       apr = computeAprVariation(marketAprs, currentConvexTVL, marketData, 0n)
  //     }
  //   }
  //   return apr
  // }, [zapValue, depositWeiValue, leveragedCollateralQuote, marketData, currentConvexTVL])

  const zapValuesFormatted = useMemo(() => {
    if (zapValue) {
      const minAmountOutWei = computedMinAmountOut(zapValue, slippage)
      return {
        expectedWei: zapValue,
        minOutWei: minAmountOutWei,
        expectedFormatted: formatBigInt(zapValue, collateralInfo?.decimals, collateralInfo.displayDecimals),
        minOutFormatted: formatBigInt(minAmountOutWei, collateralInfo?.decimals, collateralInfo.displayDecimals),
      }
    }

    return { expectedFormatted: "-", minOutFormatted: "-" }
  }, [zapValue, slippage])

  const usgDumpValuesFormatted = useMemo(() => {
    if (leveragedCollateralQuote) {
      const minAmountOutWei = computedMinAmountOut(leveragedCollateralQuote, slippage)
      return {
        expectedWei: leveragedCollateralQuote,
        minOutWei: minAmountOutWei,
        expectedFormatted: formatBigInt(leveragedCollateralQuote, collateralInfo?.decimals, collateralInfo.displayDecimals),
        minOutFormatted: formatBigInt(minAmountOutWei, collateralInfo?.decimals, collateralInfo.displayDecimals),
      }
    }
    return { expectedFormatted: "-", minOutFormatted: "-" }
  }, [leveragedCollateralQuote, slippage])

  const swapValuesFormatted = useMemo(() => {
    const symbol = collateralInfo.symbol

    let expectedFormatted = "- " + symbol
    let minOutFormatted = "- " + symbol
    const collatDecimals = collateralInfo.decimals
    const collatDisplayDecimals = collateralInfo.displayDecimals

    if (!isZapLoading && !isDepositLoading) {
      // ZAP AND LEVERAGE
      if (isZapping) {
        if (usgDumpValuesFormatted.expectedWei && zapValuesFormatted.expectedWei) {
          const isOneOfBothValueAbsent = zapValuesFormatted.expectedFormatted === "-" || usgDumpValuesFormatted.expectedFormatted === "-"
          // One of both swap is not quoted
          if (!isOneOfBothValueAbsent) {
            const sumExpected = formatBigInt(usgDumpValuesFormatted.expectedWei + BigInt(zapValuesFormatted.expectedWei), collatDecimals, collatDisplayDecimals)
            const sumMinOut = formatBigInt(usgDumpValuesFormatted.minOutWei + zapValuesFormatted.minOutWei, collatDecimals, collatDisplayDecimals)

            expectedFormatted = `${zapValuesFormatted.expectedFormatted} + ${usgDumpValuesFormatted.expectedFormatted} = ${sumExpected} ${symbol}`
            minOutFormatted = `${zapValuesFormatted.minOutFormatted} + ${usgDumpValuesFormatted.minOutFormatted} = ${sumMinOut} ${symbol}`
          }
        }
      }
      // LEVERAGE CLASSIC
      else {
        // Quote is ready
        if (usgDumpValuesFormatted.expectedFormatted !== "-" && depositWeiValue && usgDumpValuesFormatted.expectedWei) {
          const depositCollatFormatted = formatBigInt(depositWeiValue, collatDecimals, collatDecimals)
          const sumExpected = formatBigInt(depositWeiValue + usgDumpValuesFormatted.expectedWei, collatDecimals, collatDisplayDecimals)
          const sumMinOut = formatBigInt(depositWeiValue + usgDumpValuesFormatted.minOutWei, collatDecimals, collatDisplayDecimals)

          expectedFormatted = `${depositCollatFormatted} + ${usgDumpValuesFormatted.expectedFormatted} = ${sumExpected} ${symbol}`
          minOutFormatted = `${depositCollatFormatted} + ${usgDumpValuesFormatted.minOutFormatted} = ${sumMinOut} ${symbol}`
        }
      }
    }

    return {
      expectedFormatted,
      minOutFormatted,
    }
  }, [zapValuesFormatted.minOutFormatted, usgDumpValuesFormatted.minOutFormatted, isZapLoading, isDepositLoading])

  const leverageExceedsMaxLtv = useMemo(() => {
    const computedLtv = futureMarketDisplayData.ltv.substring(0, futureMarketDisplayData.ltv.length - 1)

    const ltvAsNumber = Number(computedLtv)

    return !!expectedCollateral && !!futureMarketDisplayData && ltvAsNumber > Number(marketData?.constants?.maxLTV) / 1000
  }, [expectedCollateral, futureMarketDisplayData, marketData])

  const leverageBalanceAllowanceData = useMemo(() => {
    if (!!marketData && depositAsset === collateralInfo?.name) {
      return { balance: marketData?.collateralBalance, allowance: marketData?.collateralAllowance }
    } else if (!!balanceAllowanceData && depositAsset !== collateralInfo?.name) {
      return { balance: balanceAllowanceData?.balance, allowance: balanceAllowanceData?.allowances[0]?.allowance }
    }
    return { balance: 0n, allowance: 0n }
  }, [marketData, balanceAllowanceData])

  const formState = useMemo(
    () =>
      getLeverageFormState(
        isTransactionBlockedByPriceImpact,
        isTransactionBlockedBySlippage,
        marketData,
        leverageExceedsMaxLtv,
        depositWeiValue,
        borrowWeiValue,
        !isDepositDisabled,
        isWellConnected,
        depositAssetInfo!,
        collateralInfo!,
        leverageBalanceAllowanceData!,
        leveragePercentage!,
        isZapLoading || isDepositLoading || isTxLoading
      ),
    [
      marketData,
      isDepositDisabled,
      borrowWeiValue,
      depositWeiValue,
      isWellConnected,
      currentAddress,
      depositAssetInfo,
      leverageBalanceAllowanceData,
      leverageExceedsMaxLtv,
      leveragePercentage,
      isTransactionBlockedByPriceImpact,
      isTransactionBlockedBySlippage,
      isZapLoading || isDepositLoading || isTxLoading,
    ]
  )

  useEffect(() => {
    if (depositAssetInfo) {
      fetchBalanceAllowanceData(depositAssetInfo?.address)
    }
  }, [depositAssetInfo])

  async function quoteDumpUSG(value: bigint | undefined) {
    if (value) {
      setIsDumpUSGLoading(true)

      const requestId = ++latestDumpUSGRequest.current

      getQuote(value, currentAddress!, marketInfo?.collatAddress, USG_CONTRACT.USG, curveRoutes)
        .then(({ quote, priceImpact: pI }) => {
          // Do nothing when price is stale
          if (requestId !== latestDumpUSGRequest.current) return // stale
          const { validQuote, validPriceImpact } = handleQuote(quote, pI)

          if (validPriceImpact >= 0 && validQuote) {
            setUSGDumpPriceImpact(validPriceImpact)
            setLeveragedCollateralQuote(validQuote)
          }
        })
        .catch((e) => {
          console.error(e)
          if (requestId !== latestDumpUSGRequest.current) return
          toast.error(ToastComponent, { data: { type: "Error", content: "USG to Collateral quote failed." } })
        })
        .finally(() => {
          if (requestId === latestDumpUSGRequest.current) setIsDumpUSGLoading(false)
        })
    }
  }

  const maxDepositString = useMemo(() => {
    const asset = depositAssetInfo?.symbol

    let amountDisplayed = "0"

    if (!!balanceAllowanceData && currentAddress && (isZapping || depositAssetInfo?.address == marketData?.constants?.receipt)) {
      amountDisplayed = formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)
    }
    if (currentAddress && !isZapping) {
      amountDisplayed = formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)
    }
    return `Max ${amountDisplayed} ${asset}`
  }, [currentAddress, depositAssetInfo, balanceAllowanceData, isZapping])

  const computedDepositAmount = useMemo(() => {
    if (!marketData?.collateralInfos) return 0n

    if (!isDepositDisabled && !isLeverageAllPosition) {
      return !!zapValue ? zapValue : depositWeiValue || 0n
    }

    if (isDepositDisabled && !isLeverageAllPosition) {
      return marketData?.collateralInfos?.positionCollateralAmount
    }

    if (!isDepositDisabled && isLeverageAllPosition) {
      return marketData?.collateralInfos?.positionCollateralAmount + (depositWeiValue || 0n)
    }

    return 0n
  }, [zapValue, depositWeiValue, isDepositDisabled, isLeverageAllPosition, marketData])

  const leverageInfo = useMemo(() => {
    const ltv = Number(formatUnits(marketData?.constants?.maxLTV || 0n, 5))
    const maxLeverageRaw = 1 / (1 - ltv)
    // 2% marging on maxLeverage to take into account liquidity price impact
    const safeMaxLeverage = maxLeverageRaw * 0.98
    const rounded = Math.floor(safeMaxLeverage * 100) / 100

    return {
      sliderLegendValues: Array.from({ length: rounded }, (_, i) => String(i + 1)),
      startEndRange: ["1", String(rounded), "0.01"] as [string, string, string],
      maxLeverage: rounded,
    }
  }, [marketData?.constants])

  const priceImpactLoss = useMemo(() => {
    const { dollarLoss } = computeTransactionPotentialLoss(zapValue as bigint, collateralInfo, priceImpact)

    return dollarLoss
  }, [zapValue, priceImpact])

  const slippageLoss = useMemo(() => {
    const { tokenLoss, dollarLoss } = computeTransactionPotentialLoss(zapValue as bigint, collateralInfo, slippage)

    return { tokenLoss, dollarLoss }
  }, [slippage, zapValue])

  const USGDumpDollarLoss = useMemo(() => {
    if (!borrowWeiValue || !leveragedCollateralQuote || !collateralInfo?.price || !globalData.usgPriceWei) {
      return 0
    }

    const collateralDollarValue = (leveragedCollateralQuote * BigInt(Math.round(collateralInfo.price * 1e18))) / BigInt(10n ** 18n)
    const borrowDollarValue = (borrowWeiValue * globalData.usgPriceWei) / BigInt(10n ** 18n)

    const dollarLoss = (borrowDollarValue - collateralDollarValue) / BigInt(10n ** 18n)

    return dollarLoss >= 0 ? Number(dollarLoss) : 0
  }, [borrowWeiValue, leveragedCollateralQuote, collateralInfo?.price, globalData.usgPriceWei])

  useEffect(() => {
    setIsTransactionBlockedBySlippage(!!depositWeiValue && slippage >= 1)
  }, [slippage, depositWeiValue])

  useEffect(() => {
    setIsTransactionBlockedByPriceImpact(!!depositWeiValue && (priceImpact >= 1 || USGDumpPriceImpact >= 1))
  }, [priceImpact, depositWeiValue, USGDumpPriceImpact])

  const contextValue: USGLeverageContextValues = {
    collateralInfo,

    isDepositDisabled,

    setIsDepositDisabled,
    depositWeiValue,
    setDepositWeiValue,
    actionApprove,
    actionLeverage,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
    setDepositAsset,
    depositAsset,

    isDepositLoading,
    setIsDepositLoading,

    isZapLoading,
    setIsZapLoading,

    isDumpUSGLoading,
    setIsDumpUSGLoading,

    zapValue,
    setZapValue,

    handleDepositChange,
    swapAssetPrice,

    depositAssetInfo,

    slippage,
    setSlippage,

    depositSliderPercent,
    setDepositSliderPercent,

    leveragePercentage,
    setLeveragePercentage,

    leveragedCollateralQuote,
    setLeveragedCollateralQuote,

    handleZapInputChange,

    actionZapLeverage,

    zapValuesFormatted,
    usgDumpValuesFormatted,
    swapValuesFormatted,

    expectedCollateral,

    maxDepositString,

    // aprVariation,

    isLeverageAllPosition,
    setIsLeverageAllPosition,

    computedDepositAmount,

    isZapping,
    handleLeverageSliderChange,
    handleBorrowChange,

    leverageInfo,

    slippageLoss,

    isTransactionBlockedBySlippage,
    setIsTransactionBlockedBySlippage,

    priceImpactLoss,

    priceImpact,

    isTransactionBlockedByPriceImpact,
    setIsTransactionBlockedByPriceImpact,

    leverageExceedsMaxLtv,

    USGDumpPriceImpact,

    USGDumpDollarLoss,
  }

  return <USGLeverageContext.Provider value={contextValue}>{children}</USGLeverageContext.Provider>
}

export const useUSGLeverageContext = () => {
  const context = useContext(USGLeverageContext)
  if (!context) {
    throw new Error("useUSGLeverageContext must be used within a USGLeverageProvider")
  }
  return context
}
