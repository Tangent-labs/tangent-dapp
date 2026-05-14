"use client"

import {
  computedMinAmountOut,
  computeTransactionPotentialLoss,
  doApprove,
  getBalancesAndAllowances,
  matchBlockChainErrors,
} from "../usg/record/usg_record_controller"

import { toast } from "react-toastify"
import { FormState } from "../usg/usg_type"
import { AssetDataPriced } from "@/types"
import { PredepositStatus } from "./types/types"
import { USGTokens } from "../usg/usg_repository"
import { useRootContext } from "../root/root_context"
import { mapPoolsAndTasks } from "../usg/earn/utils"
import { COMMON_ERC20S } from "@tangent/defi-resources"
import { getTokensPrice } from "@/services/service_price"
import { Address, formatUnits, WalletClient, zeroAddress } from "viem"
import { formatNumber, truncateDecimals } from "@/lib/number_formatter"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"
import { fetchUserStatus, validatePredepositSignature } from "./api/client.api"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { EarnPoolsData, getConvexPools, getCurvePools, getCurveSubgraph, getPendlePools, getStakeDAOPools } from "../usg/client_api_external"
import { getConvexRates } from "../usg/earn/usg_earn_controller"
import { AssetPrices } from "@/types/type_asset"
import { deposit, fetchQuote, getFormState, mapPredepositStatus, TOTAL_DEPOSIT_CAP, TOTAL_TAN_ALLOCATION } from "./predeposit.controller"
import { opportunities } from "@/app/(products)/(usg)/earn/aprOpportunities"
import { PREDEPOSIT_MESSAGE_SIGN } from "./message"

type PredepositContextProps = {
  children: ReactNode
}

type PredepositContextValues = {
  isUSDCDepositLoading: boolean
  isfrxUSDDepositLoading: boolean

  slippage: number
  setSlippage: (v: number) => void

  frxUSDslippage: number
  setfrxUSDSlippage: (v: number) => void

  USGUSDCDepositValue: bigint | undefined
  setUSGUSDCDepositValue: (v: bigint | undefined) => void

  USGfrxUSDDepositValue: bigint | undefined
  setUSGfrxUSDDepositValue: (v: bigint | undefined) => void

  USDCInfo: AssetDataPriced

  frxUSDInfo: AssetDataPriced

  USDCDepositSliderPercent: number
  setUSDCDepositSliderPercent: (v: number) => void

  frxUSDDepositSliderPercent: number
  setfrxUSDDepositSliderPercent: (v: number) => void

  USDCBalanceAllowance: { balance: bigint; allowance: bigint }

  frxUSDBalanceAllowance: { balance: bigint; allowance: bigint }

  USDCDepositValue: bigint | undefined
  setUSDCDepositValue: (v: bigint | undefined) => void

  frxUSDDepositValue: bigint | undefined
  setfrxUSDDepositValue: (v: bigint | undefined) => void

  handleDepositChange: (arg: bigint | undefined) => void

  handleDepositfrxUSDChange: (arg: bigint | undefined) => void

  USGUSDCInnerValue: number

  USGfrxUSDInnerValue: number

  USGUSDCformState: FormState

  USGfrxUSDformState: FormState

  actionApproveUSGUSDC: () => void

  actionDepositUSGUSDC: () => void

  actionApproveUSGfrxUSD: () => void

  actionDepositUSGfrxUSD: () => void

  predepositStatus: PredepositStatus | null

  setDepositMaxUSGUSDC: () => void

  setDepositMaxUSGfrxUSD: () => void

  projectedfrxUSDTANAllocation: bigint

  projectedUSDCTANAllocation: bigint

  minUSGUSDCReceived: string

  minUSGfrxUSDReceived: string

  isUSGUSDCTransactionBlockedBySlippage: boolean
  setIsUSGUSDCTransactionBlockedBySlippage: (v: boolean) => void

  isUSGfrxUSDTransactionBlockedBySlippage: boolean
  setIsUSGfrxUSDTransactionBlockedBySlippage: (v: boolean) => void

  USGUSDCSlippageLoss: { tokenLoss: string; dollarLoss: string }
  USGfrxUSDSlippageLoss: { tokenLoss: string; dollarLoss: string }

  opportunitiesData: EarnPoolsData[]

  isQuoteLoading: boolean

  isfrxUSDQuoteLoading: boolean

  signMessage: () => void
  isFetchApiInitialLoading: boolean
  isSigningLoading: boolean

  isDisplayYouAreNotWL: boolean
  isDisplayBlurry: boolean
}

export const PredepositContext = createContext<PredepositContextValues | undefined>(undefined)

export const PredepositProvider = ({ children }: PredepositContextProps) => {
  const { currentAddress, walletClient, isWalletContextLoaded, isConnected } = useWalletConnexionContext()

  const { getCachedCurrentBlock } = useRootContext()

  const [isfrxUSDDepositLoading, setIsfrxUSDDepositLoading] = useState<boolean>(false)

  const [isUSDCDepositLoading, setIsUSDCDepositLoading] = useState<boolean>(false)

  const [opportunitiesData, setOpportunitiesData] = useState<EarnPoolsData[]>([])

  const [slippage, setSlippage] = useState<number>(0.05)
  const [frxUSDslippage, setfrxUSDSlippage] = useState<number>(0.05)

  const [USDCDepositValue, setUSDCDepositValue] = useState<bigint>()
  const [frxUSDDepositValue, setfrxUSDDepositValue] = useState<bigint>()

  const [USGUSDCDepositValue, setUSGUSDCDepositValue] = useState<bigint | undefined>()
  const [USGfrxUSDDepositValue, setUSGfrxUSDDepositValue] = useState<bigint | undefined>()

  const [USDCDepositSliderPercent, setUSDCDepositSliderPercent] = useState<number>(0)
  const [frxUSDDepositSliderPercent, setfrxUSDDepositSliderPercent] = useState<number>(0)

  const [USDCPrice, setUSDCPrice] = useState<number>(1)
  const [frxUSDPrice, setfrxUSDPrice] = useState<number>(1)

  const [USDCBalanceAllowance, setUSDCBalanceAllowance] = useState<{ balance: bigint; allowance: bigint }>({ balance: 0n, allowance: 0n })
  const [frxUSDBalanceAllowance, setfrxUSDBalanceAllowance] = useState<{ balance: bigint; allowance: bigint }>({ balance: 0n, allowance: 0n })

  const [USGUSDCInnerValue, setUSGUSDCInnerValue] = useState<number>(
    USGUSDCDepositValue !== undefined ? Number(formatUnits(USGUSDCDepositValue || BigInt(0), 18)) : 0
  )

  const [USGfrxUSDInnerValue, setUSGfrxUSDInnerValue] = useState<number>(
    USGfrxUSDDepositValue !== undefined ? Number(formatUnits(USGfrxUSDDepositValue || BigInt(0), 18)) : 0
  )

  const [predepositStatus, setPredepositStatus] = useState<PredepositStatus | null>(null)

  const [isFetchApiInitialLoading, setIsFetchApiLoading] = useState<boolean>(true)

  const [isQuoteLoading, setIsQuoteLoading] = useState<boolean>(false)

  const [isSigningLoading, setIsSigningLoading] = useState<boolean>(false)

  const [isfrxUSDQuoteLoading, setIsfrxUSDQuoteLoading] = useState<boolean>(false)

  const [isUSGUSDCTransactionBlockedBySlippage, setIsUSGUSDCTransactionBlockedBySlippage] = useState<boolean>(false)

  const [isUSGfrxUSDTransactionBlockedBySlippage, setIsUSGfrxUSDTransactionBlockedBySlippage] = useState<boolean>(false)

  async function getUserStatus() {
    try {
      const status = await fetchUserStatus(currentAddress || zeroAddress)
      if (!status) return
      setPredepositStatus(mapPredepositStatus(status))

      if (currentAddress === zeroAddress) return
    } catch (error) {
      console.error("Failed to fetch user status:", error)
    } finally {
      setIsFetchApiLoading(false)
    }
  }

  useEffect(() => {
    if (!isWalletContextLoaded) return
    // Initial call
    getUserStatus()

    // Call every 12 sec for actualization approx every block
    const interval = setInterval(() => {
      getUserStatus()
    }, 12000)

    return () => clearInterval(interval) // cleanup
  }, [currentAddress, isWalletContextLoaded])

  useEffect(() => {
    if (walletClient && currentAddress !== zeroAddress) {
      fetchPrices()
      getUSGUSDCBalanceAllowance(walletClient)
      getUSGfrxUSDBalanceAllowance(walletClient)
    }
  }, [currentAddress])

  const getUSGUSDCBalanceAllowance = async (walletClient: WalletClient) => {
    const data = await getBalancesAndAllowances(walletClient!, COMMON_ERC20S.USDC, USGTokens[1]["USG-USDC"])

    if (data) setUSDCBalanceAllowance({ balance: data[0]?.balance, allowance: data[0]?.allowances[0].allowance })
  }

  const getUSGfrxUSDBalanceAllowance = async (walletClient: WalletClient) => {
    const data = await getBalancesAndAllowances(walletClient!, COMMON_ERC20S.frxUSD, USGTokens[1]["USG-frxUSD"])

    if (data) setfrxUSDBalanceAllowance({ balance: data[0]?.balance, allowance: data[0]?.allowances[0].allowance })
  }

  const fetchPrices = async () => {
    const data = await getTokensPrice([COMMON_ERC20S.frxUSD, COMMON_ERC20S.USDC])

    if (data) {
      setUSDCPrice(data[COMMON_ERC20S.USDC])
      setfrxUSDPrice(data[COMMON_ERC20S.frxUSD])
    }
  }

  const USDCInfo = useMemo(() => {
    return {
      address: COMMON_ERC20S.USDC as Address,
      decimals: 6,
      displayDecimals: 2,
      symbol: "USDC",
      name: "USD Coin",
      logoKey: "USDC",
      price: USDCPrice,
    }
  }, [USDCPrice])

  const frxUSDInfo = useMemo(() => {
    return {
      address: COMMON_ERC20S.frxUSD as Address,
      decimals: 18,
      displayDecimals: 2,
      symbol: "frxUSD",
      name: "Frax USD",
      logoKey: "frxUSD",
      price: frxUSDPrice,
    }
  }, [frxUSDPrice])

  const handleDepositChange = (value: bigint | undefined) => {
    setIsQuoteLoading(true)
    setUSGUSDCDepositValue(undefined)
    setUSDCDepositValue(value)

    const getUSDCPredepositQuote = async (depositValue: bigint) => {
      const [quote] = await Promise.all([fetchQuote(depositValue, USGTokens[1]["USG-USDC"]), new Promise((resolve) => setTimeout(resolve, 500))])
      setUSGUSDCDepositValue(quote)
      setIsQuoteLoading(false)
    }

    getUSDCPredepositQuote(value || 0n)
  }

  const handleDepositfrxUSDChange = (value: bigint | undefined) => {
    setIsfrxUSDQuoteLoading(true)
    setUSGfrxUSDDepositValue(undefined)
    setfrxUSDDepositValue(value)

    const getfrxUSDPredepositQuote = async (depositValue: bigint) => {
      const [quote] = await Promise.all([fetchQuote(depositValue, USGTokens[1]["USG-frxUSD"]), new Promise((resolve) => setTimeout(resolve, 500))])
      setUSGfrxUSDDepositValue(quote)
      setIsfrxUSDQuoteLoading(false)
    }

    getfrxUSDPredepositQuote(value || 0n)
  }

  useEffect(() => {
    if (USGUSDCDepositValue !== undefined) {
      const updatedValue = Number(Number(formatUnits(USGUSDCDepositValue || 0n, 18)).toFixed(3))
      setUSGUSDCInnerValue(updatedValue)
    } else {
      setUSGUSDCInnerValue(0)
    }
  }, [USGUSDCDepositValue])

  useEffect(() => {
    if (USGfrxUSDDepositValue !== undefined) {
      const updatedValue = Number(Number(formatUnits(USGfrxUSDDepositValue || 0n, 18)).toFixed(3))
      setUSGfrxUSDInnerValue(updatedValue)
    } else {
      setUSGfrxUSDInnerValue(0)
    }
  }, [USGfrxUSDDepositValue])

  const USGUSDCformState = useMemo(() => {
    if (predepositStatus && USDCDepositValue && USGUSDCDepositValue) {
      return getFormState(
        isUSDCDepositLoading || isQuoteLoading,
        isUSGUSDCTransactionBlockedBySlippage,
        USDCDepositValue,
        (USGUSDCDepositValue || 0n) / 10n ** 12n,
        USDCBalanceAllowance,
        predepositStatus?.USGUSDCData?.USGUSDCCap / 10n ** 12n,
        predepositStatus?.USGUSDCData?.USGUSDCAccumulatedTotal / 10n ** 12n
      )
    }

    return {
      canProcess: false,
      errors: [],
      haveToApprove: false,
    }
  }, [
    USDCDepositValue,
    predepositStatus,
    USDCBalanceAllowance,
    USGUSDCDepositValue,
    isUSGUSDCTransactionBlockedBySlippage,
    isUSDCDepositLoading,
    isQuoteLoading,
  ])

  const USGfrxUSDformState = useMemo(() => {
    if (predepositStatus && frxUSDDepositValue && USGfrxUSDDepositValue) {
      return getFormState(
        isfrxUSDDepositLoading || isfrxUSDQuoteLoading,
        isUSGfrxUSDTransactionBlockedBySlippage,
        frxUSDDepositValue,
        USGfrxUSDDepositValue,
        frxUSDBalanceAllowance,
        predepositStatus?.USGfrxUSDData?.USGfrxUSDCap,
        predepositStatus?.USGfrxUSDData?.USGfrxUSDAccumulatedTotal
      )
    }
    return {
      canProcess: false,
      errors: [],
      haveToApprove: false,
    }
  }, [
    frxUSDDepositValue,
    predepositStatus,
    frxUSDBalanceAllowance,
    USGfrxUSDDepositValue,
    isUSGfrxUSDTransactionBlockedBySlippage,
    isfrxUSDDepositLoading,
    isfrxUSDQuoteLoading,
  ])

  const actionApproveUSGUSDC = () => {
    if (walletClient && USDCDepositValue) {
      setIsUSDCDepositLoading(true)
      doApprove(walletClient, USDCInfo?.address, USGTokens[1]["USG-USDC"], USDCDepositValue)
        .then(() => {
          getUSGUSDCBalanceAllowance(walletClient)
          setIsUSDCDepositLoading(false)
          toast.success(ToastComponent, { data: { type: "Success", content: "USDC approved successfully." } })
        })
        .catch((err) => {
          setIsUSDCDepositLoading(false)
          const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
          toast.error(ToastComponent, { data: { type: "Error", content: error || "Unable to proceed with the transaction." } })
        })
    }
  }

  const actionApproveUSGfrxUSD = () => {
    if (walletClient && frxUSDDepositValue) {
      setIsfrxUSDDepositLoading(true)
      doApprove(walletClient, frxUSDInfo?.address, USGTokens[1]["USG-frxUSD"], frxUSDDepositValue)
        .then(() => {
          getUSGfrxUSDBalanceAllowance(walletClient)
          setIsfrxUSDDepositLoading(false)
          toast.success(ToastComponent, { data: { type: "Success", content: "frxUSD approved successfully." } })
        })
        .catch((err) => {
          setIsfrxUSDDepositLoading(false)
          const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
          toast.error(ToastComponent, { data: { type: "Error", content: error || "Unable to proceed with the transaction." } })
        })
    }
  }

  const actionDepositUSGUSDC = async () => {
    if (USGUSDCDepositValue && USDCDepositValue) {
      setIsUSDCDepositLoading(true)
      try {
        await toastTx(deposit(walletClient!, USDCDepositValue, computedMinAmountOut(USGUSDCDepositValue, slippage), USGTokens[1]["USG-USDC"]), {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: "USDC successfully deposited.",
          }),
          error: () => {
            return { type: "Error", content: "Unable to proceed with the deposit." }
          },
        })

        getUSGUSDCBalanceAllowance(walletClient!)
        setUSDCDepositValue(undefined)
        setUSDCDepositSliderPercent(0)
        setUSGUSDCDepositValue(0n)
        setIsUSDCDepositLoading(false)
      } catch (e) {
        console.error(e)
        setIsUSDCDepositLoading(false)
      }
    }
  }

  const actionDepositUSGfrxUSD = async () => {
    if (USGfrxUSDDepositValue && frxUSDDepositValue) {
      setIsfrxUSDDepositLoading(true)
      try {
        await toastTx(deposit(walletClient!, frxUSDDepositValue, computedMinAmountOut(USGfrxUSDDepositValue, slippage), USGTokens[1]["USG-frxUSD"]), {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: "frxUSD successfully deposited.",
          }),
          error: () => {
            return { type: "Error", content: "Unable to proceed with the deposit." }
          },
        })

        getUSGfrxUSDBalanceAllowance(walletClient!)
        setfrxUSDDepositValue(undefined)
        setfrxUSDDepositSliderPercent(0)
        setUSGfrxUSDDepositValue(0n)
        setIsfrxUSDDepositLoading(false)
      } catch (e) {
        console.error(e)
        setIsfrxUSDDepositLoading(false)
      }
    }
  }

  const signMessage = async () => {
    setIsSigningLoading(true)
    const pendingToastId = toast.info(ToastComponent, {
      data: {
        type: "Pending Transaction",
        content: "Pending signature awaiting validation...",
      },
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    })

    try {
      if (walletClient && currentAddress) {
        const signature = await walletClient.signMessage({
          account: currentAddress,
          message: PREDEPOSIT_MESSAGE_SIGN,
        })

        const currentBlock = await getCachedCurrentBlock()
        const now = new Date(Number(currentBlock.timestamp) * 1000)

        validatePredepositSignature(signature, currentAddress, now)
          .then((resp) => {
            if (resp) {
              setIsSigningLoading(false)
              getUserStatus()

              toast.update(pendingToastId, {
                render: ToastComponent,
                data: {
                  type: "Success",
                  content: "You are whitelisted.",
                },
                autoClose: 3000,
                closeOnClick: true,
                draggable: true,
              })
            } else {
              toast.dismiss(pendingToastId)
            }
          })
          .catch((err) => {
            setIsSigningLoading(false)
            console.error("err : ", err)

            toast.update(pendingToastId, {
              render: ToastComponent,
              data: {
                type: "Error",
                content: "Signature failed.",
              },
              autoClose: 3000,
              closeOnClick: true,
              draggable: true,
            })
          })
      }
    } catch (e) {
      console.error("e : ", e)

      setIsSigningLoading(false)

      toast.update(pendingToastId, {
        render: ToastComponent,
        data: {
          type: "Error",
          content: "Signature failed.",
        },
        autoClose: 3000,
        closeOnClick: true,
        draggable: true,
      })
    }
  }

  const setDepositMaxUSGUSDC = () => {
    let valueToFill = 0n

    if (!!predepositStatus?.USGUSDCData) {
      const availableLeft = ((predepositStatus?.USGUSDCData?.USGUSDCCap || 0n) - (predepositStatus?.USGUSDCData?.USGUSDCAccumulatedTotal || 0n)) / 10n ** 12n
      const userBalance = USDCBalanceAllowance?.balance
      if (availableLeft > userBalance) {
        valueToFill = userBalance
      } else {
        valueToFill = availableLeft
      }
    }
    handleDepositChange(valueToFill)
  }

  const setDepositMaxUSGfrxUSD = () => {
    let valueToFill = 0n

    if (!!predepositStatus?.USGfrxUSDData) {
      const availableLeft = (predepositStatus?.USGfrxUSDData?.USGfrxUSDCap || 0n) - (predepositStatus?.USGfrxUSDData?.USGfrxUSDAccumulatedTotal || 0n)
      const userBalance = frxUSDBalanceAllowance?.balance
      if (availableLeft > userBalance) {
        valueToFill = userBalance
      } else {
        valueToFill = availableLeft
      }
    }
    handleDepositfrxUSDChange(valueToFill)
  }

  const projectedUSDCTANAllocation = useMemo(() => {
    if (USGUSDCDepositValue) {
      const minAmountOutWei = computedMinAmountOut(USGUSDCDepositValue, slippage)

      return (minAmountOutWei * TOTAL_TAN_ALLOCATION) / (TOTAL_DEPOSIT_CAP * 10n ** 18n)
    }
    return 0n
  }, [USGUSDCDepositValue, slippage])

  const projectedfrxUSDTANAllocation = useMemo(() => {
    if (USGfrxUSDDepositValue) {
      const minAmountOutWei = computedMinAmountOut(USGfrxUSDDepositValue, slippage)

      return (minAmountOutWei * TOTAL_TAN_ALLOCATION) / (TOTAL_DEPOSIT_CAP * 10n ** 18n)
    }
    return 0n
  }, [USGfrxUSDDepositValue, slippage])

  const minUSGUSDCReceived = useMemo(() => {
    if (USGUSDCDepositValue) {
      const minAmountOutWei = computedMinAmountOut(USGUSDCDepositValue, slippage)
      const result = `(${formatNumber(Number(truncateDecimals(formatUnits(minAmountOutWei, 18), 3)), 2)})`
      return result
    }

    return ""
  }, [USGUSDCDepositValue, slippage])

  const minUSGfrxUSDReceived = useMemo(() => {
    if (USGfrxUSDDepositValue) {
      const minAmountOutWei = computedMinAmountOut(USGfrxUSDDepositValue, frxUSDslippage)
      const result = `(${formatNumber(Number(truncateDecimals(formatUnits(minAmountOutWei, 18), 3)), 2)})`
      return result
    }

    return ""
  }, [USGfrxUSDDepositValue, frxUSDslippage])

  const USGUSDCSlippageLoss = useMemo(() => {
    const USGUSDCInfo = {
      address: USGTokens[1]["USG-USDC"],
      decimals: 18,
      displayDecimals: 3,
      symbol: "USG-USDC",
      name: "USG-USDC",
      logoKey: "USG-USDC",
      price: 1,
    }

    const { tokenLoss, dollarLoss } = computeTransactionPotentialLoss(USGUSDCDepositValue as bigint, USGUSDCInfo, slippage)

    return { tokenLoss, dollarLoss }
  }, [slippage, USGUSDCDepositValue])

  const USGfrxUSDSlippageLoss = useMemo(() => {
    const USGfrxUSDInfo = {
      address: USGTokens[1]["USG-frxUSD"],
      decimals: 18,
      displayDecimals: 3,
      symbol: "USG-frxUSD",
      name: "USG-frxUSD",
      logoKey: "USG-frxUSD",
      price: 1,
    }

    const { tokenLoss, dollarLoss } = computeTransactionPotentialLoss(USGfrxUSDDepositValue as bigint, USGfrxUSDInfo, frxUSDslippage)

    return { tokenLoss, dollarLoss }
  }, [frxUSDslippage, USGfrxUSDDepositValue])

  useEffect(() => {
    setIsUSGUSDCTransactionBlockedBySlippage(!!USGUSDCDepositValue && slippage >= 1)
  }, [slippage, USGUSDCDepositValue])

  useEffect(() => {
    setIsUSGfrxUSDTransactionBlockedBySlippage(!!USGfrxUSDDepositValue && frxUSDslippage >= 1)
  }, [frxUSDslippage, USGfrxUSDDepositValue])

  const fetchPoolsData = async () => {
    try {
      const pids = opportunities.filter((o) => o.protocolName === "Convex" && o.pid).map((o) => o.pid) as number[]

      const [curvePools, convexPools, stakeDaoPools, pendlePools, subgraphPools, convexRates] = await Promise.all([
        getCurvePools(),
        getConvexPools(),
        getStakeDAOPools(),
        getPendlePools(),
        getCurveSubgraph(),
        getConvexRates(pids),
      ])

      const tokens = new Set<Address>()
      convexRates
        .map((r) => r.yearlyRewardPerLp)
        .flat()
        .forEach((r) => r?.token && tokens.add(r.token as Address))

      const prices: AssetPrices | undefined = await getTokensPrice(Array.from(tokens)).catch(() => undefined)

      const mappedPools = mapPoolsAndTasks(curvePools, convexPools, stakeDaoPools, pendlePools, opportunities, subgraphPools, convexRates, prices)

      setOpportunitiesData(mappedPools)
    } catch (e) {
      console.error("fetchPoolsData failed", e)
    }
  }

  useEffect(() => {
    fetchPoolsData()
  }, [])

  const isDisplayYouAreNotWL = useMemo(() => {
    if (predepositStatus?.predepositState === "deposit_private") {
      return predepositStatus.userState !== "private"
    }
    return false
  }, [predepositStatus])

  const isDisplayBlurry = useMemo(
    () => !isConnected || isFetchApiInitialLoading || (isConnected && (isDisplayYouAreNotWL || !predepositStatus?.isSigned)),
    [isConnected, isFetchApiInitialLoading, isDisplayYouAreNotWL, predepositStatus?.isSigned]
  )

  const contextValue: PredepositContextValues = {
    isUSDCDepositLoading,
    isfrxUSDDepositLoading,
    slippage,
    setSlippage,
    frxUSDslippage,
    setfrxUSDSlippage,
    USGUSDCDepositValue,
    setUSGUSDCDepositValue,
    USDCInfo,
    frxUSDInfo,
    USGfrxUSDDepositValue,
    setUSGfrxUSDDepositValue,
    USDCDepositSliderPercent,
    setUSDCDepositSliderPercent,
    frxUSDDepositSliderPercent,
    setfrxUSDDepositSliderPercent,
    USDCBalanceAllowance,
    frxUSDBalanceAllowance,
    USDCDepositValue,
    handleDepositChange,
    setUSDCDepositValue,
    USGUSDCInnerValue,
    USGfrxUSDInnerValue,
    frxUSDDepositValue,
    setfrxUSDDepositValue,
    USGUSDCformState,
    USGfrxUSDformState,
    actionApproveUSGUSDC,
    actionDepositUSGUSDC,
    actionApproveUSGfrxUSD,
    actionDepositUSGfrxUSD,
    handleDepositfrxUSDChange,
    predepositStatus,

    setDepositMaxUSGUSDC,
    setDepositMaxUSGfrxUSD,
    projectedUSDCTANAllocation,
    projectedfrxUSDTANAllocation,
    minUSGUSDCReceived,
    minUSGfrxUSDReceived,
    isUSGUSDCTransactionBlockedBySlippage,
    setIsUSGUSDCTransactionBlockedBySlippage,
    USGUSDCSlippageLoss,
    isUSGfrxUSDTransactionBlockedBySlippage,
    setIsUSGfrxUSDTransactionBlockedBySlippage,
    USGfrxUSDSlippageLoss,
    opportunitiesData,
    isQuoteLoading,
    isfrxUSDQuoteLoading,
    signMessage,
    isFetchApiInitialLoading,
    isSigningLoading,
    isDisplayYouAreNotWL,
    isDisplayBlurry,
  }

  return <PredepositContext.Provider value={contextValue}>{children}</PredepositContext.Provider>
}

export const usePredepositContext = () => {
  const context = useContext(PredepositContext)
  if (!context) {
    throw new Error("usePredepositContext must be used within a PredepositProvider")
  }
  return context
}
