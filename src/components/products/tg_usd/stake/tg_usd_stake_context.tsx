"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { AssetDataPriced, ExistingAsset, FormState, SelectAssetLogoOption } from "@/types"
import { formatUnits } from "viem"
import { StakingAssetInfo, StakingDepositType, StakingInfo } from "../tg_usd_type"
import { doApprove, doStakeTgUSD, doUnstakeTgUSD, getExpectedSUSG, getExpectedTgUSD, getFormState, getTgUsdStakeOnChainData } from "./tg_usd_stake_controller"
import { TGUSD_CONTRACT } from "../tg_usd_repository"

type TgUsdStakeContextProps = {
  children: ReactNode
}

type TgUsdStakeContextValues = {
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

export const TgUsdStakeContext = createContext<TgUsdStakeContextValues | undefined>(undefined)

export const TgUsdStakeProvider = ({ children }: TgUsdStakeContextProps) => {
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
      getTgUsdStakeOnChainData(currentAddress).then((data) => {
        setStakeInfo(data)
        setIsLoading(false)
      })
    }
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
        address: TGUSD_CONTRACT.SUSG,
        decimals: 18,
        displayDecimals: 2,
        logo: "sUSG" as ExistingAsset,
        name: "sUSG",
        price: 0,
        symbol: "sUSG",
        balance: stakeInfo?.sgUSDBalance,
      }
    }

    return {
      address: TGUSD_CONTRACT.USG,
      decimals: 18,
      displayDecimals: 2,
      logo: "USG" as ExistingAsset,
      name: "USG",
      price: 0,
      symbol: "USG",
      balance: stakeInfo?.tgUSDBalance,
    }
  }, [currentFeature, stakeInfo])

  const currentAssetInfo = useMemo(() => {
    if (currentFeature === "stake") {
      return {
        current: "asset" as StakingDepositType,
        address: TGUSD_CONTRACT.USG,
        balance: stakeInfo?.tgUSDBalance,
        asset: {
          price: Number(stakeInfo?.tgUSDPrice) / 10 ** 18,
          decimals: 18,
          address: TGUSD_CONTRACT.USG,
          displayDecimals: 2,
          symbol: "USG",
          name: "USG",
          logo: "USG" as ExistingAsset,
        },
      }
    }

    return {
      current: "sdAsset" as StakingDepositType,
      address: TGUSD_CONTRACT.SUSG,
      balance: stakeInfo?.sgUSDBalance,
      asset: {
        price: Number(stakeInfo?.sgUSDPrice) / 10 ** 18,
        decimals: 18,
        address: TGUSD_CONTRACT.SUSG,
        displayDecimals: 2,
        symbol: "sUSG",
        name: "sUSG",
        logo: "sUSG" as ExistingAsset,
      },
    }
  }, [currentFeature, stakeInfo])

  const formState = useMemo<FormState>(() => getFormState(stakeInfo!, currentFeature, weiValue, expected, true), [stakeInfo, weiValue, expected])

  const hasToApprove = useMemo(() => {
    if (!weiValue) return true

    if (currentFeature === "stake" && weiValue && stakeInfo) {
      return weiValue > stakeInfo?.tgUSDAllowance
    }

    return false
  }, [stakeInfo, currentFeature, weiValue])

  const actionUnstake = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    const params = {
      walletClient: getWalletClient()!,
      stakingAddress: TGUSD_CONTRACT.SUSG,
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
      stakingAddress: TGUSD_CONTRACT.SUSG,
      weiValue,
    }
    await doStakeTgUSD(params)
    loadData()
    setWeiValue(0n)
    setExpected(0n)
  }

  const actionApprove = async () => {
    if (!currentAssetInfo?.address) return
    await doApprove(getWalletClient()!, TGUSD_CONTRACT.USG, weiValue || 0n, TGUSD_CONTRACT.SUSG).then(loadData)
  }

  useEffect(() => {
    if (!weiValue || weiValue === 0n) return
    ;(async () => {
      if (currentFeature === "stake") {
        try {
          const sdAssetAmountOut = await getExpectedSUSG(getWalletClient()!, weiValue, TGUSD_CONTRACT?.SUSG)
          setExpected(sdAssetAmountOut)
        } catch (error) {
          console.error("Error while estimating deposit preview :", error)
        }
      } else {
        try {
          const assetAmountOut = await getExpectedTgUSD(getWalletClient()!, weiValue, TGUSD_CONTRACT?.SUSG)
          setExpected(assetAmountOut)
        } catch (error) {
          console.error("Error while estimating redeem preview :", error)
        }
      }
    })()
  }, [weiValue, currentFeature])

  const computeProjectedValue = useMemo(() => {
    if (currentFeature === "stake") {
      return Number(formatUnits(stakeInfo?.sgUSDBalance || 0n, 18)) + Number(formatUnits(weiValue || 0n, 18))
    } else {
      return Number(formatUnits(stakeInfo?.sgUSDBalance || 0n, 18)) - Number(formatUnits(weiValue || 0n, 18))
    }
  }, [currentFeature, weiValue])

  const contextValue: TgUsdStakeContextValues = {
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

  return <TgUsdStakeContext.Provider value={contextValue}>{children}</TgUsdStakeContext.Provider>
}

export const useTgUsdStakeContext = () => {
  const context = useContext(TgUsdStakeContext)
  if (!context) {
    throw new Error("useTgUsdStakeContext must be used within a TgUsdStakProvider")
  }
  return context
}
