"use client"

import { BalanceAllowanceData, TgUsdMarket, ZapToken } from "../../tg_usd_type"
import { AssetDataPriced, FormState } from "@/types"
import Zapper from "@/abi/tgusd/Zapper.json"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { Address, EstimateContractGasParameters, formatUnits, parseEther } from "viem"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"
import { gasCostToUSD, getPublicClient } from "@/services/service_rpc"
import {
  computeSwapAssetPrice,
  doApproveMarketDeposit,
  doApproveZap,
  doMarketDeposit,
  doZapDeposit,
  getBalances,
  getDepositFormState,
  getZapTokenBalanceAllowance,
  prepareZapTransaction,
} from "./tg_usd_record_deposit_controller"
import { getTokenQuote } from "./deposit_actions"
import { useTgUsdContext } from "../../tg_usd_context"

const DECIMALS = BigInt(10 ** 18)

type TgUsdDepositContextProps = {
  children: ReactNode
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
}

type TgUsdDepositContextValues = {
  marketInfo: TgUsdMarket
  collateralInfo: AssetDataPriced
  isStaking: boolean
  setIsStaking: (arg: boolean) => void
  isDepositAndBorrow: boolean
  setIsDepositAndBorrow: (arg: boolean) => void
  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void
  actionDeposit: () => void
  actionApprove: () => void
  formState: FormState
  borrowWeiValue?: bigint
  setBorrowWeiValue: (arg: bigint | undefined) => void
  setDepositAsset: (arg: string) => void
  depositAsset: string | undefined
  tokens: ZapToken[]
  isDepositLoading: boolean
  setIsDepositLoading: (arg: boolean) => void
  isZapLoading: boolean
  setIsZapLoading: (arg: boolean) => void
  swapAssetPrice: number | null
  getRouteAndDeposit: () => void
  actionApproveZap: () => void
  zapValue: bigint | null
  setZapValue: (arg: bigint) => void
  handleDepositChange: (arg: bigint | undefined) => void
  handleZapChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  depositAssetInfo: AssetDataPriced | null
  balanceAllowanceData: BalanceAllowanceData | null
  setBalanceAllowanceData: (arg: BalanceAllowanceData) => void
  slippage: number
  setSlippage: (arg: number) => void
  gas: number | null
  sociabilizationFee: number | null
  balances: Record<Address, bigint> | null

  zapInnerValue: number | undefined
  setZapInnerValue: (arg: number | undefined) => void

  isZapUserInput: boolean
  setIsZapUserInput: (arg: boolean) => void

  depositSliderPercent: number
  setDepositSliderPercent: (arg: number) => void

  borrowSliderPercent: number
  setBorrowSliderPercent: (arg: number) => void

  handleZapInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  maxBorrowableValue: bigint

  activeTab: string
  setActiveTab: (arg: string) => void
}

export const TgUsdDepositContext = createContext<TgUsdDepositContextValues | undefined>(undefined)

export const TgUsdDepositProvider = ({ children, collateralInfo, marketInfo }: TgUsdDepositContextProps) => {
  const { tokens } = useTgUsdContext()

  const { marketData, loadOnChainData, setCurrentAmounts } = useTgUsdRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [isDepositAndBorrow, setIsDepositAndBorrow] = useState<boolean>(false)
  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()
  const [depositAsset, setDepositAsset] = useState<string | undefined>(undefined)
  const [swapAssetPrice, setSwapAssetPrice] = useState<number | null>(null)

  const [borrowSliderPercent, setBorrowSliderPercent] = useState<number>(0)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()
  const [isDepositLoading, setIsDepositLoading] = useState(false)

  const [isZapLoading, setIsZapLoading] = useState(false)
  const [zapValue, setZapValue] = useState<bigint | null>(null)
  const [zapInnerValue, setZapInnerValue] = useState<number | undefined>(zapValue !== undefined ? Number(formatUnits(zapValue || BigInt(0), 18)) : undefined)
  const [isZapUserInput, setIsZapUserInput] = useState<boolean>(false)

  const [balanceAllowanceData, setBalanceAllowanceData] = useState<BalanceAllowanceData | null>(null)
  const [slippage, setSlippage] = useState<number>(0.1)
  const [gas, setGas] = useState<number | null>(null)

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

  const [activeTab, setActiveTab] = useState("Deposit")

  const depositAssetInfo = useMemo(() => {
    if (depositAsset === "ETH") {
      return {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        displayDecimals: 5,
        symbol: "ETH",
        name: "ETH",
        price: swapAssetPrice,
      } as AssetDataPriced
    }

    const assetInfo = tokens.find((el: ZapToken) => el.name === depositAsset || el.symbol === depositAsset) || undefined

    if (!swapAssetPrice || !assetInfo) return null

    const asset: AssetDataPriced = {
      address: assetInfo?.address,
      decimals: assetInfo?.decimals,
      displayDecimals: 2,
      symbol: assetInfo?.symbol,
      name: assetInfo?.name,
      price: swapAssetPrice,
    }

    return asset
  }, [depositAsset, swapAssetPrice])

  const sociabilizationFee = useMemo(() => {
    if (marketData?.sociabilization && depositWeiValue && depositAssetInfo) {
      return Number(formatUnits(marketData?.sociabilization?.socFeePercentage, 7)) * Number(formatUnits(depositWeiValue, depositAssetInfo?.decimals))
    }
    return 0
  }, [marketData, depositWeiValue, depositAssetInfo])

  const actionApproveZap = async () => {
    const walletClient = getWalletClient()
    if (!walletClient || !depositAssetInfo) {
      console.error("Wallet client is not available.")
      return
    }
    await doApproveZap(walletClient, depositAssetInfo?.address, depositWeiValue || 0n, TGUSD_CONTRACT.ZAPPER)
      .then(() => {
        fetchBalanceAllowanceData()
      })
      .catch((error) => {
        console.error("Error during approval:", error)
      })
  }

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !currentAddress || !depositAssetInfo) return

      setIsZapLoading(true)
      try {
        const data = await getTokenQuote(value, currentAddress, collateralInfo, depositAssetInfo)

        if (data) {
          setZapValue(data.amountOut)
        }
      } catch (error) {
        console.error("Error fetching zap value:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    fetchZapValue()
  }

  const handleZapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZapValue(parseEther(e?.target?.value))

    if (e?.target?.value === "") {
      setDepositWeiValue(undefined)
      return
    }

    const debounceTimeout = setTimeout(async () => {
      if (!parseEther(e?.target?.value) || !currentAddress || !depositAssetInfo) return
      setIsDepositLoading(true)

      try {
        const data = await getTokenQuote(parseEther(e?.target?.value), currentAddress, depositAssetInfo, collateralInfo)

        setDepositWeiValue(data.amountOut)
      } catch (error) {
        console.error("Error fetching depositWeiValue:", error)
      } finally {
        setIsDepositLoading(false)
      }
    }, 500)

    return () => clearTimeout(debounceTimeout)
  }

  const handleZapInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    setZapInnerValue(value)
    setIsZapUserInput(true) // Mark as user input
  }

  useEffect(() => {
    if (zapValue !== undefined) {
      const updatedValue = Number(Number(formatUnits(zapValue || 0n, 18)).toFixed(2))
      setZapInnerValue(updatedValue)
      setIsZapUserInput(false)
    } else {
      setZapInnerValue(undefined)
    }
  }, [zapValue])

  useEffect(() => {
    if (zapInnerValue === undefined) {
      setDepositWeiValue(undefined)
      setZapValue(0n)
      return
    }

    if (!isZapUserInput) return

    const handler = setTimeout(() => {
      handleZapChange({ target: { value: zapInnerValue.toString() } } as React.ChangeEvent<HTMLInputElement>)
    }, 500)

    return () => clearTimeout(handler)
  }, [zapInnerValue, isZapUserInput])

  useEffect(() => {
    if (!depositAsset) return

    const fetchSwapAssetData = async () => {
      setIsZapLoading(true)
      try {
        const data = await computeSwapAssetPrice(tokens, depositAsset)
        setSwapAssetPrice(data)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    fetchSwapAssetData()
  }, [depositAsset])

  useEffect(() => {
    setCurrentAmounts({
      depositWeiValue: depositWeiValue || 0n,
      borrowWeiValue: borrowWeiValue || 0n,
    })
  }, [depositWeiValue, borrowWeiValue])

  const actionApprove = () => {
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue)
      doApproveMarketDeposit(walletClient, collateralInfo?.address, {
        depositWeiValue,
        isDepositAndBorrow,
        isStaking,
        marketAddress: marketInfo?.marketAddress,
      }).then(() => loadOnChainData())
  }

  const actionDeposit = () => {
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue)
      doMarketDeposit(walletClient, { depositWeiValue, isDepositAndBorrow, isStaking, marketAddress: marketInfo?.marketAddress, borrowWeiValue }).then(() => {
        loadOnChainData()
        setDepositWeiValue(0n)
        setBorrowSliderPercent(0)
        setDepositSliderPercent(0)
      })
  }

  const formState = useMemo(
    () =>
      getDepositFormState(
        marketData,
        depositWeiValue,
        borrowWeiValue,
        isDepositAndBorrow,
        isWellConnected,
        depositAssetInfo!,
        collateralInfo!,
        balanceAllowanceData!
      ),
    [marketData, isDepositAndBorrow, borrowWeiValue, depositWeiValue, isWellConnected, currentAddress, depositAssetInfo, balanceAllowanceData]
  )

  const fetchBalanceAllowanceData = async () => {
    if (!depositAssetInfo) return

    try {
      const walletClient = getWalletClient()
      if (!walletClient) throw new Error("Wallet client not found")

      const data = await getZapTokenBalanceAllowance(walletClient, depositAssetInfo.address)

      setBalanceAllowanceData(data ? (data[0] as BalanceAllowanceData) : null)
    } catch (error) {
      console.error("Failed to fetch balance/allowance:", error)
    }
  }

  useEffect(() => {
    const tokenAddresses: Address[] = tokens.map((el) => el.address)

    if (currentAddress && tokenAddresses.length > 0) {
      getBalances(currentAddress, tokenAddresses).then((data) => {
        if (data) {
          const tokenBalances = tokenAddresses.reduce(
            (acc, address, index) => {
              acc[address] = data[index] || BigInt(0)
              return acc
            },
            {} as Record<Address, bigint>
          )
          setBalances(tokenBalances)
          setIsDepositLoading(false)
        }
      })
    }
  }, [currentAddress, tokens])

  useEffect(() => {
    fetchBalanceAllowanceData()
  }, [depositAssetInfo])

  const computeGas = async () => {
    try {
      const { routerCallData, zapMarketData } = await prepareZapTransaction(
        depositWeiValue!,
        collateralInfo,
        depositAssetInfo!,
        currentAddress!,
        marketInfo,
        slippage
      )

      const walletClient = getWalletClient()

      const [account] = await walletClient!.requestAddresses()

      let estimateGasData

      if (!!borrowWeiValue) {
        estimateGasData = {
          abi: Zapper.abi,
          functionName: "zapDepositAndBorrow",
          args: [zapMarketData, routerCallData, borrowWeiValue, isStaking] as unknown[],
          address: TGUSD_CONTRACT.ZAPPER,
          account,
          value: 0n,
        } as EstimateContractGasParameters
      } else {
        estimateGasData = {
          abi: Zapper.abi,
          functionName: "zapDeposit",
          args: [zapMarketData, routerCallData, isStaking] as unknown[],
          address: TGUSD_CONTRACT.ZAPPER,
          account,
          value: 0n,
        } as EstimateContractGasParameters
      }

      if (zapMarketData?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        estimateGasData.value = zapMarketData?.amountIn
      }

      const publicClient = await getPublicClient()
      const gasData = await publicClient.estimateContractGas(estimateGasData)

      const gasInUsd = await gasCostToUSD(gasData)
      setGas(gasInUsd)
    } catch (error) {
      console.error("Error in computeGas:", error)
    }
  }

  const getRouteAndDeposit = async () => {
    if (!depositWeiValue || !currentAddress || !depositAssetInfo) return

    setIsZapLoading(true)
    setIsDepositLoading(true)

    try {
      const { routerCallData, zapMarketData } = await prepareZapTransaction(
        depositWeiValue,
        collateralInfo,
        depositAssetInfo,
        currentAddress,
        marketInfo,
        slippage
      )

      const walletClient = getWalletClient()

      await doZapDeposit(walletClient!, routerCallData, zapMarketData, borrowWeiValue, isStaking)

      setDepositWeiValue(0n)
      setZapValue(null)
      fetchBalanceAllowanceData()
    } catch (error) {
      console.error("Error in getRouteAndDeposit:", error)
    } finally {
      setIsZapLoading(false)
      setIsDepositLoading(false)
    }
  }

  useEffect(() => {
    if (!!depositWeiValue && !!zapValue && !!depositAssetInfo && !!currentAddress && !formState?.haveToApprove && !isZapLoading && !isDepositLoading) {
      computeGas()
    }
  }, [depositWeiValue, zapValue, formState, isZapLoading, isDepositLoading])

  const maxBorrowableValue = useMemo(() => {
    if (marketData?.collateralInfos) {
      const collateralPriceRaw = marketData?.collateralInfos?.collateralUSDPrice || 0n
      const futureDebt = marketData?.debtInfos?.positionDebt || 0n
      const futureDeposited = (marketData?.collateralInfos?.positionCollateralAmount || 0n) + (depositWeiValue || 0n)
      const maxLTV = marketData?.constants.maxLTV / BigInt(10 ** 3)
      const maxBorrowable = (futureDeposited * maxLTV) / 100n - (futureDebt * DECIMALS) / collateralPriceRaw

      return maxBorrowable
    }

    return 0n
  }, [marketData, depositWeiValue])

  const contextValue: TgUsdDepositContextValues = {
    marketInfo,
    collateralInfo,
    isStaking,
    setIsStaking,
    isDepositAndBorrow,
    setIsDepositAndBorrow,
    depositWeiValue,
    setDepositWeiValue,
    actionApprove,
    actionDeposit,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
    setDepositAsset,
    depositAsset,
    tokens,

    isDepositLoading,
    setIsDepositLoading,

    isZapLoading,
    setIsZapLoading,

    zapValue,
    setZapValue,

    handleDepositChange,
    handleZapChange,
    swapAssetPrice,
    getRouteAndDeposit,
    actionApproveZap,
    depositAssetInfo,
    balanceAllowanceData,
    setBalanceAllowanceData,
    slippage,
    setSlippage,
    gas,
    sociabilizationFee,
    balances,

    zapInnerValue,
    setZapInnerValue,

    isZapUserInput,
    setIsZapUserInput,

    handleZapInputChange,

    depositSliderPercent,
    setDepositSliderPercent,

    borrowSliderPercent,
    setBorrowSliderPercent,

    maxBorrowableValue,

    activeTab,
    setActiveTab,
  }

  return <TgUsdDepositContext.Provider value={contextValue}>{children}</TgUsdDepositContext.Provider>
}

export const useTgUsdDepositContext = () => {
  const context = useContext(TgUsdDepositContext)
  if (!context) {
    throw new Error("useTgUsdDepositContext must be used within a TgUsdDepositProvider")
  }
  return context
}
