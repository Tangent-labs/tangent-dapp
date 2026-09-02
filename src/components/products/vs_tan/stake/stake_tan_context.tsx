"use client"

import { formatEther, formatUnits } from "viem"
import { useUSGContext } from "../../usg/usg_context"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { toastTx } from "@/components/design_system/toast"
import { AssetDataPriced } from "@/types"
import { FormState } from "../../usg/usg_type"
import { StakingAssetInfo, StakingDepositType, TANStakingInfo } from "../rstan_types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doApprove, doStakeTAN, doUnstakeTAN, getExpectedsTAN, getExpectedTAN, getTanStakeFormState } from "./stake_tan_controller"
import { matchBlockChainErrors } from "../../usg/record/usg_record_controller"

type StakeTanContextProps = {
  children: ReactNode
}

type StakeTanContextValues = {
  weiValue?: bigint
  setWeiValue: (arg: bigint | undefined) => void

  currentFeature: "stake" | "unstake"
  setCurrentFeature: (arg: "stake" | "unstake") => void

  expected?: bigint

  actionApprove: () => void
  actionStake: () => void
  actionUnstake: () => void

  currentAssetInfo?: StakingAssetInfo
  receivedTokenInfo?: AssetDataPriced

  hasToApprove: boolean

  computeProjectedValue: number

  formState: FormState

  stakePercentage: number
  setStakePercentage: (arg: number) => void

  TANsTANMetrics: TANStakingInfo | undefined

  sTanSelectedTab: string
  apyHistory: Array<{ date: number; uv: number }>
  fetchsTanHistoryAPY: (range: string) => Promise<void>

  isLoading: boolean
}

export const StakeTanContext = createContext<StakeTanContextValues | undefined>(undefined)

const toastErrorMapper = (err: unknown) => {
  const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
  return { type: "Error" as const, content: error || "Unable to proceed with the transaction." }
}

export const StakeTanProvider = ({ children }: StakeTanContextProps) => {
  const { walletClient, isWellConnected } = useWalletConnexionContext()

  const { loadTanSTANMetrics, TANsTANMetrics } = useUSGContext()

  const [currentFeature, setCurrentFeature] = useState<"stake" | "unstake">("stake")

  const [weiValue, setWeiValue] = useState<bigint | undefined>()

  const [expected, setExpected] = useState<bigint | undefined>()

  const [stakePercentage, setStakePercentage] = useState<number>(0)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [sTanSelectedTab, setsTanSelectedTab] = useState<string>("1m")

  // There is no sTAN APY history endpoint yet — the chart renders its empty state, exactly as the
  // sUSG one does today. Swap in a real fetch once the API serves it.
  const [apyHistory] = useState<Array<{ date: number; uv: number }>>([])

  const fetchsTanHistoryAPY = async (range: string) => {
    setsTanSelectedTab(range)
  }

  const receivedTokenInfo = useMemo(() => {
    if (!TANsTANMetrics?.sTanPrice) return

    if (currentFeature === "stake") {
      return {
        address: VSTAN_CONTRACT.STAN,
        decimals: 18,
        displayDecimals: 2,
        logo: "sTAN",
        name: "sTAN",
        price: Number(formatEther(TANsTANMetrics?.sTanPrice)),
        symbol: "sTAN",
        balance: TANsTANMetrics?.sTanBalance,
      }
    }

    return {
      address: VSTAN_CONTRACT.TAN,
      decimals: 18,
      displayDecimals: 2,
      logo: "TAN",
      name: "TAN",
      price: Number(formatEther(TANsTANMetrics?.tanPrice)),
      symbol: "TAN",
      balance: TANsTANMetrics?.tanBalance,
    }
  }, [currentFeature, TANsTANMetrics])

  const currentAssetInfo = useMemo(() => {
    if (!TANsTANMetrics?.sTanPrice) return

    if (currentFeature === "stake") {
      return {
        current: "asset" as StakingDepositType,
        address: VSTAN_CONTRACT.TAN,
        balance: TANsTANMetrics?.tanBalance,
        asset: {
          price: Number(formatEther(TANsTANMetrics?.tanPrice)),
          decimals: 18,
          address: VSTAN_CONTRACT.TAN,
          displayDecimals: 2,
          symbol: "TAN",
          name: "TAN",
          logo: "TAN",
        },
      }
    }

    return {
      current: "sdAsset" as StakingDepositType,
      address: VSTAN_CONTRACT.STAN,
      balance: TANsTANMetrics?.sTanBalance,
      asset: {
        price: Number(formatEther(TANsTANMetrics?.sTanPrice)),
        decimals: 18,
        address: VSTAN_CONTRACT.STAN,
        displayDecimals: 2,
        symbol: "sTAN",
        name: "sTAN",
        logo: "sTAN",
      },
    }
  }, [currentFeature, TANsTANMetrics])

  const formState = useMemo<FormState>(
    () => getTanStakeFormState(TANsTANMetrics!, currentFeature, weiValue, expected, isWellConnected),
    [TANsTANMetrics, currentFeature, weiValue, expected, isWellConnected]
  )

  const hasToApprove = useMemo(() => {
    if (!weiValue) return true

    if (currentFeature === "stake" && weiValue && TANsTANMetrics) {
      return weiValue > TANsTANMetrics?.tanAllowance
    }

    return false
  }, [TANsTANMetrics, currentFeature, weiValue])

  const actionUnstake = async () => {
    if (isLoading || !weiValue || weiValue === 0n || !currentAssetInfo?.current) return

    setIsLoading(true)

    try {
      await toastTx(doUnstakeTAN({ walletClient: walletClient!, stakingAddress: VSTAN_CONTRACT.STAN, weiValue }), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({ type: "Success", content: "Successfully unstaked." }),
        error: toastErrorMapper,
      })

      loadTanSTANMetrics()
      setWeiValue(undefined)
      setExpected(undefined)
    } catch {
      // toastTx already surfaced the failure
    } finally {
      setIsLoading(false)
    }
  }

  const actionStake = async () => {
    if (isLoading || !weiValue || weiValue === 0n || !currentAssetInfo?.current) return

    setIsLoading(true)

    try {
      await toastTx(doStakeTAN({ walletClient: walletClient!, stakingAddress: VSTAN_CONTRACT.STAN, weiValue }), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({ type: "Success", content: "Successfully staked." }),
        error: toastErrorMapper,
      })

      loadTanSTANMetrics()
      setWeiValue(undefined)
      setExpected(undefined)
    } catch {
      // toastTx already surfaced the failure
    } finally {
      setIsLoading(false)
    }
  }

  const actionApprove = async () => {
    if (isLoading || !walletClient) return

    setIsLoading(true)

    try {
      await toastTx(doApprove(walletClient, VSTAN_CONTRACT.TAN, weiValue || 0n, VSTAN_CONTRACT.STAN), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
        success: () => ({ type: "Success", content: "TAN approved successfully." }),
        error: toastErrorMapper,
      })

      loadTanSTANMetrics()
    } catch {
      // toastTx already surfaced the failure
    } finally {
      setIsLoading(false)
    }
  }

  // Preview of what the vault would mint/return for the typed amount
  useEffect(() => {
    if (!weiValue || weiValue === 0n || !walletClient) return
    ;(async () => {
      try {
        const amountOut =
          currentFeature === "stake"
            ? await getExpectedsTAN(walletClient, weiValue, VSTAN_CONTRACT.STAN)
            : await getExpectedTAN(walletClient, weiValue, VSTAN_CONTRACT.STAN)

        setExpected(amountOut)
      } catch (error) {
        console.error(`Error while estimating the ${currentFeature} preview :`, error)
      }
    })()
  }, [weiValue, currentFeature, walletClient])

  const computeProjectedValue = useMemo(() => {
    const balance = Number(formatUnits(TANsTANMetrics?.sTanBalance || 0n, 18))
    const amount = Number(formatUnits(weiValue || 0n, 18))

    return currentFeature === "stake" ? balance + amount : balance - amount
  }, [currentFeature, weiValue, TANsTANMetrics])

  useEffect(() => {
    setExpected(undefined)
    setWeiValue(undefined)
    setStakePercentage(0)
  }, [currentFeature])

  const contextValue: StakeTanContextValues = {
    actionStake,
    actionApprove,
    actionUnstake,
    setCurrentFeature,
    setWeiValue,
    computeProjectedValue,
    currentFeature,
    weiValue,
    expected,
    currentAssetInfo,
    receivedTokenInfo,
    hasToApprove,
    formState,
    stakePercentage,
    setStakePercentage,
    TANsTANMetrics,
    sTanSelectedTab,
    apyHistory,
    fetchsTanHistoryAPY,
    isLoading,
  }

  return <StakeTanContext.Provider value={contextValue}>{children}</StakeTanContext.Provider>
}

export const useStakeTanContext = () => {
  const context = useContext(StakeTanContext)
  if (!context) {
    throw new Error("useStakeTanContext must be used within a StakeTanProvider")
  }
  return context
}
