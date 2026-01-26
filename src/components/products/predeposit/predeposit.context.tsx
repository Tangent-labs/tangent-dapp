"use client"

import { toast } from "react-toastify"
import { PredepositStatus } from "./types/types"
import { USGTokens } from "../usg/usg_repository"
import { AssetDataPriced, FormState } from "@/types"
import { useRootContext } from "../root/root_context"
import { getTokensPrice } from "@/services/service_price"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { Address, formatUnits, WalletClient, zeroAddress } from "viem"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"
import { fetchUserStatus, validatePredepositSignature } from "./api/client.api"
import { doApprove, getBalancesAndAllowances } from "../usg/record/usg_record_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import {
  deposit,
  depositUSDC,
  fetchQuote,
  fetchfrxUSDQuote,
  getFormState,
  mapPredepositStatus,
  TOTAL_DEPOSIT_CAP,
  TOTAL_TAN_ALLOCATION,
} from "./predeposit.controller"

type PredepositContextProps = {
  children: ReactNode
}

type PredepositContextValues = {
  isLoading: boolean

  slippage: number
  setSlippage: (v: number) => void

  frxUSDslippage: number
  setfrxUSDSlippage: (v: number) => void

  USGUSDCDepositValue: bigint | undefined
  setUSGUSDCDepositValue: (v: bigint | undefined) => void

  USGfrxUSDDepositValue: bigint | undefined
  setUSGfrxUSDDepositValue: (v: bigint) => void

  USDCInfo: AssetDataPriced

  frxUSDInfo: AssetDataPriced

  USDCDepositSliderPercent: number
  setUSDCDepositSliderPercent: (v: number) => void

  frxUSDDepositSliderPercent: number
  setfrxUSDDepositSliderPercent: (v: number) => void

  USDCBalanceAllowance: { balance: bigint; allowance: bigint }

  frxUSDBalanceAllowance: { balance: bigint; allowance: bigint }

  USDCDepositValue: bigint | undefined
  setUSDCDepositValue: (v: bigint | undefined) => void

  frxUSDDepositValue: bigint | undefined
  setfrxUSDDepositValue: (v: bigint | undefined) => void

  handleDepositChange: (arg: bigint | undefined) => void

  handleDepositfrxUSDChange: (arg: bigint | undefined) => void

  USGUSDCInnerValue: number

  USGfrxUSDInnerValue: number

  USGUSDCformState: FormState

  USGfrxUSDformState: FormState

  actionApproveUSGUSDC: () => void

  actionDepositUSGUSDC: () => void

  actionApproveUSGfrxUSD: () => void

  actionDepositUSGfrxUSD: () => void

  predepositStatus: PredepositStatus | null

  isWhitelisted: boolean

  setDepositMaxUSGUSDC: () => void

  setDepositMaxUSGfrxUSD: () => void

  projectedfrxUSDTANAllocation: bigint

  projectedUSDCTANAllocation: bigint
}

export const PredepositContext = createContext<PredepositContextValues | undefined>(undefined)

export const PredepositProvider = ({ children }: PredepositContextProps) => {
  const USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  const frxUSD_ADDRESS = "0xcacd6fd266af91b8aed52accc382b4e165586e29"

  const { currentAddress, walletClient, isWalletInitialized } = useWalletConnexionContext()

  const { getCachedCurrentBlock } = useRootContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [slippage, setSlippage] = useState<number>(0.2)
  const [frxUSDslippage, setfrxUSDSlippage] = useState<number>(0.2)

  const [USDCDepositValue, setUSDCDepositValue] = useState<bigint>()
  const [frxUSDDepositValue, setfrxUSDDepositValue] = useState<bigint>()

  const [USGUSDCDepositValue, setUSGUSDCDepositValue] = useState<bigint | undefined>()
  const [USGfrxUSDDepositValue, setUSGfrxUSDDepositValue] = useState<bigint | undefined>()

  const [USDCDepositSliderPercent, setUSDCDepositSliderPercent] = useState<number>(0)
  const [frxUSDDepositSliderPercent, setfrxUSDDepositSliderPercent] = useState<number>(0)

  const [USDCPrice, setUSDCPrice] = useState<number>(1)
  const [frxUSDPrice, setfrxUSDPrice] = useState<number>(1)

  const [USDCBalanceAllowance, setUSDCBalanceAllowance] = useState<{ balance: bigint; allowance: bigint }>({ balance: 0n, allowance: 0n })
  const [frxUSDBalanceAllowance, setfrxUSDBalanceAllowance] = useState<{ balance: bigint; allowance: bigint }>({ balance: 0n, allowance: 0n })

  const [USGUSDCInnerValue, setUSGUSDCInnerValue] = useState<number>(
    USGUSDCDepositValue !== undefined ? Number(formatUnits(USGUSDCDepositValue || BigInt(0), 18)) : 0
  )

  const [USGfrxUSDInnerValue, setUSGfrxUSDInnerValue] = useState<number>(
    USGfrxUSDDepositValue !== undefined ? Number(formatUnits(USGfrxUSDDepositValue || BigInt(0), 18)) : 0
  )

  const [predepositStatus, setPredepositStatus] = useState<PredepositStatus | null>(null)

  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false)

  const getUserStatus = async () => {
    const status = await fetchUserStatus(currentAddress || zeroAddress)

    if (status) {
      const mappedStatus: PredepositStatus = mapPredepositStatus(status)

      const userCanSignAndAccessPredeposit =
        (mappedStatus?.predepositState === "deposit_private" && mappedStatus?.userState === "private") || mappedStatus?.predepositState === "deposit_public"

      if (!!mappedStatus && mappedStatus?.isSigned && (mappedStatus?.userState === "private" || mappedStatus?.predepositState === "deposit_public")) {
        setIsWhitelisted(true)
      } else if (!!mappedStatus && userCanSignAndAccessPredeposit && !mappedStatus?.isSigned) {
        await signMessage()
      }

      setPredepositStatus(mappedStatus)
    }
  }

  /**
   * On init
   */
  useEffect(() => {
    if (isWalletInitialized) {
      getUserStatus()
    }
  }, [isWalletInitialized])

  /**
   * On user logs in/logs out
   */
  useEffect(() => {
    if (isWalletInitialized && predepositStatus) {
      getUserStatus()
    }
  }, [currentAddress])

  useEffect(() => {
    if (walletClient) {
      fetchPrices()
      getUSGUSDCBalanceAllowance(walletClient)
      getUSGfrxUSDBalanceAllowance(walletClient)

      setIsLoading(false)
    }
  }, [walletClient])

  const getUSGUSDCBalanceAllowance = async (walletClient: WalletClient) => {
    const data = await getBalancesAndAllowances(walletClient!, USDC_ADDRESS, USGTokens[1]["USG-USDC"])

    if (data) setUSDCBalanceAllowance({ balance: data[0]?.balance, allowance: data[0]?.allowances[0].allowance })
  }

  const getUSGfrxUSDBalanceAllowance = async (walletClient: WalletClient) => {
    const data = await getBalancesAndAllowances(walletClient!, frxUSD_ADDRESS, USGTokens[1]["USG-frxUSD"])

    if (data) setfrxUSDBalanceAllowance({ balance: data[0]?.balance, allowance: data[0]?.allowances[0].allowance })
  }

  const fetchPrices = async () => {
    const data = await getTokensPrice(["frxUSD", "USDC"])

    if (data) {
      setUSDCPrice(data["USDC"])
      setfrxUSDPrice(data["frxUSD"])
    }
  }

  const USDCInfo = useMemo(() => {
    return {
      address: USDC_ADDRESS as Address,
      decimals: 6,
      displayDecimals: 2,
      symbol: "USDC",
      name: "USD Coin",
      price: USDCPrice,
    }
  }, [USDCPrice])

  const frxUSDInfo = useMemo(() => {
    return {
      address: frxUSD_ADDRESS as Address,
      decimals: 18,
      displayDecimals: 2,
      symbol: "frxUSD",
      name: "Frax USD",
      price: frxUSDPrice,
    }
  }, [frxUSDPrice])

  const handleDepositChange = (value: bigint | undefined) => {
    if (value) {
      setUSDCDepositValue(value)

      const getUSDCPredepositQuote = async (depositValue: bigint) => {
        const quote = await fetchQuote(depositValue, USGTokens[1]["USG-USDC"])
        setUSGUSDCDepositValue(quote)
      }

      getUSDCPredepositQuote(value)
    }
  }

  const handleDepositfrxUSDChange = (value: bigint | undefined) => {
    if (value) {
      setfrxUSDDepositValue(value)

      const getfrxUSDPredepositQuote = async (depositValue: bigint) => {
        // TODO replace by fetchQuote
        const quote = await fetchfrxUSDQuote(depositValue, USGTokens[1]["USG-frxUSD"])
        setUSGfrxUSDDepositValue(quote)
      }

      getfrxUSDPredepositQuote(value)
    }
  }

  useEffect(() => {
    if (USGUSDCDepositValue !== undefined) {
      const updatedValue = Number(Number(formatUnits(USGUSDCDepositValue || 0n, 18)).toFixed(3))
      setUSGUSDCInnerValue(updatedValue)
    } else {
      setUSGUSDCInnerValue(0)
    }
  }, [USGUSDCDepositValue])

  useEffect(() => {
    if (USGfrxUSDDepositValue !== undefined) {
      const updatedValue = Number(Number(formatUnits(USGfrxUSDDepositValue || 0n, 18)).toFixed(3))
      setUSGfrxUSDInnerValue(updatedValue)
    } else {
      setUSGfrxUSDInnerValue(0)
    }
  }, [USGfrxUSDDepositValue])

  const USGUSDCformState = useMemo(() => {
    if (predepositStatus) {
      return getFormState(
        USDCDepositValue,
        USDCBalanceAllowance,
        predepositStatus?.USGUSDCData?.USGUSDCCap / 10n ** 12n,
        predepositStatus?.USGUSDCData?.USGUSDCAccumulatedTotal / 10n ** 12n
      )
    }
    return { canProcess: false, cantProcessReasons: [], haveToApprove: false }
  }, [USDCDepositValue, predepositStatus, currentAddress, USDCBalanceAllowance])

  const USGfrxUSDformState = useMemo(() => {
    if (predepositStatus) {
      return getFormState(
        frxUSDDepositValue,
        frxUSDBalanceAllowance,
        predepositStatus?.USGfrxUSDData?.USGfrxUSDCap,
        predepositStatus?.USGfrxUSDData?.USGfrxUSDAccumulatedTotal
      )
    }
    return { canProcess: false, cantProcessReasons: [], haveToApprove: false }
  }, [frxUSDDepositValue, predepositStatus, currentAddress, frxUSDBalanceAllowance])

  const actionApproveUSGUSDC = () => {
    setIsLoading(true)
    if (walletClient && USDCDepositValue) {
      doApprove(walletClient, USDCInfo?.address, USGTokens[1]["USG-USDC"], USDCDepositValue).then(() => {
        getUSGUSDCBalanceAllowance(walletClient)
        setIsLoading(false)
      })
    }
  }

  const actionApproveUSGfrxUSD = () => {
    setIsLoading(true)
    if (walletClient && frxUSDDepositValue) {
      doApprove(walletClient, frxUSDInfo?.address, USGTokens[1]["USG-frxUSD"], frxUSDDepositValue).then(() => {
        getUSGfrxUSDBalanceAllowance(walletClient)
        setIsLoading(false)
      })
    }
  }

  const actionDepositUSGUSDC = async () => {
    if (USDCDepositValue) {
      setIsLoading(true)

      // TODO : replace by deposit()
      await toastTx(depositUSDC(walletClient!, USDCDepositValue, slippage, USGTokens[1]["USG-USDC"]), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => {
          getUSGUSDCBalanceAllowance(walletClient!)
          setUSDCDepositValue(0n)
          setUSDCDepositSliderPercent(0)
          setUSGUSDCDepositValue(0n)
          setIsLoading(false)
          return { type: "Success", content: "USDC successfully deposited." }
        },
        error: () => {
          setIsLoading(false)
          return { type: "Error", content: "Unable to proceed with the deposit." }
        },
      })
    }
  }

  const actionDepositUSGfrxUSD = async () => {
    if (frxUSDDepositValue) {
      setIsLoading(true)

      await toastTx(deposit(walletClient!, frxUSDDepositValue, slippage, USGTokens[1]["USG-frxUSD"]), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => {
          getUSGfrxUSDBalanceAllowance(walletClient!)
          setfrxUSDDepositValue(0n)
          setfrxUSDDepositSliderPercent(0)
          setUSGfrxUSDDepositValue(0n)
          setIsLoading(false)

          return { type: "Success", content: "frxUSD successfully deposited." }
        },
        error: () => {
          setIsLoading(false)
          return { type: "Error", content: "Unable to proceed with the deposit." }
        },
      })
    }
  }

  const signMessage = async () => {
    setIsLoading(true)

    try {
      const message = `I, owner of wallet ${currentAddress?.toLowerCase()} assess to participate to the predeposit campaign.`

      if (walletClient && currentAddress) {
        const pendingToastId = toast.info(ToastComponent, {
          data: {
            type: "Pending Transaction",
            content: "Pending signature awaiting validation...",
          },
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        })

        const signature = await walletClient.signMessage({
          account: currentAddress,
          message,
        })

        const currentBlock = await getCachedCurrentBlock()
        const now = new Date(Number(currentBlock.timestamp) * 1000)

        validatePredepositSignature(signature, currentAddress, now)
          .then((resp) => {
            if (resp) {
              toast.update(pendingToastId, {
                render: ToastComponent,
                data: {
                  type: "Success",
                  content: "You are whitelisted.",
                },
                autoClose: 3000,
                closeOnClick: true,
                draggable: true,
              })

              setIsWhitelisted(true)
            } else {
              toast.dismiss(pendingToastId)
              setIsWhitelisted(false)
            }
          })
          .catch((error) => {
            console.error("error : ", error)
          })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const setDepositMaxUSGUSDC = () => {
    let valueToFill = 0n

    if (!!predepositStatus?.USGUSDCData) {
      if (USDCBalanceAllowance?.balance * 10n ** 12n <= predepositStatus?.USGUSDCData?.USGUSDCCap - predepositStatus?.USGUSDCData?.USGUSDCAccumulatedTotal) {
        valueToFill = USDCBalanceAllowance?.balance
      } else {
        valueToFill = (predepositStatus?.USGUSDCData?.USGUSDCCap - predepositStatus?.USGUSDCData?.USGUSDCAccumulatedTotal) / 10n ** 12n
      }
    }
    handleDepositChange(valueToFill)
  }

  const setDepositMaxUSGfrxUSD = () => {
    let valueToFill = 0n

    if (!!predepositStatus?.USGfrxUSDData) {
      if (frxUSDBalanceAllowance?.balance <= predepositStatus?.USGfrxUSDData?.USGfrxUSDCap - predepositStatus?.USGfrxUSDData?.USGfrxUSDAccumulatedTotal) {
        valueToFill = USDCBalanceAllowance?.balance
      } else {
        valueToFill = predepositStatus?.USGfrxUSDData?.USGfrxUSDCap - predepositStatus?.USGfrxUSDData?.USGfrxUSDAccumulatedTotal
      }
    }
    handleDepositfrxUSDChange(valueToFill)
  }

  const projectedUSDCTANAllocation = useMemo(() => {
    if (USDCDepositValue) {
      return (USDCDepositValue * 10n ** 12n * TOTAL_TAN_ALLOCATION) / (TOTAL_DEPOSIT_CAP * 10n ** 18n)
    }
    return 0n
  }, [USDCDepositValue])

  const projectedfrxUSDTANAllocation = useMemo(() => {
    if (frxUSDDepositValue) {
      return (frxUSDDepositValue * TOTAL_TAN_ALLOCATION) / (TOTAL_DEPOSIT_CAP * 10n ** 18n)
    }
    return 0n
  }, [frxUSDDepositValue])

  const contextValue: PredepositContextValues = {
    isLoading,
    slippage,
    setSlippage,
    frxUSDslippage,
    setfrxUSDSlippage,
    USGUSDCDepositValue,
    setUSGUSDCDepositValue,
    USDCInfo,
    frxUSDInfo,
    USGfrxUSDDepositValue,
    setUSGfrxUSDDepositValue,
    USDCDepositSliderPercent,
    setUSDCDepositSliderPercent,
    frxUSDDepositSliderPercent,
    setfrxUSDDepositSliderPercent,
    USDCBalanceAllowance,
    frxUSDBalanceAllowance,
    USDCDepositValue,
    handleDepositChange,
    setUSDCDepositValue,
    USGUSDCInnerValue,
    USGfrxUSDInnerValue,
    frxUSDDepositValue,
    setfrxUSDDepositValue,
    USGUSDCformState,
    USGfrxUSDformState,
    actionApproveUSGUSDC,
    actionDepositUSGUSDC,
    actionApproveUSGfrxUSD,
    actionDepositUSGfrxUSD,
    handleDepositfrxUSDChange,
    predepositStatus,
    isWhitelisted,
    setDepositMaxUSGUSDC,
    setDepositMaxUSGfrxUSD,
    projectedUSDCTANAllocation,
    projectedfrxUSDTANAllocation,
  }

  return <PredepositContext.Provider value={contextValue}>{children}</PredepositContext.Provider>
}

export const usePredepositContext = () => {
  const context = useContext(PredepositContext)
  if (!context) {
    throw new Error("usePredepositContext must be used within a PredepositProvider")
  }
  return context
}
