"use client"

import { doApprove, doStakeTgUSD, getExpectedSdAsset, getTgUsdStakeOnChainData } from "./tg_usd_stake_controller"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { StakingAssetInfo, StakingDepositType, StakingInfo } from "../tg_usd_type"
import { AssetDataPriced, ExistingAsset, SelectAssetLogoOption } from "@/types"
import { Address, formatUnits } from "viem"
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
  setCurrentAsset: (arg: StakingDepositType) => void
  setCurrentFeature: (arg: "stake" | "unstake") => void
  expected?: bigint
  actionApprove: () => void
  actionStake: () => void
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
  const [currentAsset, setCurrentAsset] = useState<StakingDepositType>("asset")
  const [expected, setExpected] = useState<bigint | undefined>()

  const { getWalletClient } = useWalletConnexionContext()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(() => {
    getTgUsdStakeOnChainData().then((data) => {
      setStakeInfo(data)
      setWeiValue(undefined)
      setIsLoading(false)
    })
  }, [])

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
        address: "0x374039ebeed6a9185b1ccf320daa2301f26246f6" as Address,
        decimals: 18,
        displayDecimals: 0,
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
      address: "0x374039ebeed6a9185b1ccf320daa2301f26246f6" as Address,
      balance: stakeInfo?.sgUSDBalance,
      asset: {
        price: Number(stakeInfo?.sgUSDPrice) / 10 ** 18,
        decimals: 18,
        address: "0x374039ebeed6a9185b1ccf320daa2301f26246f6" as Address,
        displayDecimals: 2,
        symbol: "sgUSD",
        name: "sgUSD",
        logo: "sgUSD" as ExistingAsset,
      },
    }
  }, [currentFeature, stakeInfo])

  const hasToApprove = useMemo(() => {
    if (!weiValue) return true

    if (currentAsset === "asset" && weiValue && stakeInfo) {
      return weiValue > stakeInfo?.tgUSDAllowance
    }

    return false
  }, [stakeInfo, currentAsset, weiValue])

  const actionStake = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    const params = {
      walletClient: getWalletClient()!,
      stakingAddress: receivedTokenInfo.address,
      weiValue,
    }
    await doStakeTgUSD(params)
    loadData()
  }

  const actionApprove = async () => {
    if (!currentAssetInfo?.address) return
    await doApprove(getWalletClient()!, currentAssetInfo.address, weiValue || 0n, receivedTokenInfo?.address).then(loadData)
  }

  useEffect(() => {
    if (expected) setExpected(undefined)
    if (!weiValue || weiValue === 0n) return

    if (currentAsset !== "asset") {
      setExpected(weiValue)
      return
    }

    ;(async () => {
      try {
        if (stakeInfo) {
          const { sdAssetAmountOut } = await getExpectedSdAsset(weiValue, stakeInfo?.sgUSDPrice)
          setExpected(sdAssetAmountOut)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error)
      }
    })()
  }, [weiValue, currentAsset, stakeInfo])

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
    setCurrentFeature,
    setWeiValue,
    setCurrentAsset,
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
