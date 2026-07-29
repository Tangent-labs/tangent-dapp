"use client"

import { toast } from "react-toastify"
import { ONE_ETHER } from "@/lib/utils"
import { useUSGContext } from "../../usg_context"
import { USG_CONTRACT } from "../../usg_repository"
import { Erc20Details, ERC20S } from "@/data/erc20s"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { formatEther, formatUnits, maxUint256 } from "viem"
import { getQuote, getRoute } from "../../global_quote_controller"
import { useRootContext } from "@/components/products/root/root_context"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { USGLeverageContextProps, USGLeverageContextValues } from "./types"
import { useUSGMaketListContext } from "../../list/usg_market_list_context"
import { getReceiptPrefix, useUSGRecordContext } from "../usg_record_context"
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { formatBigInt, formatBigIntAsNumber, formatBigIntFloor } from "@/lib/number_formatter"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { computeBorrowValue, computeMaxLeverageAdjusted, doMarketLeverage, doZapLeverage, getLeverageFormState } from "./usg_record_leverage_controller"
import { computedMinAmountOut, computeSwapAssetPrice, computeTransactionPotentialLoss, doApprove, matchBlockChainErrors } from "../usg_record_controller"

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

  const { loadUSGsUSGMetrics, USGsUSGMetrics } = useUSGContext()

  const { isWellConnected, walletClient, currentAddress } = useWalletConnexionContext()

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

  const activeInputRef = useRef<"deposit" | "zap" | null>(null)
  const requestIdRef = useRef<number>(0)

  async function handleDepositChange(value: bigint | undefined) {
    // Do nothing if marketData are not charged
    if (!marketData) {
      return
    }
    activeInputRef.current = "deposit"
    const inputValueWei = BigInt(value || 0n)

    setDepositWeiValue(inputValueWei)
    setPriceImpact(0)

    const maxLTV = (marketData?.constants.maxLTV || 0n) * 10n ** 13n
    const stakedCollatAmount = marketData?.collateralInfos.positionCollateralAmount || 0n

    const rebasedStakedCollatAmount = (stakedCollatAmount * (maxLTV - currentLTV)) / maxLTV

    // NO ZAP CASE
    if (!value || !depositAssetInfo || !isZapping) {
      const collatToLeverage = inputValueWei + rebasedStakedCollatAmount

      const maxLeverageAdjusted = computeMaxLeverageAdjusted(
        marketData?.constants.maxLTV || 0n,
        currentLTV,
        collatToLeverage,
        marketData?.collateralInfos.positionCollateralAmount || 0n,
        marketData?.constants.maxMarketDebt || 0n,
        marketData?.debtInfos.totalDebt || 0n,
        marketData?.collateralInfos.collateralUSDPrice || 1n,
        globalData.usgPriceWei
      )

      const newLeveragePercentage = leveragePercentage > maxLeverageAdjusted ? maxLeverageAdjusted : leveragePercentage

      // Adjust the leverage slider cursor after the maxLeverageAdjusted is computed.
      // Only when maxLeverageAdjusted becomes smaller than the current to dont be over the slider value
      setLeveragePercentage(newLeveragePercentage)

      const borrowedAmount = computeBorrowValue(
        collatToLeverage,
        marketData?.collateralInfos.collateralUSDPrice || 0n,
        globalData.usgPriceWei,
        newLeveragePercentage
      )
      const cappedBorrowAmount = borrowedAmount > remainingDebtBorrowable ? remainingDebtBorrowable : borrowedAmount
      setBorrowWeiValue(cappedBorrowAmount)
      await quoteDumpUSG(cappedBorrowAmount)
      return
    }
    //  ZAP CASE
    else {
      // Allows to take into account only the last fired quote and not the previous one
      // The input will load until the last request hasn't answered
      const requestId = ++requestIdRef.current
      setIsZapLoading(true)

      getQuote(value, currentAddress, marketInfo?.collatAddress, depositAssetInfo?.address, curveRoutes)
        .then(async ({ quote, priceImpact: pI }) => {
          if (requestId !== requestIdRef.current) return

          const { validQuote, validPriceImpact } = handleQuote(quote, pI)
          if (validPriceImpact >= 0 && validQuote) {
            const collatToLeverage = validQuote + rebasedStakedCollatAmount

            const maxLeverageAdjusted = computeMaxLeverageAdjusted(
              marketData?.constants.maxLTV || 0n,
              currentLTV,
              collatToLeverage,
              marketData?.collateralInfos.positionCollateralAmount || 0n,
              marketData?.constants.maxMarketDebt || 0n,
              marketData?.debtInfos.totalDebt || 0n,
              marketData?.collateralInfos?.collateralUSDPrice,
              globalData.usgPriceWei
            )

            const newLeveragePercentage = leveragePercentage > maxLeverageAdjusted ? maxLeverageAdjusted : leveragePercentage

            const borrowedAmount = computeBorrowValue(
              collatToLeverage,
              marketData?.collateralInfos.collateralUSDPrice,
              globalData.usgPriceWei,
              newLeveragePercentage
            )
            const cappedBorrowAmount = borrowedAmount > remainingDebtBorrowable ? remainingDebtBorrowable : borrowedAmount

            setLeveragePercentage(newLeveragePercentage)
            setBorrowWeiValue(cappedBorrowAmount)
            await quoteDumpUSG(cappedBorrowAmount)
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
  }

  async function handleZapInputChange(value: bigint | undefined) {
    activeInputRef.current = "zap"
    const valueWei = value ?? 0n
    const maxLTV = (marketData?.constants.maxLTV || 0n) * 10n ** 13n
    const stakedCollatAmount = marketData?.collateralInfos.positionCollateralAmount || 0n
    const rebasedStakedCollatAmount = (stakedCollatAmount * (maxLTV - currentLTV)) / maxLTV

    setZapValue(valueWei)
    setPriceImpact(0)

    if (!value || !currentAddress || !depositAssetInfo || !marketData?.collateralInfos) {
      setDepositWeiValue(undefined)
      return
    }

    const requestId = ++requestIdRef.current
    setIsDepositLoading(true)

    const collatToLeverage = valueWei + rebasedStakedCollatAmount

    // Regarding amounts in collateral in the deposit input
    // It's possible that the maximum leverage gets reduced related to the available USG to borrow on the market
    const maxLeverageAdjusted = computeMaxLeverageAdjusted(
      marketData?.constants.maxLTV || 0n,
      currentLTV,
      collatToLeverage,
      marketData?.collateralInfos.positionCollateralAmount || 0n,
      marketData?.constants.maxMarketDebt || 0n,
      marketData?.debtInfos.totalDebt || 0n,
      marketData?.collateralInfos?.collateralUSDPrice,
      globalData.usgPriceWei
    )

    const newLeveragePercentage = leveragePercentage > maxLeverageAdjusted ? maxLeverageAdjusted : leveragePercentage

    const borrowedAmount = computeBorrowValue(
      valueWei + rebasedStakedCollatAmount,
      marketData?.collateralInfos?.collateralUSDPrice,
      globalData.usgPriceWei,
      newLeveragePercentage
    )
    const cappedBorrowAmount = borrowedAmount > remainingDebtBorrowable ? remainingDebtBorrowable : borrowedAmount

    // Adjust the leverage slider cursor after the maxLeverageAdjusted is computed.
    setLeveragePercentage(newLeveragePercentage)
    setBorrowWeiValue(cappedBorrowAmount)
    await quoteDumpUSG(cappedBorrowAmount)
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
    const borrowWei = borrowValue || 0n
    await quoteDumpUSG(borrowWei)
    setBorrowWeiValue(borrowWei)

    const maxLTV = (marketData?.constants.maxLTV || 0n) * 10n ** 13n
    const collatValueToDeposit = (((isZapping ? zapValue : depositWeiValue) || 0n) * (marketData?.collateralInfos.collateralUSDPrice || 0n)) / ONE_ETHER
    const stakedCollateralUSDValue = marketData?.collateralInfos.positionCollateralUSDValue || 0n

    const leveragedUSD = collatValueToDeposit + (stakedCollateralUSDValue * (maxLTV - currentLTV)) / maxLTV

    const borrowUSDValue = (borrowWei * globalData.usgPriceWei) / ONE_ETHER

    const leverage = Number(formatEther(((leveragedUSD + borrowUSDValue) * ONE_ETHER) / leveragedUSD))

    setLeveragePercentage(leverage < leverageRange.maxLeverageAdjusted ? leverage : leverageRange.maxLeverageAdjusted)
  }

  function handleLeverageSliderChange(leverageValue: number) {
    setLeveragePercentage(leverageValue)

    if (leverageDebounceRef.current) clearTimeout(leverageDebounceRef.current)

    const amountToDeposit = isZapping && zapValue ? BigInt(zapValue) : BigInt(depositWeiValue || 0n)
    const amountStaked = marketData?.collateralInfos.positionCollateralAmount || 0n
    const maxLTV = (marketData?.constants.maxLTV || 0n) * 10n ** 13n
    const leveragedAmount = amountToDeposit + (amountStaked * (maxLTV - currentLTV)) / maxLTV

    setIsDumpUSGLoading(true)

    const borrowWeiValue = computeBorrowValue(leveragedAmount, marketData?.collateralInfos.collateralUSDPrice || 0n, globalData.usgPriceWei, leverageValue)
    const cappedBorrowWeiValue = borrowWeiValue > remainingDebtBorrowable ? remainingDebtBorrowable : borrowWeiValue
    setBorrowWeiValue(cappedBorrowWeiValue)

    leverageDebounceRef.current = setTimeout(async () => {
      await quoteDumpUSG(cappedBorrowWeiValue)
    }, 1200)
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

  useEffect(() => {
    if (!depositAsset) return

    const fetchSwapAssetData = async () => {
      setIsZapLoading(true)
      try {
        const data = await computeSwapAssetPrice(depositAsset, USGsUSGMetrics!.sUSGPrice, USGsUSGMetrics!.sUSGPrice)
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
          error: (err) => {
            const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
            return { type: "Error", content: error || "Unable to proceed with the transaction." }
          },
        }
      )
        .then(() => {
          resetAfterLeverageSuccess()
          setIsTxLoading(false)
        })
        .catch(() => {
          setIsTxLoading(false)
        })
    } catch (err) {
      console.error("ERROR : ", err)
      setIsTxLoading(false)
      const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
      toast.error(ToastComponent, { data: { type: "Error", content: error || "Unable to proceed with the transaction." } })
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
        computedMinAmountOut(leveragedCollateralQuote, slippage),
        marketInfo?.marketAddress,
        USG_CONTRACT.ZAPPER,
        curveRoutes
      )

      const isReceiptIn = marketData?.constants?.receipt.toLowerCase() === depositAssetInfo?.address.toLowerCase()

      await toastTx(
        doMarketLeverage(
          marketInfo?.marketAddress,
          walletClient,
          depositWeiValue || 0n,
          borrowWeiValue,
          computedMinAmountOut(leveragedCollateralQuote, slippage),
          isReceiptIn,
          leverageData!
        ),
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
        .then(() => {
          resetAfterLeverageSuccess()
          setIsTxLoading(false)
        })
        .catch(() => {
          setIsTxLoading(false)
        })
    } catch (e) {
      console.error(e)
      setIsTxLoading(false)
      const error = matchBlockChainErrors(typeof e === "string" ? e : e instanceof Error ? e.message : String(e))
      toast.error(ToastComponent, { data: { type: "Error", content: error || "Unable to proceed with the transaction." } })
    }
  }

  const resetAfterLeverageSuccess = () => {
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
      } else if (depositWeiValue && leveragedCollateralQuote) {
        quoteDetail.sum = ` ${formatBigIntAsNumber(depositWeiValue, 18, 3)} + ${formatBigIntAsNumber(leveragedCollateralQuote, 18, 3)}  ~= `
        quoteDetail.result = `${formatBigIntAsNumber(leveragedCollateralQuote + depositWeiValue, 18, 3)}  ${collateralInfo?.symbol}`
      }
    }
    return quoteDetail
  }, [zapValue, depositWeiValue, leveragedCollateralQuote, collateralInfo?.symbol, marketData])

  const zapValuesFormatted = useMemo(() => {
    if (zapValue) {
      const minAmountOutWei = computedMinAmountOut(zapValue, slippage)
      return {
        expectedWei: zapValue,
        minOutWei: minAmountOutWei,
        expectedFormatted: formatBigIntFloor(zapValue, collateralInfo?.decimals, collateralInfo.displayDecimals),
        minOutFormatted: formatBigIntFloor(minAmountOutWei, collateralInfo?.decimals, collateralInfo.displayDecimals),
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
            setUSGDumpPriceImpact(validPriceImpact / 100)
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

    if (balanceAllowanceData && currentAddress) {
      amountDisplayed = formatBigIntFloor(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)
    }
    return `Max ${amountDisplayed} ${asset}`
  }, [currentAddress, depositAssetInfo, balanceAllowanceData, isZapping])

  const remainingDebtBorrowable = useMemo(() => {
    if (!marketData) return 0n
    const delta = marketData.constants.maxMarketDebt - marketData.debtInfos.totalDebt
    return delta < 0n ? 0n : delta
  }, [marketData])

  // Max leverage recomputed each time the collateral value input is changing
  // Is needed because the maximum leverage doable depends on available amount on the market
  const leverageRange = useMemo(() => {
    if (marketData && globalData.usgPriceWei) {
      const ltv = Number(formatUnits(marketData?.constants?.maxLTV || 0n, 5))
      const maxLeverageRaw = 1 / (1 - ltv)
      // 2% marging on maxLeverage to take into account liquidity price impact
      const safeMaxLeverage = maxLeverageRaw * 0.98
      const availableToBorrow = remainingDebtBorrowable
      const amountToDeposit = isZapping && zapValue ? BigInt(zapValue) : BigInt(depositWeiValue || 0n)
      const amountStaked = marketData?.collateralInfos.positionCollateralAmount || 0n
      const maxLTV = (marketData?.constants.maxLTV || 0n) * 10n ** 13n

      const leveragedAmount = amountToDeposit + (amountStaked * (maxLTV - currentLTV)) / maxLTV
      let maxLeverageAdjusted = Math.floor(safeMaxLeverage * 100) / 100

      if (leveragedAmount > 0n) {
        const collateralPrice = marketData.collateralInfos.collateralUSDPrice || 1n
        const maxBorrowable = computeBorrowValue(leveragedAmount, collateralPrice, globalData.usgPriceWei, safeMaxLeverage)
        if (availableToBorrow < maxBorrowable) {
          // Market debt cap limits leverage — adjusted = availableToBorrow * usgPrice / (leveragedAmount * collateralPrice) + 1
          const adjusted = Number(formatEther((availableToBorrow * globalData.usgPriceWei * 10n ** 18n) / (leveragedAmount * collateralPrice))) + 1
          maxLeverageAdjusted = Math.min(maxLeverageAdjusted, Math.floor(adjusted * 100) / 100)
        }
      }

      const sliderLegendValues = Array.from({ length: maxLeverageAdjusted - 1 }, (_, i) => String(i + 1))

      const decimalPartMaxLeverage = maxLeverageAdjusted % 1

      if (maxLeverageAdjusted > 7) {
        if (decimalPartMaxLeverage > 0.25) {
          sliderLegendValues.push(Math.trunc(maxLeverageAdjusted).toString())
          sliderLegendValues.push(maxLeverageAdjusted.toString())
        } else {
          sliderLegendValues.push(maxLeverageAdjusted.toString())
        }
      } else {
        sliderLegendValues.push(Math.trunc(maxLeverageAdjusted).toString())
        sliderLegendValues.push(maxLeverageAdjusted.toString())
      }
      return {
        maxLeverageAdjusted: maxLeverageAdjusted,
        sliderLegendValues: sliderLegendValues,
        startEndRange: ["1", String(maxLeverageAdjusted), "0.01"] as [string, string, string],
      }
    }

    return {
      maxLeverageAdjusted: 10,
      sliderLegendValues: Array.from({ length: 10 }, (_, i) => String(i + 1)),
      startEndRange: ["1", String(10), "0.01"] as [string, string, string],
    }
  }, [isZapping, depositWeiValue, zapValue, marketData?.collateralInfos.positionCollateralAmount, globalData.usgPriceWei, remainingDebtBorrowable])

  // Total collateral on which slippage is applied
  const totalCollateralAmountReceived = useMemo(() => {
    return BigInt(zapValue || 0n) + (leveragedCollateralQuote || 0n)
  }, [zapValue, leveragedCollateralQuote])

  const priceImpactLoss = useMemo(() => {
    const { dollarLoss } = computeTransactionPotentialLoss(totalCollateralAmountReceived, collateralInfo, priceImpact)

    return dollarLoss
  }, [totalCollateralAmountReceived, priceImpact])

  const slippageLoss = useMemo(() => {
    const { tokenLoss, dollarLoss } = computeTransactionPotentialLoss(totalCollateralAmountReceived, collateralInfo, slippage)

    return { tokenLoss, dollarLoss }
  }, [slippage, totalCollateralAmountReceived])

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
    setIsTransactionBlockedByPriceImpact(!!depositWeiValue && (priceImpact >= 0.25 || USGDumpPriceImpact >= 0.25))
  }, [priceImpact, depositWeiValue, USGDumpPriceImpact])

  const formState = useMemo(
    () =>
      getLeverageFormState(
        isTransactionBlockedByPriceImpact,
        isTransactionBlockedBySlippage,
        marketData,
        leverageExceedsMaxLtv,
        depositWeiValue,
        borrowWeiValue,
        isWellConnected,
        depositAssetInfo!,
        collateralInfo!,
        leverageBalanceAllowanceData!,
        leveragePercentage!,
        isZapLoading || isDepositLoading || isTxLoading,
        leverageRange.maxLeverageAdjusted
      ),
    [
      marketData,
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
      leverageRange.maxLeverageAdjusted,
    ]
  )

  const contextValue: USGLeverageContextValues = {
    collateralInfo,
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
    isZapping,
    handleLeverageSliderChange,
    handleBorrowChange,
    leverageRange,
    slippageLoss,
    isTransactionBlockedBySlippage,
    setIsTransactionBlockedBySlippage,
    priceImpactLoss,
    priceImpact,
    isTransactionBlockedByPriceImpact,
    setIsTransactionBlockedByPriceImpact,
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
