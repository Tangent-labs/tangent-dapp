"use client"

import { toast } from "react-toastify"
import { USGTokens } from "../usg/usg_repository"
import { fetchUserStatus, validatePredepositSignature } from "./api/client.api"
import { AssetDataPriced, FormState } from "@/types"
import { Address, formatUnits, WalletClient, zeroAddress } from "viem"
import { getSwapAssetPrice } from "@/services/service_price"
import { ToastComponent } from "@/components/design_system/toast"
import { deposit, fetchQuote, getFormState, mapPredepositStatus } from "./predeposit.controller"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"
import { doApprove, getBalancesAndAllowances } from "../usg/record/usg_record_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { PredepositStatus } from "./types/types"
import { useRootContext } from "../root/root_context"

type PredepositContextProps = {
  children: ReactNode
}

type PredepositContextValues = {
  isLoading: boolean

  slippage: number
  setSlippage: (nigger: number) => void

  USGUSDCDepositValue: bigint | undefined
  setUSGUSDCDepositValue: (nigger: bigint | undefined) => void

  USGfrxUSDDepositValue: bigint | undefined
  setUSGfrxUSDDepositValue: (nigger: bigint) => void

  USDCInfo: AssetDataPriced

  frxUSDInfo: AssetDataPriced

  USDCDepositSliderPercent: number
  setUSDCDepositSliderPercent: (nigger: number) => void

  frxUSDDepositSliderPercent: number
  setfrxUSDDepositSliderPercent: (nigger: number) => void

  USDCBalanceAllowance: { balance: bigint; allowance: bigint }

  frxUSDBalanceAllowance: { balance: bigint; allowance: bigint }

  USDCDepositValue: bigint | undefined
  setUSDCDepositValue: (nigger: bigint | undefined) => void

  frxUSDDepositValue: bigint | undefined
  setfrxUSDDepositValue: (nigger: bigint | undefined) => void

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
}

export const PredepositContext = createContext<PredepositContextValues | undefined>(undefined)

export const PredepositProvider = ({ children }: PredepositContextProps) => {
  const USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  const frxUSD_ADDRESS = "0xcacd6fd266af91b8aed52accc382b4e165586e29"

  const { currentAddress, getWalletClient, isWalletInitialized } = useWalletConnexionContext()

  const { getCachedCurrentBlock } = useRootContext()

  const walletClient = useMemo(() => {
    return getWalletClient()
  }, [currentAddress])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [slippage, setSlippage] = useState<number>(0.2)

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

      if (!!mappedStatus && mappedStatus?.isSigned) {
        setPredepositStatus(mappedStatus)
        setIsWhitelisted(true)
      } else if (!!mappedStatus && !mappedStatus?.isSigned) {
        await signMessage()
        setPredepositStatus(mappedStatus)
      }
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
      computeUSDCPrice()
      getUSGUSDCBalanceAllowance(walletClient)
      getUSGfrxUSDBalanceAllowance(walletClient)

      computefrxUSDPrice()

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

  const computefrxUSDPrice = async () => {
    const data = await getSwapAssetPrice(frxUSD_ADDRESS)
    setfrxUSDPrice(data || 1)
  }

  const computeUSDCPrice = async () => {
    const data = await getSwapAssetPrice(USDC_ADDRESS)
    setUSDCPrice(data || 1)
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
        const quote = await fetchQuote(depositValue, USGTokens[1]["USG-frxUSD"])
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

  const USGUSDCformState = useMemo(() => getFormState(USDCDepositValue, USDCBalanceAllowance), [USDCDepositValue, currentAddress, USDCBalanceAllowance])

  const USGfrxUSDformState = useMemo(
    () => getFormState(frxUSDDepositValue, frxUSDBalanceAllowance),
    [frxUSDDepositValue, currentAddress, frxUSDBalanceAllowance]
  )

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

  const actionDepositUSGUSDC = () => {
    if (USDCDepositValue) {
      setIsLoading(true)

      deposit(walletClient!, USDCDepositValue, slippage, USGTokens[1]["USG-USDC"])
        .then(() => {
          toast.success(ToastComponent, { data: { type: "Success", content: "USDC deposit successful." } })
          getUSGUSDCBalanceAllowance(walletClient!)
          setUSDCDepositValue(0n)
          setUSDCDepositSliderPercent(0)
          setUSGUSDCDepositValue(0n)
          setIsLoading(false)
        })
        .catch(() => {
          toast.error(ToastComponent, { data: { type: "Error", content: "USDC deposit failed." } })
          setIsLoading(false)
        })
    }
  }

  const actionDepositUSGfrxUSD = () => {
    if (frxUSDDepositValue) {
      setIsLoading(true)

      deposit(walletClient!, frxUSDDepositValue, slippage, USGTokens[1]["USG-frxUSD"])
        .then(() => {
          toast.success(ToastComponent, { data: { type: "Success", content: "frxUSD deposit successful." } })
          getUSGfrxUSDBalanceAllowance(walletClient!)
          setfrxUSDDepositValue(0n)
          setfrxUSDDepositSliderPercent(0)
          setUSGfrxUSDDepositValue(0n)
          setIsLoading(false)
        })
        .catch(() => {
          toast.error(ToastComponent, { data: { type: "Error", content: "frxUSD deposit failed." } })
          setIsLoading(false)
        })
    }
  }

  const signMessage = async () => {
    setIsLoading(true)

    try {
      const walletClient = getWalletClient()

      const message = `I, owner of wallet ${currentAddress?.toLowerCase()} assess to participate to the predeposit campaign.`

      if (walletClient && currentAddress) {
        const signature = await walletClient.signMessage({
          account: currentAddress,
          message,
        })

        const currentBlock = await getCachedCurrentBlock()
        const now = new Date(Number(currentBlock.timestamp) * 1000)

        validatePredepositSignature(signature, currentAddress, now)
          .then((resp) => {
            if (resp) {
              setIsWhitelisted(true)
            } else {
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

  const contextValue: PredepositContextValues = {
    isLoading,
    slippage,
    setSlippage,
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
