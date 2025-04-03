"use client"

import { doApprove, doStakeTgUSD, doUnstakeTgUSD, getExpectedSgUSD, getExpectedTgUSD, getFormState, getTanStakeOnChainData } from "./stan_controller"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { AssetDataPriced, ExistingAsset, FormState, SelectAssetLogoOption } from "@/types"
import { formatUnits } from "viem"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { StakingAssetInfo, StakingDepositType, StakingInfo } from "../tan_type"
import { TAN_CONTRACT } from "../tan_repository"

type TanStakeContextProps = {
  children: ReactNode
}

type TanStakeContextValues = {
  weiValue?: bigint
  setWeiValue: (arg: bigint | undefined) => void
  stakeInfo: StakingInfo | undefined
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
}

export const TanStakeContext = createContext<TanStakeContextValues | undefined>(undefined)

export const TanStakeProvider = ({ children }: TanStakeContextProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [stakeInfo, setStakeInfo] = useState<StakingInfo | undefined>()
  const [currentFeature, setCurrentFeature] = useState<"stake" | "unstake">("stake")
  const [weiValue, setWeiValue] = useState<bigint | undefined>()
  const [expected, setExpected] = useState<bigint | undefined>()

  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    loadData()
  }, [currentAddress])

  const loadData = useCallback(() => {
    if (currentAddress) {
      getTanStakeOnChainData(currentAddress).then((data) => {
        setStakeInfo(data)
        setWeiValue(undefined)
        setIsLoading(false)
      })
    }
  }, [currentAddress])

  const depositAssetOptions = useMemo(() => {
    return currentFeature === "stake"
      ? ([
          {
            label: "tan",
            value: "asset",
            logo: "tan",
          },
        ] as SelectAssetLogoOption[])
      : ([
          {
            label: "sTan",
            value: "sdAsset",
            logo: "sTan",
          },
        ] as SelectAssetLogoOption[])
  }, [currentFeature])

  const receivedTokenInfo = useMemo(() => {
    if (currentFeature === "stake") {
      return {
        address: TAN_CONTRACT.STAN,
        decimals: 18,
        displayDecimals: 2,
        logo: "sTan" as ExistingAsset,
        name: "sTan",
        price: 0,
        symbol: "sTan",
        balance: stakeInfo?.sTanBalance,
      }
    }

    return {
      address: TAN_CONTRACT.TAN,
      decimals: 18,
      displayDecimals: 2,
      logo: "tan" as ExistingAsset,
      name: "tan",
      price: 0,
      symbol: "tan",
      balance: stakeInfo?.tanBalance,
    }
  }, [currentFeature, stakeInfo])

  const currentAssetInfo = useMemo(() => {
    if (currentFeature === "stake") {
      return {
        current: "asset" as StakingDepositType,
        address: TAN_CONTRACT.TAN,
        balance: stakeInfo?.tanBalance,
        asset: {
          price: Number(stakeInfo?.tanPrice) / 10 ** 18,
          decimals: 18,
          address: TAN_CONTRACT.TAN,
          displayDecimals: 2,
          symbol: "tan",
          name: "tan",
          logo: "tan" as ExistingAsset,
        },
      }
    }

    return {
      current: "sdAsset" as StakingDepositType,
      address: TAN_CONTRACT.STAN,
      balance: stakeInfo?.sTanBalance,
      asset: {
        price: Number(stakeInfo?.sTanPrice) / 10 ** 18,
        decimals: 18,
        address: TAN_CONTRACT.STAN,
        displayDecimals: 2,
        symbol: "sTan",
        name: "sTan",
        logo: "sTan" as ExistingAsset,
      },
    }
  }, [currentFeature, stakeInfo])

  const formState = useMemo<FormState>(() => getFormState(stakeInfo!, currentFeature, weiValue, expected, true), [stakeInfo, weiValue, expected])

  const hasToApprove = useMemo(() => {
    if (!weiValue) return true

    if (currentFeature === "stake" && weiValue && stakeInfo) {
      return weiValue > stakeInfo?.tanAllowance
    }

    return false
  }, [stakeInfo, currentFeature, weiValue])

  const actionUnstake = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    const params = {
      walletClient: getWalletClient()!,
      stakingAddress: TAN_CONTRACT.STAN,
      weiValue,
    }
    await doUnstakeTgUSD(params)
    loadData()
    setWeiValue(undefined)
  }

  const actionStake = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    const params = {
      walletClient: getWalletClient()!,
      stakingAddress: TAN_CONTRACT.STAN,
      weiValue,
    }
    await doStakeTgUSD(params)
    loadData()
    setWeiValue(undefined)
  }

  const actionApprove = async () => {
    if (!currentAssetInfo?.address) return
    await doApprove(getWalletClient()!, TAN_CONTRACT.TAN, weiValue || 0n, TAN_CONTRACT.STAN).then(loadData)
  }

  useEffect(() => {
    if (expected) setExpected(undefined)
    if (!weiValue || weiValue === 0n) return
    ;(async () => {
      if (currentFeature === "stake") {
        try {
          const sdAssetAmountOut = await getExpectedSgUSD(getWalletClient()!, weiValue, TAN_CONTRACT?.STAN)
          setExpected(sdAssetAmountOut)
        } catch (error) {
          console.error("Error while estimating deposit preview :", error)
        }
      } else {
        try {
          const assetAmountOut = await getExpectedTgUSD(getWalletClient()!, weiValue, TAN_CONTRACT?.STAN)
          setExpected(assetAmountOut)
        } catch (error) {
          console.error("Error while estimating redeem preview :", error)
        }
      }
    })()
  }, [weiValue, currentFeature])

  const computeProjectedValue = useMemo(() => {
    if (currentFeature === "stake") {
      return Number(formatUnits(stakeInfo?.sTanBalance || 0n, 18)) + Number(formatUnits(weiValue || 0n, 18))
    } else {
      return Number(formatUnits(stakeInfo?.sTanBalance || 0n, 18)) - Number(formatUnits(weiValue || 0n, 18))
    }
  }, [currentFeature, weiValue])

  const contextValue: TanStakeContextValues = {
    actionStake,
    actionApprove,
    actionUnstake,
    setCurrentFeature,
    setWeiValue,
    computeProjectedValue,
    isLoading,
    stakeInfo,
    currentFeature,
    weiValue,
    expected,
    currentAssetInfo,
    depositAssetOptions,
    receivedTokenInfo,
    hasToApprove,
    formState,
  }

  return <TanStakeContext.Provider value={contextValue}>{children}</TanStakeContext.Provider>
}

export const useTanStakeContext = () => {
  const context = useContext(TanStakeContext)
  if (!context) {
    throw new Error("useTanStakeContext must be used within a TgUsdStakProvider")
  }
  return context
}
