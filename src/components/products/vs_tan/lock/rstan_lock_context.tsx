"use client"

import { toast } from "react-toastify"
import { formatUnits, parseEther } from "viem"
import { useRsTanContext } from "../rstan_layout_context"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { getPublicClient } from "@/services/service_rpc"
import { useTgUsdContext } from "../../tg_usd/tg_usd_context"
import { getQuote } from "../../tg_usd/global_quote_controller"
import { LockPosition, ZapToken } from "../../tg_usd/tg_usd_type"
import { ToastComponent } from "@/components/design_system/toast"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { AssetDataPriced, CollateralInfo, ExistingAsset, FormState } from "@/types"
import { computeSwapAssetPrice } from "../../tg_usd/record/tg_usd_record_controller"
import { doApprove, doIncreaseLockAmount, doLock, getLockFormState } from "./rstan_lock_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"

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

  actionLock: () => void

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
}

export const RsTanLockContext = createContext<RsTanLockContextValues | undefined>(undefined)

export const RsTanLockProvider = ({ children }: RsTanLockContextProps) => {
  const { getWalletClient, isWellConnected, currentAddress } = useWalletConnexionContext()

  const { tokens } = useTgUsdContext()

  const { loadData, lockData } = useRsTanContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [formState, setFormState] = useState<FormState>({ canProcess: false, cantProcessReasons: [], haveToApprove: false })

  const [isPermaLock, setIsPermaLock] = useState<boolean>(false)

  const [computedNewEndLockTime, setComputedNewEndLockTime] = useState<string | null>(null)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

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
        price: 0.3,
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
        price: 0.3,
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
  }, [depositAsset, swapAssetPrice])

  const actionApprove = async () => {
    const walletClient = getWalletClient()

    if (walletClient && depositWeiValue) {
      doApprove(depositWeiValue, walletClient)
        .then(() => {
          loadData()
          setIsLoading(false)
        })
        .catch((err) => {
          const errorMessage = err.message.includes("User denied transaction signature") ? "Transaction aborted" : "Something went wrong"
          toast.error(ToastComponent, { data: { content: errorMessage, type: "Error" } })
          setIsLoading(false)
        })
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
      }
    } else {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const computeFormState = async () => {
      if (!lockData || !depositWeiValue) {
        setFormState({ canProcess: false, cantProcessReasons: ["No data"], haveToApprove: false })
      } else {
        getLockFormState(lockData?.balance, lockData?.allowance, depositPositionInfo, depositWeiValue, isWellConnected).then((d) => {
          setFormState(d)
        })
      }
    }

    if (depositPositionInfo) {
      computeFormState()
    }
  }, [depositWeiValue, isWellConnected, lockData, depositPositionInfo])

  const computedNewLockValue = useMemo(() => {
    const baseValue = depositPositionInfo?.amount ? depositPositionInfo?.amount : 0n

    const addedValue = depositWeiValue || 0n

    return formatBigInt(addedValue + baseValue, 18, 2)
  }, [depositPositionInfo, depositWeiValue])

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !currentAddress) return

      setIsZapLoading(true)
      try {
        setZapValue(value)
        // const { quote } = await getQuote(value, currentAddress, "0xDOUZE", VSTAN_CONTRACT?.TAN)

        // if (quote) {
        //   setZapValue(quote)
        // }
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
        const { quote } = await getQuote(parseEther(e?.target?.value), currentAddress, VSTAN_CONTRACT?.TAN, "0xDOUZE")

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
      const publicClient = await getPublicClient()
      const currentBlockNumber = await publicClient.getBlockNumber()
      const block = await publicClient.getBlock({ blockNumber: currentBlockNumber })

      const weekId = block.timestamp / 604800n
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
      const result = `~(${formatDollar(formatUnits((BigInt(zapValue) * BigInt(10 ** 18)) / BigInt(10 ** 18), 18))})`
      return result
    }

    return ""
  }, [zapValue])

  const contextValue: RsTanLockContextValues = {
    isLoading,
    setIsLoading,
    depositWeiValue,
    setDepositWeiValue,
    depositPositionInfo,
    depositPosition,
    setDepositPosition,
    actionApprove,
    actionLock,
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
