"use client"

import { formatUnits } from "viem"
import { USG_CONTRACT } from "../tg_usd_repository"
import { useUSGContext } from "../tg_usd_context"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { StakingAssetInfo, StakingDepositType, USGStakingInfo } from "../tg_usd_type"
import { AssetDataPriced, ExistingAsset, FormState, SelectAssetLogoOption } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { doApprove, doStakeTgUSD, doUnstakeTgUSD, getExpectedSUSG, getExpectedUSG, getFormState } from "./tg_usd_stake_controller"

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
  depositAssetOptions: SelectAssetLogoOption[]
  receivedTokenInfo: AssetDataPriced
  hasToApprove: boolean
  computeProjectedValue: number
  formState: FormState
  stakePercentage: number
  setStakePercentage: (arg: number) => void
  USGsUSGMetrics: USGStakingInfo | undefined
}

export const USGStakeContext = createContext<USGStakeContextValues | undefined>(undefined)

export const USGStakeProvider = ({ children }: USGStakeContextProps) => {
  const [currentFeature, setCurrentFeature] = useState<"stake" | "unstake">("stake")

  const [weiValue, setWeiValue] = useState<bigint | undefined>()

  const [expected, setExpected] = useState<bigint | undefined>()

  const [stakePercentage, setStakePercentage] = useState<number>(0)

  const { loadUSGsUSGMetrics, USGsUSGMetrics } = useUSGContext()

  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    loadUSGsUSGMetrics()
  }, [currentAddress])

  const depositAssetOptions = useMemo(() => {
    return currentFeature === "stake"
      ? ([
          {
            label: "USG",
            value: "asset",
            logo: "USG",
          },
        ] as SelectAssetLogoOption[])
      : ([
          {
            label: "sUSG",
            value: "sdAsset",
            logo: "sUSG",
          },
        ] as SelectAssetLogoOption[])
  }, [currentFeature])

  const receivedTokenInfo = useMemo(() => {
    if (currentFeature === "stake") {
      return {
        address: USG_CONTRACT.SUSG,
        decimals: 18,
        displayDecimals: 2,
        logo: "sUSG" as ExistingAsset,
        name: "sUSG",
        price: 0,
        symbol: "sUSG",
        balance: USGsUSGMetrics?.sUSGBalance,
      }
    }

    return {
      address: USG_CONTRACT.USG,
      decimals: 18,
      displayDecimals: 2,
      logo: "USG" as ExistingAsset,
      name: "USG",
      price: 0,
      symbol: "USG",
      balance: USGsUSGMetrics?.USGBalance,
    }
  }, [currentFeature, USGsUSGMetrics])

  const currentAssetInfo = useMemo(() => {
    if (currentFeature === "stake") {
      return {
        current: "asset" as StakingDepositType,
        address: USG_CONTRACT.USG,
        balance: USGsUSGMetrics?.USGBalance,
        asset: {
          price: Number(USGsUSGMetrics?.USGPrice) / 10 ** 18,
          decimals: 18,
          address: USG_CONTRACT.USG,
          displayDecimals: 2,
          symbol: "USG",
          name: "USG",
          logo: "USG" as ExistingAsset,
        },
      }
    }

    return {
      current: "sdAsset" as StakingDepositType,
      address: USG_CONTRACT.SUSG,
      balance: USGsUSGMetrics?.sUSGBalance,
      asset: {
        price: Number(USGsUSGMetrics?.sUSGPrice) / 10 ** 18,
        decimals: 18,
        address: USG_CONTRACT.SUSG,
        displayDecimals: 2,
        symbol: "sUSG",
        name: "sUSG",
        logo: "sUSG" as ExistingAsset,
      },
    }
  }, [currentFeature, USGsUSGMetrics])

  const formState = useMemo<FormState>(() => getFormState(USGsUSGMetrics!, currentFeature, weiValue, expected, true), [USGsUSGMetrics, weiValue, expected])

  const hasToApprove = useMemo(() => {
    if (!weiValue) return true

    if (currentFeature === "stake" && weiValue && USGsUSGMetrics) {
      return weiValue > USGsUSGMetrics?.USGAllowance
    }

    return false
  }, [USGsUSGMetrics, currentFeature, weiValue])

  const actionUnstake = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    const params = {
      walletClient: getWalletClient()!,
      stakingAddress: USG_CONTRACT.SUSG,
      weiValue,
    }
    await doUnstakeTgUSD(params)
    loadUSGsUSGMetrics()
    setWeiValue(0n)
    setExpected(0n)
  }

  const actionStake = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    const params = {
      walletClient: getWalletClient()!,
      stakingAddress: USG_CONTRACT.SUSG,
      weiValue,
    }
    await doStakeTgUSD(params)
    loadUSGsUSGMetrics()
    setWeiValue(0n)
    setExpected(0n)
  }

  const actionApprove = async () => {
    if (!currentAssetInfo?.address) return
    await doApprove(getWalletClient()!, USG_CONTRACT.USG, weiValue || 0n, USG_CONTRACT.SUSG).then(loadUSGsUSGMetrics)
  }

  useEffect(() => {
    if (!weiValue || weiValue === 0n) return
    ;(async () => {
      if (currentFeature === "stake") {
        try {
          const sdAssetAmountOut = await getExpectedSUSG(getWalletClient()!, weiValue, USG_CONTRACT?.SUSG)
          setExpected(sdAssetAmountOut)
        } catch (error) {
          console.error("Error while estimating deposit preview :", error)
        }
      } else {
        try {
          const assetAmountOut = await getExpectedUSG(getWalletClient()!, weiValue, USG_CONTRACT?.SUSG)
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
    setExpected(0n)
    setWeiValue(0n)
    setStakePercentage(0)
  }, [currentFeature])

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
    depositAssetOptions,
    receivedTokenInfo,
    hasToApprove,
    formState,
    stakePercentage,
    setStakePercentage,
    USGsUSGMetrics,
  }

  return <USGStakeContext.Provider value={contextValue}>{children}</USGStakeContext.Provider>
}

export const useUSGStakeContext = () => {
  const context = useContext(USGStakeContext)
  if (!context) {
    throw new Error("useUSGStakeContext must be used within a TgUsdStakProvider")
  }
  return context
}
