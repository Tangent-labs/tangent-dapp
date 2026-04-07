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
import { opportunities } from "../../../app/(products)/(usg)/earn/aprOpportunities.json"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { EarnPoolsData, getConvexPools, getCurvePools, getPendlePools, getStakeDAOPools } from "../usg/client_api_external"
import { deposit, fetchQuote, getFormState, mapPredepositStatus, TOTAL_DEPOSIT_CAP, TOTAL_TAN_ALLOCATION } from "./predeposit.controller"

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
  setUSGfrxUSDDepositValue: (v: bigint) => void

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

  isWhitelisted: boolean

  setDepositMaxUSGUSDC: () => void

  setDepositMaxUSGfrxUSD: () => void

  projectedfrxUSDTANAllocation: bigint

  projectedUSDCTANAllocation: bigint

  minUSGUSDCReceived: string

  minUSGfrxUSDReceived: string

  isUSGUSDCTransactionBlockedBySlippage: boolean
  setIsUSDGUSDCTransactionBlockedBySlippage: (v: boolean) => void

  isUSGfrxUSDTransactionBlockedBySlippage: boolean
  setIsUSGfrxUSDTransactionBlockedBySlippage: (v: boolean) => void

  USGUSDCSlippageLoss: { tokenLoss: string; dollarLoss: string }
  USGfrxUSDSlippageLoss: { tokenLoss: string; dollarLoss: string }

  opportunitiesData: EarnPoolsData[]
}

export const PredepositContext = createContext<PredepositContextValues | undefined>(undefined)

export const PredepositProvider = ({ children }: PredepositContextProps) => {
  const { currentAddress, walletClient, isWalletContextLoaded } = useWalletConnexionContext()

  const { getCachedCurrentBlock } = useRootContext()

  const [isfrxUSDDepositLoading, setIsfrxUSDDepositLoading] = useState<boolean>(false)

  const [isUSDCDepositLoading, setIsUSDCDepositLoading] = useState<boolean>(false)

  const [opportunitiesData, setOpportunitiesData] = useState<EarnPoolsData[]>([])

  const [slippage, setSlippage] = useState<number>(0.2)
  const [frxUSDslippage, setfrxUSDSlippage] = useState<number>(0.2)

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

  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false)

  const [isUSGUSDCTransactionBlockedBySlippage, setIsUSDGUSDCTransactionBlockedBySlippage] = useState<boolean>(false)

  const [isUSGfrxUSDTransactionBlockedBySlippage, setIsUSGfrxUSDTransactionBlockedBySlippage] = useState<boolean>(false)

  const hasPromptedSign = useRef(false)

  const getUserStatus = useCallback(async () => {
    try {
      const status = await fetchUserStatus(currentAddress || zeroAddress)
      if (!status) return

      const mappedStatus: PredepositStatus = mapPredepositStatus(status)
      setPredepositStatus(mappedStatus)

      if (currentAddress === zeroAddress) return

      const userCanSignAndAccessPredeposit =
        (mappedStatus.predepositState === "deposit_private" && mappedStatus.userState === "private") || mappedStatus.predepositState === "deposit_public"

      if (mappedStatus.isSigned && (mappedStatus.userState === "private" || mappedStatus.predepositState === "deposit_public")) {
        setIsWhitelisted(true)
      } else if (userCanSignAndAccessPredeposit && !mappedStatus.isSigned && !hasPromptedSign.current) {
        hasPromptedSign.current = true
        await signMessage()
      } else {
        setIsWhitelisted(false)
      }
    } catch (error) {
      console.error("Failed to fetch user status:", error)
    }
  }, [currentAddress])

  useEffect(() => {
    if (!isWalletContextLoaded) return

    getUserStatus()

    if (currentAddress !== zeroAddress) {
      const timer = setInterval(getUserStatus, 12000)
      return () => clearInterval(timer)
    } else {
      hasPromptedSign.current = false
      setIsWhitelisted(false)
    }
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
    setUSDCDepositValue(value)

    const getUSDCPredepositQuote = async (depositValue: bigint) => {
      const quote = await fetchQuote(depositValue, USGTokens[1]["USG-USDC"])
      setUSGUSDCDepositValue(quote)
    }

    getUSDCPredepositQuote(value || 0n)
  }

  const handleDepositfrxUSDChange = (value: bigint | undefined) => {
    setfrxUSDDepositValue(value)

    const getfrxUSDPredepositQuote = async (depositValue: bigint) => {
      const quote = await fetchQuote(depositValue, USGTokens[1]["USG-frxUSD"])
      setUSGfrxUSDDepositValue(quote)
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
    if (predepositStatus) {
      return getFormState(
        isUSDCDepositLoading,
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
      haveToApprove: true,
    }
  }, [
    USDCDepositValue,
    predepositStatus,
    currentAddress,
    USDCBalanceAllowance,
    USGUSDCDepositValue,
    isUSGUSDCTransactionBlockedBySlippage,
    isUSDCDepositLoading,
  ])

  const USGfrxUSDformState = useMemo(() => {
    if (predepositStatus) {
      return getFormState(
        isfrxUSDDepositLoading,
        isUSGfrxUSDTransactionBlockedBySlippage,
        frxUSDDepositValue,
        USGfrxUSDDepositValue,
        frxUSDBalanceAllowance,
        predepositStatus?.USGfrxUSDData?.USGfrxUSDCap,
        predepositStatus?.USGfrxUSDData?.USGfrxUSDAccumulatedTotal
      )
    }
    return { canProcess: false, errors: [], haveToApprove: false }
  }, [
    frxUSDDepositValue,
    predepositStatus,
    currentAddress,
    frxUSDBalanceAllowance,
    USGfrxUSDDepositValue,
    isUSGfrxUSDTransactionBlockedBySlippage,
    isfrxUSDDepositLoading,
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
      const message = `I, owner of wallet ${currentAddress?.toLowerCase()} assess to participate to the predeposit campaign.`

      if (walletClient && currentAddress) {
        const signature = await walletClient.signMessage({
          account: currentAddress,
          message,
        })

        const currentBlock = await getCachedCurrentBlock()
        const now = new Date(Number(currentBlock.timestamp) * 1000)

        validatePredepositSignature(signature, currentAddress, now)
          .then((resp) => {
            if (resp) {
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

              setIsWhitelisted(true)
            } else {
              toast.dismiss(pendingToastId)
              setIsWhitelisted(false)
            }
          })
          .catch((err) => {
            console.error("err : ", err)

            setIsWhitelisted(false)

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

      setIsWhitelisted(false)

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
      if (USDCBalanceAllowance?.balance * 10n ** 12n <= predepositStatus?.USGUSDCData?.USGUSDCCap - predepositStatus?.USGUSDCData?.USGUSDCAccumulatedTotal) {
        valueToFill = USDCBalanceAllowance?.balance
      } else {
        valueToFill = (predepositStatus?.USGUSDCData?.USGUSDCCap - predepositStatus?.USGUSDCData?.USGUSDCAccumulatedTotal) / 10n ** 12n
      }
    }
    handleDepositChange(valueToFill)
  }

  const setDepositMaxUSGfrxUSD = () => {
    let valueToFill = 0n

    if (!!predepositStatus?.USGfrxUSDData) {
      if (frxUSDBalanceAllowance?.balance <= predepositStatus?.USGfrxUSDData?.USGfrxUSDCap - predepositStatus?.USGfrxUSDData?.USGfrxUSDAccumulatedTotal) {
        valueToFill = USDCBalanceAllowance?.balance
      } else {
        valueToFill = predepositStatus?.USGfrxUSDData?.USGfrxUSDCap - predepositStatus?.USGfrxUSDData?.USGfrxUSDAccumulatedTotal
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
    setIsUSDGUSDCTransactionBlockedBySlippage(!!USGUSDCDepositValue && slippage >= 1)
  }, [slippage, USGUSDCDepositValue])

  useEffect(() => {
    setIsUSGfrxUSDTransactionBlockedBySlippage(!!USGfrxUSDDepositValue && frxUSDslippage >= 1)
  }, [frxUSDslippage, USGfrxUSDDepositValue])

  const fetchPoolsData = async () => {
    const [curvePools, convexPools, stakeDaoPools, pendlePools] = await Promise.all([getCurvePools(), getConvexPools(), getStakeDAOPools(), getPendlePools()])

    const mappedPools = mapPoolsAndTasks(curvePools, convexPools, stakeDaoPools, pendlePools, opportunities)

    setOpportunitiesData(mappedPools)
  }

  useEffect(() => {
    fetchPoolsData()
  }, [])

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
    isWhitelisted,
    setDepositMaxUSGUSDC,
    setDepositMaxUSGfrxUSD,
    projectedUSDCTANAllocation,
    projectedfrxUSDTANAllocation,
    minUSGUSDCReceived,
    minUSGfrxUSDReceived,
    isUSGUSDCTransactionBlockedBySlippage,
    setIsUSDGUSDCTransactionBlockedBySlippage,
    USGUSDCSlippageLoss,
    isUSGfrxUSDTransactionBlockedBySlippage,
    setIsUSGfrxUSDTransactionBlockedBySlippage,
    USGfrxUSDSlippageLoss,
    opportunitiesData,
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
