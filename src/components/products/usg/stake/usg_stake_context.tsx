"use client"

import { formatEther, formatUnits, zeroAddress } from "viem"
import { useUSGContext } from "../usg_context"
import { getsUsgApyData } from "../client_api"
import { SAVINGS_VAULTS, SavingsVault } from "./savings_vaults"
import { useRootContext } from "../../root/root_context"
import { convertRange } from "../../root/root_controller"
import { toastTx } from "@/components/design_system/toast"
import { AssetDataPriced } from "@/types"
import { FormState, StakingAssetInfo, StakingDepositType, USGStakingInfo } from "../usg_type"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import {
  doApprove,
  doDepositYearnV2,
  doStakeUSG,
  doUnstakeUSG,
  doWithdrawYearnV2,
  getExpectedSUSG,
  getExpectedUSG,
  getStakeFormState,
  getYearnV2Metrics,
  previewYearnV2Deposit,
  previewYearnV2Withdraw,
} from "./usg_stake_controller"
import { matchBlockChainErrors } from "../record/usg_record_controller"

type USGStakeContextProps = {
  children: ReactNode
  vault?: SavingsVault["key"]
}

type USGStakeContextValues = {
  vault: SavingsVault
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

  fetchsUSGHistoryAPY: (range: string) => Promise<void>

  isLoading: boolean

  // aprVariation: { current: string; updated: string }
}

export const USGStakeContext = createContext<USGStakeContextValues | undefined>(undefined)

export const USGStakeProvider = ({ children, vault: vaultKey = "sUSG" }: USGStakeContextProps) => {
  const vault = SAVINGS_VAULTS[vaultKey]
  const isYearnV2 = vault.key !== "sUSG"

  const { walletClient, isWellConnected, currentAddress } = useWalletConnexionContext()

  const { loadUSGsUSGMetrics, USGsUSGMetrics: sUSGMetrics } = useUSGContext()

  const [yearnV2Metrics, setYearnV2Metrics] = useState<Awaited<ReturnType<typeof getYearnV2Metrics>> | undefined>()

  const loadYearnV2Metrics = () => {
    getYearnV2Metrics(currentAddress || zeroAddress, vault.asset.address, vault.share.address)
      .then(setYearnV2Metrics)
      .catch((error) => console.error("Failed to load vault metrics:", error))
  }

  useEffect(() => {
    if (isYearnV2) loadYearnV2Metrics()
  }, [isYearnV2, currentAddress])

  const USGsUSGMetrics = isYearnV2 ? yearnV2Metrics : sUSGMetrics
  const reloadMetrics = isYearnV2 ? loadYearnV2Metrics : loadUSGsUSGMetrics

  const { getCachedCurrentBlock } = useRootContext()

  const [currentFeature, setCurrentFeature] = useState<"stake" | "unstake">("stake")

  const [sUSGSelectedTab, setsUSGSelectedTab] = useState<string>("1m")

  const [weiValue, setWeiValue] = useState<bigint | undefined>()

  const [expected, setExpected] = useState<bigint | undefined>()

  const [apyHistory, setAPYHistory] = useState<Array<{ date: number; uv: number }>>([])

  const [stakePercentage, setStakePercentage] = useState<number>(0)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (vault.hasData) fetchsUSGHistoryAPY("1m")
  }, [])

  const receivedTokenInfo = useMemo(() => {
    if (!USGsUSGMetrics?.sUSGPrice) return

    if (currentFeature === "stake") {
      return {
        address: vault.share.address,
        decimals: 18,
        displayDecimals: 2,
        logo: vault.share.logo,
        name: vault.share.symbol,
        price: Number(formatEther(USGsUSGMetrics?.sUSGPrice)),
        symbol: vault.share.symbol,
        balance: USGsUSGMetrics?.sUSGBalance,
      }
    }

    return {
      address: vault.asset.address,
      decimals: 18,
      displayDecimals: 2,
      logo: vault.asset.logo,
      name: vault.asset.symbol,
      price: Number(formatEther(USGsUSGMetrics?.USGPrice)),
      symbol: vault.asset.symbol,
      balance: USGsUSGMetrics?.USGBalance,
    }
  }, [currentFeature, USGsUSGMetrics, vault])

  const currentAssetInfo = useMemo(() => {
    if (!USGsUSGMetrics?.sUSGPrice) return
    if (currentFeature === "stake") {
      return {
        current: "asset" as StakingDepositType,
        address: vault.asset.address,
        balance: USGsUSGMetrics?.USGBalance,
        asset: {
          price: Number(formatEther(USGsUSGMetrics?.USGPrice)),
          decimals: 18,
          address: vault.asset.address,
          displayDecimals: 2,
          symbol: vault.asset.symbol,
          name: vault.asset.symbol,
          logo: vault.asset.logo,
        },
      }
    }

    return {
      current: "sdAsset" as StakingDepositType,
      address: vault.share.address,
      balance: USGsUSGMetrics?.sUSGBalance,
      asset: {
        price: Number(formatEther(USGsUSGMetrics?.sUSGPrice)),
        decimals: 18,
        address: vault.share.address,
        displayDecimals: 2,
        symbol: vault.share.symbol,
        name: vault.share.symbol,
        logo: vault.share.logo,
      },
    }
  }, [currentFeature, USGsUSGMetrics, vault])

  const formState = useMemo<FormState>(
    () => getStakeFormState(USGsUSGMetrics!, currentFeature, weiValue, expected, isWellConnected, isLoading),
    [USGsUSGMetrics, currentFeature, weiValue, expected, isWellConnected, isLoading]
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
        stakingAddress: vault.share.address,
        weiValue,
      }

      await toastTx(isYearnV2 ? doWithdrawYearnV2(params.walletClient, params.stakingAddress, weiValue) : doUnstakeUSG(params), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({
          type: "Success",
          content: "Position successfully created.",
        }),
        error: () => {
          return { type: "Error", content: "Unable to proceed with the transaction." }
        },
      })

      reloadMetrics()
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
        stakingAddress: vault.share.address,
        weiValue,
      }

      await toastTx(isYearnV2 ? doDepositYearnV2(params.walletClient, params.stakingAddress, weiValue) : doStakeUSG(params), {
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

      reloadMetrics()
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
      await toastTx(doApprove(walletClient!, vault.asset.address, weiValue || 0n, vault.share.address), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
        success: () => ({
          type: "Success",
          content: `${vault.asset.symbol} approved successfully.`,
        }),
        error: (err) => {
          const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
          return { type: "Error", content: error || "Unable to proceed with the transaction." }
        },
      })

      reloadMetrics()
      setIsLoading(false)
    } catch {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!weiValue || weiValue === 0n) return
    ;(async () => {
      if (isYearnV2) {
        const pricePerShare = yearnV2Metrics?.pricePerShare ?? 0n
        setExpected(currentFeature === "stake" ? previewYearnV2Deposit(weiValue, pricePerShare) : previewYearnV2Withdraw(weiValue, pricePerShare))
      } else if (currentFeature === "stake") {
        try {
          const sdAssetAmountOut = await getExpectedSUSG(walletClient!, weiValue, vault.share.address)
          setExpected(sdAssetAmountOut)
        } catch (error) {
          console.error("Error while estimating deposit preview :", error)
        }
      } else {
        try {
          const assetAmountOut = await getExpectedUSG(walletClient!, weiValue, vault.share.address)
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
  }, [currentFeature, weiValue, USGsUSGMetrics])

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
    vault,
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
