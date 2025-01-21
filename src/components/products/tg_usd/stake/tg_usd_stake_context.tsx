"use client"

import { doApprove, doStakeTgUSD, doUnstakeTgUSD, getExpectedSgUSD, getExpectedTgUSD, getTgUsdStakeOnChainData } from "./tg_usd_stake_controller"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { StakingAssetInfo, StakingDepositType, StakingInfo } from "../tg_usd_type"
import { AssetDataPriced, ExistingAsset, SelectAssetLogoOption } from "@/types"
import { formatUnits } from "viem"
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
}

export const TgUsdStakeContext = createContext<TgUsdStakeContextValues | undefined>(undefined)

export const TgUsdStakeProvider = ({ children }: TgUsdStakeContextProps) => {
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
      getTgUsdStakeOnChainData(currentAddress).then((data) => {
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
            label: "tgUSD",
            value: "asset",
            logo: "tgUSD",
          },
        ] as SelectAssetLogoOption[])
      : ([
          {
            label: "sgUSD",
            value: "sdAsset",
            logo: "sgUSD",
          },
        ] as SelectAssetLogoOption[])
  }, [currentFeature])

  const receivedTokenInfo = useMemo(() => {
    if (currentFeature === "stake") {
      return {
        address: TGUSD_CONTRACT.SG_USD,
        decimals: 18,
        displayDecimals: 2,
        logo: "sgUSD" as ExistingAsset,
        name: "sgUSD",
        price: 0,
        symbol: "sgUSD",
        balance: stakeInfo?.sgUSDBalance,
      }
    }

    return {
      address: TGUSD_CONTRACT.TG_USD,
      decimals: 18,
      displayDecimals: 2,
      logo: "tgUSD" as ExistingAsset,
      name: "tgUSD",
      price: 0,
      symbol: "tgUSD",
      balance: stakeInfo?.tgUSDBalance,
    }
  }, [currentFeature, stakeInfo])

  const currentAssetInfo = useMemo(() => {
    if (currentFeature === "stake") {
      return {
        current: "asset" as StakingDepositType,
        address: TGUSD_CONTRACT.TG_USD,
        balance: stakeInfo?.tgUSDBalance,
        asset: {
          price: Number(stakeInfo?.tgUSDPrice) / 10 ** 18,
          decimals: 18,
          address: TGUSD_CONTRACT.TG_USD,
          displayDecimals: 2,
          symbol: "tgUSD",
          name: "tgUSD",
          logo: "tgUSD" as ExistingAsset,
        },
      }
    }

    return {
      current: "sdAsset" as StakingDepositType,
      address: TGUSD_CONTRACT.SG_USD,
      balance: stakeInfo?.sgUSDBalance,
      asset: {
        price: Number(stakeInfo?.sgUSDPrice) / 10 ** 18,
        decimals: 18,
        address: TGUSD_CONTRACT.SG_USD,
        displayDecimals: 2,
        symbol: "sgUSD",
        name: "sgUSD",
        logo: "sgUSD" as ExistingAsset,
      },
    }
  }, [currentFeature, stakeInfo])

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
      stakingAddress: TGUSD_CONTRACT.SG_USD,
      weiValue,
    }
    await doUnstakeTgUSD(params)
    loadData()
  }

  const actionStake = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    const params = {
      walletClient: getWalletClient()!,
      stakingAddress: TGUSD_CONTRACT.SG_USD,
      weiValue,
    }
    await doStakeTgUSD(params)
    loadData()
  }

  const actionApprove = async () => {
    if (!currentAssetInfo?.address) return
    await doApprove(getWalletClient()!, TGUSD_CONTRACT.TG_USD, weiValue || 0n, TGUSD_CONTRACT.SG_USD).then(loadData)
  }

  useEffect(() => {
    if (expected) setExpected(undefined)
    if (!weiValue || weiValue === 0n) return
    ;(async () => {
      if (currentFeature === "stake") {
        try {
          const sdAssetAmountOut = await getExpectedSgUSD(getWalletClient()!, weiValue, TGUSD_CONTRACT?.SG_USD)
          setExpected(sdAssetAmountOut)
        } catch (error) {
          console.error("Error while estimating deposit preview :", error)
        }
      } else {
        try {
          const assetAmountOut = await getExpectedTgUSD(getWalletClient()!, weiValue, TGUSD_CONTRACT?.SG_USD)
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
