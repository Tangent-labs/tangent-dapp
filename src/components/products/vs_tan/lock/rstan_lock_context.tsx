"use client"

import { toast } from "react-toastify"
import { formatUnits, parseEther } from "viem"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { getCurrentBlock } from "@/services/service_rpc"
import { useRsTanContext } from "../rstan_layout_context"
import { useUSGContext } from "../../tg_usd/tg_usd_context"
import { LockPosition, ZapToken } from "../../tg_usd/tg_usd_type"
import { ToastComponent } from "@/components/design_system/toast"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import { getQuote, getRoute } from "../../tg_usd/global_quote_controller"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { AssetDataPriced, CollateralInfo, ExistingAsset, FormState } from "@/types"
import { computeSwapAssetPrice } from "../../tg_usd/record/tg_usd_record_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { doApprove, doIncreaseLockAmount, doLock, doZapAndIncreaseLock, doZapAndLock, getLockFormState } from "./rstan_lock_controller"

type RsTanLockContextProps = {
  children: ReactNode
}

type RsTanLockContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  isPermaLock: boolean
  setIsPermaLock: (arg: boolean) => void

  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void

  depositPositionInfo: LockPosition | undefined

  depositPosition: string
  setDepositPosition: (arg: string) => void

  actionApprove: () => void

  actionApproveZap: () => void

  actionLock: () => void

  actionZapAndLock: () => void

  formState: FormState

  computedNewLockValue: string

  computedNewEndLockTime: string | null

  depositAsset: string | undefined
  setDepositAsset: (arg: string) => void

  isZapLoading: boolean
  setIsZapLoading: (arg: boolean) => void

  zapValue: bigint | null
  setZapValue: (arg: bigint) => void

  zapInnerValue: number | undefined

  handleZapInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  handleDepositChange: (arg: bigint | undefined) => void

  isZapUserInput: boolean
  setIsZapUserInput: (arg: boolean) => void

  estimatedZapDollarValue: string

  depositAssetInfo: AssetDataPriced | CollateralInfo

  maxAmountToDeposit: string

  slippage: number
  setSlippage: (arg: number) => void
}

export const RsTanLockContext = createContext<RsTanLockContextValues | undefined>(undefined)

export const RsTanLockProvider = ({ children }: RsTanLockContextProps) => {
  const { getWalletClient, isWellConnected, currentAddress } = useWalletConnexionContext()

  const { tokens } = useUSGContext()

  const { loadData, lockData, fetchBalanceAllowanceData, balanceAllowanceData } = useRsTanContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [formState, setFormState] = useState<FormState>({ canProcess: false, cantProcessReasons: [], haveToApprove: false })

  const [isPermaLock, setIsPermaLock] = useState<boolean>(false)

  const [computedNewEndLockTime, setComputedNewEndLockTime] = useState<string | null>(null)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

  const [slippage, setSlippage] = useState<number>(1)

  const [depositPosition, setDepositPosition] = useState<string>("New")

  const [depositAsset, setDepositAsset] = useState<string>("TAN")

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [zapValue, setZapValue] = useState<bigint | null>(null)

  const [zapInnerValue, setZapInnerValue] = useState<number | undefined>(zapValue !== undefined ? Number(formatUnits(zapValue || BigInt(0), 18)) : undefined)

  const [isZapUserInput, setIsZapUserInput] = useState<boolean>(false)

  const depositPositionInfo = useMemo(() => {
    if (depositPosition === "New") {
      return { amount: 0n, claimable: 0n, endLockTime: "", tokenId: 0n }
    }

    const pos = lockData?.positions.find((position) => position?.tokenId.toString() === depositPosition)
    setIsPermaLock(false)

    return pos
  }, [depositPosition])

  const depositAssetInfo = useMemo<AssetDataPriced | CollateralInfo>(() => {
    if (depositAsset === "ETH") {
      return {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        displayDecimals: 5,
        symbol: "ETH",
        name: "ETH",
        price: swapAssetPrice,
      }
    }

    if (depositAsset === "TAN") {
      return {
        symbol: "TAN",
        name: "TAN",
        value: "TAN",
        decimals: 18,
        address: VSTAN_CONTRACT?.TAN,
        logo: "TAN" as ExistingAsset,
        displayDecimals: 5,
        // TODO : update to 18 decimalss
        price: Number(formatBigInt(lockData?.tanPrice, 12, 6)),
      }
    }

    const assetInfo = tokens.find((el: ZapToken) => el.name === depositAsset || el.symbol === depositAsset) || undefined

    if (!swapAssetPrice || !assetInfo)
      return {
        symbol: "TAN",
        name: "TAN",
        value: "TAN",
        decimals: 18,
        address: VSTAN_CONTRACT?.TAN,
        logo: "TAN" as ExistingAsset,
        displayDecimals: 5,
        // TODO : update to 18 decimalss
        price: Number(formatBigInt(lockData?.tanPrice, 12, 6)),
      }

    const asset: AssetDataPriced = {
      address: assetInfo?.address,
      decimals: assetInfo?.decimals,
      displayDecimals: 2,
      symbol: assetInfo?.symbol,
      name: assetInfo?.name,
      price: swapAssetPrice,
    }

    return asset
  }, [depositAsset, swapAssetPrice, lockData])

  const actionApproveZap = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue) {
      await doApprove(walletClient, depositAssetInfo?.address, VSTAN_CONTRACT.VSTAN, depositWeiValue)
        .then(() => {
          fetchBalanceAllowanceData(depositAssetInfo?.address)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error during approval:", error)
          setIsLoading(false)
        })
    }
  }

  const actionApprove = () => {
    setIsLoading(true)
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue)
      doApprove(walletClient, VSTAN_CONTRACT.TAN, VSTAN_CONTRACT.VSTAN, depositWeiValue)
        .then(() => {
          loadData()
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error during approval:", error)
          setIsLoading(false)
        })
  }

  const actionZapAndLock = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && depositWeiValue) {
      const zapMarketData = {
        tokenIn: depositAssetInfo?.address,
        amountIn: depositWeiValue,
        minAmountOut: (BigInt(zapValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
      }

      const zapAndLockData = await getRoute(
        depositAssetInfo?.address,
        VSTAN_CONTRACT.TAN,
        depositWeiValue,
        (BigInt(zapValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        VSTAN_CONTRACT.VSTAN,
        currentAddress!
      )

      if (depositPositionInfo && depositPositionInfo?.tokenId !== 0n) {
        doZapAndIncreaseLock(VSTAN_CONTRACT?.VSTAN, walletClient!, zapMarketData, zapAndLockData!, depositPositionInfo?.tokenId)
          .then(() => {
            loadData()
            setIsLoading(false)
            setDepositWeiValue(0n)
            setZapValue(null)
            setZapInnerValue(0)
            toast.success(ToastComponent, { data: { type: "Success", content: "Successfully increased lock position." } })
          })
          .catch(() => {
            setIsLoading(false)
          })
      } else {
        doZapAndLock(VSTAN_CONTRACT?.VSTAN, walletClient!, zapMarketData, zapAndLockData!, isPermaLock)
          .then(() => {
            loadData()
            setIsLoading(false)
            setDepositWeiValue(0n)
            setZapValue(null)
            setZapInnerValue(0)
            toast.success(ToastComponent, { data: { type: "Success", content: "Successfully created lock position." } })
          })
          .catch(() => {
            setIsLoading(false)
          })
      }
    } else {
      setIsLoading(false)
    }
  }

  const actionLock = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && depositWeiValue) {
      if (depositPositionInfo && depositPositionInfo?.tokenId !== 0n) {
        await doIncreaseLockAmount(depositPositionInfo?.tokenId, depositWeiValue, walletClient)
        loadData()
        setIsLoading(false)
        toast.success(ToastComponent, { data: { type: "Success", content: "Successfully increased lock position." } })
      } else {
        await doLock(depositWeiValue, walletClient, isPermaLock)
        loadData()
        setIsLoading(false)
        toast.success(ToastComponent, { data: { type: "Success", content: "Successfully created lock position." } })
        setDepositWeiValue(0n)
      }
    } else {
      setIsLoading(false)
    }
  }

  const lockBalanceAllowanceData = useMemo(() => {
    if (!!lockData && depositAsset === "TAN") {
      return { balance: lockData?.balance, allowance: lockData?.allowance }
    } else if (!!balanceAllowanceData && depositAsset !== "TAN") {
      return { balance: balanceAllowanceData?.balance, allowance: balanceAllowanceData?.allowances[0]?.allowance }
    }
    return { balance: 0n, allowance: 0n }
  }, [lockData, balanceAllowanceData])

  useEffect(() => {
    const computeFormState = async () => {
      if (!lockData || !depositWeiValue) {
        setFormState({ canProcess: false, cantProcessReasons: ["No data"], haveToApprove: false })
      } else {
        getLockFormState(lockBalanceAllowanceData, depositPositionInfo, depositWeiValue, depositAsset, isWellConnected).then((d) => {
          setFormState(d)
        })
      }
    }

    if (depositPositionInfo) {
      computeFormState()
    }
  }, [depositWeiValue, isWellConnected, lockBalanceAllowanceData, depositPositionInfo])

  const computedNewLockValue = useMemo(() => {
    const baseValue = depositPositionInfo?.amount ? depositPositionInfo?.amount : 0n

    const addedValue = depositAsset !== "TAN" && !!zapValue ? zapValue : depositWeiValue || 0n

    return formatBigInt(addedValue + baseValue, 18, 2)
  }, [depositPositionInfo, depositWeiValue, depositAsset, zapValue])

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !currentAddress) return

      setIsZapLoading(true)
      try {
        const { quote } = await getQuote(value, currentAddress, VSTAN_CONTRACT?.TAN, depositAssetInfo?.address)

        if (quote) {
          setZapValue(quote)
        }
      } catch (error) {
        console.error("Error fetching zap value:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    if (depositAsset !== "TAN") {
      fetchZapValue()
    }
  }

  const handleZapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZapValue(parseEther(e?.target?.value))

    if (e?.target?.value === "") {
      setDepositWeiValue(undefined)
      return
    }

    const debounceTimeout = setTimeout(async () => {
      if (!parseEther(e?.target?.value) || !currentAddress) return
      setIsZapLoading(true)

      try {
        const { quote } = await getQuote(parseEther(e?.target?.value), currentAddress, depositAssetInfo?.address, VSTAN_CONTRACT?.TAN)

        setDepositWeiValue(quote)
      } catch (error) {
        console.error("Error fetching depositWeiValue:", error)
      } finally {
        setIsZapLoading(false)
      }
    }, 500)

    return () => clearTimeout(debounceTimeout)
  }

  useEffect(() => {
    const computeEndLockTime = async () => {
      const currentBlock = await getCurrentBlock()

      const weekId = currentBlock.timestamp / 604800n
      const adjustedTime = (weekId + 13n) * 604800n

      setComputedNewEndLockTime(adjustedTime.toString())
    }

    if (depositPositionInfo) {
      computeEndLockTime()
    }
  }, [depositPositionInfo, depositWeiValue])

  const handleZapInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    setZapInnerValue(value)
    setIsZapUserInput(true)
  }

  useEffect(() => {
    if (zapValue !== undefined) {
      const updatedValue = Number(Number(formatUnits(zapValue || 0n, 18)).toFixed(3))
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

        setSwapAssetPrice(data || 0)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    fetchSwapAssetData()
  }, [depositAsset])

  const estimatedZapDollarValue = useMemo(() => {
    if (zapValue) {
      const result = `~(${formatDollar(formatUnits((BigInt(zapValue) * BigInt(0.22 * 10 ** 18)) / BigInt(10 ** 18), 18))})`
      return result
    }

    return ""
  }, [zapValue])

  const maxAmountToDeposit = useMemo(() => {
    const amount = depositAsset === "TAN" ? lockData?.balance : balanceAllowanceData?.balance

    return `Max : ${formatBigInt(amount, depositAssetInfo?.decimals, 2)} ${depositAssetInfo?.symbol}`
  }, [depositAssetInfo, lockData, balanceAllowanceData])

  useEffect(() => {
    if (depositAssetInfo) {
      fetchBalanceAllowanceData(depositAssetInfo?.address)
    }

    if (depositAsset !== depositAssetInfo?.symbol) {
      setDepositWeiValue(0n)
    }
  }, [depositAssetInfo])

  const contextValue: RsTanLockContextValues = {
    isLoading,
    setIsLoading,
    depositWeiValue,
    setDepositWeiValue,
    depositPositionInfo,
    depositPosition,
    setDepositPosition,
    actionApprove,
    actionApproveZap,
    actionLock,
    actionZapAndLock,
    formState,
    computedNewLockValue,
    computedNewEndLockTime,
    setIsPermaLock,
    isPermaLock,
    depositAsset,
    setDepositAsset,
    isZapLoading,
    setIsZapLoading,
    zapInnerValue,
    zapValue,
    setZapValue,
    handleZapInputChange,
    isZapUserInput,
    setIsZapUserInput,
    estimatedZapDollarValue,
    handleDepositChange,
    depositAssetInfo,
    maxAmountToDeposit,
    slippage,
    setSlippage,
  }

  return <RsTanLockContext.Provider value={contextValue}>{children}</RsTanLockContext.Provider>
}

export const useRsTanLockContext = () => {
  const context = useContext(RsTanLockContext)
  if (!context) {
    throw new Error("useRsTanLockContext must be used within a RsTanLockProvider")
  }
  return context
}
