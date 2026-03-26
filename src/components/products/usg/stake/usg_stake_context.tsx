"use client"

import { formatEther, formatUnits } from "viem"
import { useUSGContext } from "../usg_context"
import { getsUsgApyData } from "../client_api"
import { USG_CONTRACT } from "../usg_repository"
import { useRootContext } from "../../root/root_context"
import { convertRange } from "../../root/root_controller"
import { toastTx } from "@/components/design_system/toast"
import { AssetDataPriced, FormState } from "@/types"
import { StakingAssetInfo, StakingDepositType, USGStakingInfo } from "../usg_type"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doApprove, doStakeUSG, doUnstakeUSG, getExpectedSUSG, getExpectedUSG, getFormState } from "./usg_stake_controller"
import { matchBlockChainErrors } from "../record/usg_record_controller"

type USGStakeContextProps = {
  children: ReactNode
}

type USGStakeContextValues = {
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
  USGsUSGMetrics: USGStakingInfo | undefined

  sUSGSelectedTab: string
  setsUSGSelectedTab: (arg: string) => void

  apyHistory: Array<{ date: number; uv: number }>

  fetchsUSGHistoryAPY: (s: string) => Promise<void>

  isLoading: boolean

  // aprVariation: { current: string; updated: string }
}

export const USGStakeContext = createContext<USGStakeContextValues | undefined>(undefined)

export const USGStakeProvider = ({ children }: USGStakeContextProps) => {
  const { walletClient, canInteract } = useWalletConnexionContext()

  const { loadUSGsUSGMetrics, USGsUSGMetrics } = useUSGContext()

  const { getCachedCurrentBlock } = useRootContext()

  const [currentFeature, setCurrentFeature] = useState<"stake" | "unstake">("stake")

  const [sUSGSelectedTab, setsUSGSelectedTab] = useState<string>("1m")

  const [weiValue, setWeiValue] = useState<bigint | undefined>()

  const [expected, setExpected] = useState<bigint | undefined>()

  const [apyHistory, setAPYHistory] = useState<Array<{ date: number; uv: number }>>([])

  const [stakePercentage, setStakePercentage] = useState<number>(0)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    fetchsUSGHistoryAPY("1m")
  }, [])

  const receivedTokenInfo = useMemo(() => {
    if (!USGsUSGMetrics?.sUSGPrice) return

    if (currentFeature === "stake") {
      return {
        address: USG_CONTRACT.SUSG,
        decimals: 18,
        displayDecimals: 2,
        logo: "sUSG",
        name: "sUSG",
        price: Number(formatEther(USGsUSGMetrics?.sUSGPrice)),
        symbol: "sUSG",
        balance: USGsUSGMetrics?.sUSGBalance,
      }
    }

    return {
      address: USG_CONTRACT.USG,
      decimals: 18,
      displayDecimals: 2,
      logo: "USG",
      name: "USG",
      price: Number(formatEther(USGsUSGMetrics?.USGPrice)),
      symbol: "USG",
      balance: USGsUSGMetrics?.USGBalance,
    }
  }, [currentFeature, USGsUSGMetrics])

  const currentAssetInfo = useMemo(() => {
    if (!USGsUSGMetrics?.sUSGPrice) return
    if (currentFeature === "stake") {
      return {
        current: "asset" as StakingDepositType,
        address: USG_CONTRACT.USG,
        balance: USGsUSGMetrics?.USGBalance,
        asset: {
          price: Number(formatEther(USGsUSGMetrics?.USGPrice)),
          decimals: 18,
          address: USG_CONTRACT.USG,
          displayDecimals: 2,
          symbol: "USG",
          name: "USG",
          logo: "USG",
        },
      }
    }

    return {
      current: "sdAsset" as StakingDepositType,
      address: USG_CONTRACT.SUSG,
      balance: USGsUSGMetrics?.sUSGBalance,
      asset: {
        price: Number(formatEther(USGsUSGMetrics?.sUSGPrice)),
        decimals: 18,
        address: USG_CONTRACT.SUSG,
        displayDecimals: 2,
        symbol: "sUSG",
        name: "sUSG",
        logo: "sUSG",
      },
    }
  }, [currentFeature, USGsUSGMetrics])

  const formState = useMemo<FormState>(
    () => getFormState(USGsUSGMetrics!, currentFeature, weiValue, expected, canInteract, isLoading),
    [USGsUSGMetrics, currentFeature, weiValue, expected, canInteract, isLoading]
  )

  const hasToApprove = useMemo(() => {
    if (!weiValue) return true

    if (currentFeature === "stake" && weiValue && USGsUSGMetrics) {
      return weiValue > USGsUSGMetrics?.USGAllowance
    }

    return false
  }, [USGsUSGMetrics, currentFeature, weiValue])

  const actionUnstake = async () => {
    try {
      if (!weiValue || weiValue === 0n) return
      if (!currentAssetInfo?.current) return

      setIsLoading(true)

      const params = {
        walletClient: walletClient!,
        stakingAddress: USG_CONTRACT.SUSG,
        weiValue,
      }

      await toastTx(doUnstakeUSG(params), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({
          type: "Success",
          content: "Position successfully created.",
        }),
        error: () => {
          return { type: "Error", content: "Unable to proceed with the transaction." }
        },
      })

      loadUSGsUSGMetrics()
      setWeiValue(undefined)
      setExpected(undefined)
      setIsLoading(false)
    } catch {
      setIsLoading(false)
    }
  }

  const actionStake = async () => {
    try {
      if (!weiValue || weiValue === 0n) return
      if (!currentAssetInfo?.current) return

      setIsLoading(true)

      const params = {
        walletClient: walletClient!,
        stakingAddress: USG_CONTRACT.SUSG,
        weiValue,
      }

      await toastTx(doStakeUSG(params), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({
          type: "Success",
          content: "Position successfully created.",
        }),
        error: (err) => {
          const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
          return { type: "Error", content: error || "Unable to proceed with the transaction." }
        },
      })

      loadUSGsUSGMetrics()
      setWeiValue(undefined)
      setExpected(undefined)
      setIsLoading(false)
    } catch {
      setIsLoading(false)
    }
  }

  const actionApprove = async () => {
    try {
      setIsLoading(true)
      await toastTx(doApprove(walletClient!, USG_CONTRACT.USG, weiValue || 0n, USG_CONTRACT.SUSG), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
        success: () => ({
          type: "Success",
          content: "USG approved successfully.",
        }),
        error: (err) => {
          const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
          return { type: "Error", content: error || "Unable to proceed with the transaction." }
        },
      })

      loadUSGsUSGMetrics()
      setIsLoading(false)
    } catch {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!weiValue || weiValue === 0n) return
    ;(async () => {
      if (currentFeature === "stake") {
        try {
          const sdAssetAmountOut = await getExpectedSUSG(walletClient!, weiValue, USG_CONTRACT?.SUSG)
          setExpected(sdAssetAmountOut)
        } catch (error) {
          console.error("Error while estimating deposit preview :", error)
        }
      } else {
        try {
          const assetAmountOut = await getExpectedUSG(walletClient!, weiValue, USG_CONTRACT?.SUSG)
          setExpected(assetAmountOut)
        } catch (error) {
          console.error("Error while estimating redeem preview :", error)
        }
      }
    })()
  }, [weiValue])

  const computeProjectedValue = useMemo(() => {
    if (currentFeature === "stake") {
      return Number(formatUnits(USGsUSGMetrics?.sUSGBalance || 0n, 18)) + Number(formatUnits(weiValue || 0n, 18))
    } else {
      return Number(formatUnits(USGsUSGMetrics?.sUSGBalance || 0n, 18)) - Number(formatUnits(weiValue || 0n, 18))
    }
  }, [currentFeature, weiValue])

  useEffect(() => {
    setExpected(undefined)
    setWeiValue(undefined)
    setStakePercentage(0)
  }, [currentFeature])

  const fetchsUSGHistoryAPY = async (range: string) => {
    setsUSGSelectedTab(range)

    const rangeInMilliseconds = convertRange(range)
    const currentBlock = await getCachedCurrentBlock()
    const toIso = Number(currentBlock.timestamp) * 1000
    const fromIso = rangeInMilliseconds ? new Date(toIso).getTime() - rangeInMilliseconds : null

    const sUSGHistoryAPY = await getsUsgApyData(toIso, fromIso)

    const sUSGData = sUSGHistoryAPY.map((p) => ({
      date: new Date(p.timestamp).getTime(),
      uv: Number(p.amount),
    }))

    setAPYHistory(sUSGData)
  }

  // const aprVariation = useMemo(() => {
  //   let result = { current: "", updated: "" }

  //   if (USGsUSGMetrics && sUSGCurrentAPY) {
  //     if (weiValue) {
  //       result = computeSUSGAprVariation(currentFeature, USGsUSGMetrics, weiValue, sUSGCurrentAPY)
  //     } else {
  //       result = computeSUSGAprVariation(currentFeature, USGsUSGMetrics, 0n, sUSGCurrentAPY)
  //     }
  //   }
  //   return result
  // }, [USGsUSGMetrics, weiValue, currentFeature])

  const contextValue: USGStakeContextValues = {
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
    USGsUSGMetrics,
    sUSGSelectedTab,
    setsUSGSelectedTab,
    apyHistory,
    fetchsUSGHistoryAPY,
    // aprVariation,
    isLoading,
  }

  return <USGStakeContext.Provider value={contextValue}>{children}</USGStakeContext.Provider>
}

export const useUSGStakeContext = () => {
  const context = useContext(USGStakeContext)
  if (!context) {
    throw new Error("useUSGStakeContext must be used within a USGStakeProvider")
  }
  return context
}
