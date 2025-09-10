"use client"

import { doApprove, doStakeTgUSD, doUnstakeTgUSD, getExpectedsTAN, getExpectedTAN, getFormState, getTanStakeOnChainData } from "./stake_tan_controller"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { AssetDataPriced, ExistingAsset, FormState, SelectAssetLogoOption } from "@/types"
import { formatUnits } from "viem"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { StakingAssetInfo, StakingDepositType, StakingInfo } from "../rstan_types"

type StakeTanContextProps = {
  children: ReactNode
}

type StakeTanContextValues = {
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
  stakePercentage: number
  setStakePercentage: (arg: number) => void
}

export const StakeTanContext = createContext<StakeTanContextValues | undefined>(undefined)

export const StakeTanProvider = ({ children }: StakeTanContextProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [stakeInfo, setStakeInfo] = useState<StakingInfo | undefined>()
  const [currentFeature, setCurrentFeature] = useState<"stake" | "unstake">("stake")
  const [weiValue, setWeiValue] = useState<bigint | undefined>()
  const [expected, setExpected] = useState<bigint | undefined>()
  const [stakePercentage, setStakePercentage] = useState<number>(0)

  const { getWalletClient, currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    loadData()
  }, [currentAddress])

  const loadData = useCallback(() => {
    if (currentAddress) {
      getTanStakeOnChainData(currentAddress).then(() => {
        const mockReturnedValue = {
          TANAllowance: 0n,
          TANBalance: 6670000000000000000000000n,
          TANPercentageInsTAN: 0n,
          TANPrice: 1000000000000000000n,
          TANSupply: 10000000000000000000000000n,
          sTANBalance: 0n,
          sTANPrice: 1000000000000000000n,
          sTANSupply: 0n,
        }

        setStakeInfo(mockReturnedValue)
        setIsLoading(false)
      })
    }
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
        balance: stakeInfo?.sTANBalance,
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
      balance: stakeInfo?.TANBalance,
    }
  }, [currentFeature, stakeInfo])

  const currentAssetInfo = useMemo(() => {
    if (currentFeature === "stake") {
      return {
        current: "asset" as StakingDepositType,
        address: VSTAN_CONTRACT.TAN,
        balance: stakeInfo?.TANBalance,
        asset: {
          price: Number(stakeInfo?.TANPrice) / 10 ** 18,
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
      balance: stakeInfo?.sTANBalance,
      asset: {
        price: Number(stakeInfo?.sTANPrice) / 10 ** 18,
        decimals: 18,
        address: VSTAN_CONTRACT.STAN,
        displayDecimals: 2,
        symbol: "sTAN",
        name: "sTAN",
        logo: "sTAN" as ExistingAsset,
      },
    }
  }, [currentFeature, stakeInfo])

  const formState = useMemo<FormState>(() => getFormState(stakeInfo!, currentFeature, weiValue, expected, true), [stakeInfo, weiValue, expected])

  const hasToApprove = useMemo(() => {
    if (!weiValue) return true

    if (currentFeature === "stake" && weiValue && stakeInfo) {
      return weiValue > stakeInfo?.TANAllowance
    }

    return false
  }, [stakeInfo, currentFeature, weiValue])

  const actionUnstake = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    const params = {
      walletClient: getWalletClient()!,
      stakingAddress: VSTAN_CONTRACT.STAN,
      weiValue,
    }
    await doUnstakeTgUSD(params)
    loadData()
    setWeiValue(0n)
    setExpected(0n)
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
    loadData()
    setWeiValue(0n)
    setExpected(0n)
  }

  const actionApprove = async () => {
    if (!currentAssetInfo?.address) return
    await doApprove(getWalletClient()!, VSTAN_CONTRACT.TAN, weiValue || 0n, VSTAN_CONTRACT.STAN).then(loadData)
  }

  useEffect(() => {
    if (!weiValue || weiValue === 0n) return
    ;(async () => {
      if (currentFeature === "stake") {
        try {
          const sTanAmountOut = await getExpectedsTAN(getWalletClient()!, weiValue, VSTAN_CONTRACT?.TAN)
          setExpected(sTanAmountOut)
        } catch (error) {
          console.error("Error while estimating deposit preview :", error)
        }
      } else {
        try {
          const tanAmountOut = await getExpectedTAN(getWalletClient()!, weiValue, VSTAN_CONTRACT?.TAN)
          setExpected(tanAmountOut)
        } catch (error) {
          console.error("Error while estimating redeem preview :", error)
        }
      }
    })()
  }, [weiValue, currentFeature])

  const computeProjectedValue = useMemo(() => {
    if (currentFeature === "stake") {
      return Number(formatUnits(stakeInfo?.sTANBalance || 0n, 18)) + Number(formatUnits(weiValue || 0n, 18))
    } else {
      return Number(formatUnits(stakeInfo?.sTANBalance || 0n, 18)) - Number(formatUnits(weiValue || 0n, 18))
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
    stakeInfo,
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
