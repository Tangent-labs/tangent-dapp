"use client"

import { formatUnits } from "viem"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { useUSGContext } from "../../tg_usd/tg_usd_context"
import { StakingAssetInfo, StakingDepositType, TANStakingInfo } from "../rstan_types"
import { AssetDataPriced, ExistingAsset, FormState, SelectAssetLogoOption } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doApprove, doStakeTgUSD, doUnstakeTgUSD, getExpectedsTAN, getExpectedTAN, getFormState } from "./stake_tan_controller"

type StakeTanContextProps = {
  children: ReactNode
}

type StakeTanContextValues = {
  weiValue?: bigint
  setWeiValue: (arg: bigint | undefined) => void
  TANsTANMetrics: TANStakingInfo | undefined
  isLoading: boolean
  currentFeature: "stake" | "unstake"
  setCurrentFeature: (arg: "stake" | "unstake") => void
  expected?: bigint
  actionApprove: () => void
  actionStake: () => void
  actionUnstake: () => void
  currentAssetInfo?: StakingAssetInfo
  depositAssetOptions: SelectAssetLogoOption[]
  receivedTokenInfo: AssetDataPriced
  hasToApprove: boolean
  computeProjectedValue: number
  formState: FormState
  stakePercentage: number
  setStakePercentage: (arg: number) => void
}

export const StakeTanContext = createContext<StakeTanContextValues | undefined>(undefined)

export const StakeTanProvider = ({ children }: StakeTanContextProps) => {
  const { loadTanSTANMetrics, TANsTANMetrics } = useUSGContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [currentFeature, setCurrentFeature] = useState<"stake" | "unstake">("stake")

  const [weiValue, setWeiValue] = useState<bigint | undefined>()

  const [expected, setExpected] = useState<bigint | undefined>()

  const [stakePercentage, setStakePercentage] = useState<number>(0)

  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    loadTanSTANMetrics()
  }, [currentAddress])

  const depositAssetOptions = useMemo(() => {
    return currentFeature === "stake"
      ? ([
          {
            label: "TAN",
            value: "asset",
            logo: "TAN",
          },
        ] as SelectAssetLogoOption[])
      : ([
          {
            label: "sTAN",
            value: "sdAsset",
            logo: "sTAN",
          },
        ] as SelectAssetLogoOption[])
  }, [currentFeature])

  const receivedTokenInfo = useMemo(() => {
    if (currentFeature === "stake") {
      return {
        address: VSTAN_CONTRACT.STAN,
        decimals: 18,
        displayDecimals: 2,
        logo: "sTAN" as ExistingAsset,
        name: "sTAN",
        price: 0,
        symbol: "sTAN",
        balance: TANsTANMetrics?.sTanBalance,
      }
    }

    return {
      address: VSTAN_CONTRACT.TAN,
      decimals: 18,
      displayDecimals: 2,
      logo: "TAN" as ExistingAsset,
      name: "TAN",
      price: 0,
      symbol: "TAN",
      balance: TANsTANMetrics?.tanBalance,
    }
  }, [currentFeature, TANsTANMetrics])

  const currentAssetInfo = useMemo(() => {
    if (currentFeature === "stake") {
      return {
        current: "asset" as StakingDepositType,
        address: VSTAN_CONTRACT.TAN,
        balance: TANsTANMetrics?.tanBalance,
        asset: {
          price: Number(TANsTANMetrics?.tanPrice) / 10 ** 18,
          decimals: 18,
          address: VSTAN_CONTRACT.TAN,
          displayDecimals: 2,
          symbol: "TAN",
          name: "TAN",
          logo: "TAN" as ExistingAsset,
        },
      }
    }

    return {
      current: "sdAsset" as StakingDepositType,
      address: VSTAN_CONTRACT.STAN,
      balance: TANsTANMetrics?.sTanBalance,
      asset: {
        price: Number(TANsTANMetrics?.sTanPrice) / 10 ** 18,
        decimals: 18,
        address: VSTAN_CONTRACT.STAN,
        displayDecimals: 2,
        symbol: "sTAN",
        name: "sTAN",
        logo: "sTAN" as ExistingAsset,
      },
    }
  }, [currentFeature, TANsTANMetrics])

  const formState = useMemo<FormState>(() => getFormState(TANsTANMetrics!, currentFeature, weiValue, expected, true), [TANsTANMetrics, weiValue, expected])

  const hasToApprove = useMemo(() => {
    if (!weiValue) return true

    if (currentFeature === "stake" && weiValue && TANsTANMetrics) {
      return weiValue > TANsTANMetrics?.tanAllowance
    }

    return false
  }, [TANsTANMetrics, currentFeature, weiValue])

  const actionUnstake = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    const params = {
      walletClient: getWalletClient()!,
      stakingAddress: VSTAN_CONTRACT.STAN,
      weiValue,
    }
    await doUnstakeTgUSD(params)
    loadTanSTANMetrics()
    setWeiValue(0n)
    setExpected(0n)
    setIsLoading(false)
  }

  const actionStake = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    const params = {
      walletClient: getWalletClient()!,
      stakingAddress: VSTAN_CONTRACT.STAN,
      weiValue,
    }
    await doStakeTgUSD(params)
    loadTanSTANMetrics()
    setWeiValue(0n)
    setExpected(0n)
    setIsLoading(false)
  }

  const actionApprove = async () => {
    if (!currentAssetInfo?.address) return
    await doApprove(getWalletClient()!, VSTAN_CONTRACT.TAN, weiValue || 0n, VSTAN_CONTRACT.STAN).then(loadTanSTANMetrics)
  }

  useEffect(() => {
    if (!weiValue || weiValue === 0n) return
    ;(async () => {
      if (currentFeature === "stake") {
        try {
          const sTanAmountOut = await getExpectedsTAN(getWalletClient()!, weiValue, VSTAN_CONTRACT?.STAN)
          setExpected(sTanAmountOut)
        } catch (error) {
          console.error("Error while estimating deposit preview :", error)
        }
      } else {
        try {
          const tanAmountOut = await getExpectedTAN(getWalletClient()!, weiValue, VSTAN_CONTRACT?.STAN)
          setExpected(tanAmountOut)
        } catch (error) {
          console.error("Error while estimating redeem preview :", error)
        }
      }
    })()
  }, [weiValue, currentFeature])

  const computeProjectedValue = useMemo(() => {
    if (currentFeature === "stake") {
      return Number(formatUnits(TANsTANMetrics?.sTanBalance || 0n, 18)) + Number(formatUnits(weiValue || 0n, 18))
    } else {
      return Number(formatUnits(TANsTANMetrics?.sTanBalance || 0n, 18)) - Number(formatUnits(weiValue || 0n, 18))
    }
  }, [currentFeature, weiValue])

  const contextValue: StakeTanContextValues = {
    actionStake,
    actionApprove,
    actionUnstake,
    setCurrentFeature,
    setWeiValue,
    computeProjectedValue,
    isLoading,
    TANsTANMetrics,
    currentFeature,
    weiValue,
    expected,
    currentAssetInfo,
    depositAssetOptions,
    receivedTokenInfo,
    hasToApprove,
    formState,
    stakePercentage,
    setStakePercentage,
  }

  return <StakeTanContext.Provider value={contextValue}>{children}</StakeTanContext.Provider>
}

export const useStakeTanContext = () => {
  const context = useContext(StakeTanContext)
  if (!context) {
    throw new Error("StakeTanContext must be used within a TgUsdStakProvider")
  }
  return context
}
