"use client"

import { getSwapAssetPrice } from "@/services/service_price"
import { AssetDataPriced } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { Address, formatUnits, WalletClient } from "viem"
import { getBalancesAndAllowances } from "../usg/record/usg_record_controller"
import { USGTokens } from "../usg/usg_repository"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"

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

  USDCBalance: bigint

  frxUSDBalance: bigint

  USDCDepositValue: bigint | undefined
  setUSDCDepositValue: (nigger: bigint | undefined) => void

  frxUSDDepositValue: bigint | undefined
  setfrxUSDDepositValue: (nigger: bigint | undefined) => void

  handleDepositChange: (arg: bigint | undefined) => void

  USGUSDCInnerValue: number

  USGfrxUSDInnerValue: number
}

export const PredepositContext = createContext<PredepositContextValues | undefined>(undefined)

export const PredepositProvider = ({ children }: PredepositContextProps) => {
  const USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  const frxUSD_ADDRESS = "0xcacd6fd266af91b8aed52accc382b4e165586e29"

  const { currentAddress, getWalletClient } = useWalletConnexionContext()

  const walletClient = useMemo(() => {
    return getWalletClient()
  }, [currentAddress])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [slippage, setSlippage] = useState<number>(0.2)

  //

  const [USDCDepositValue, setUSDCDepositValue] = useState<bigint>()
  const [frxUSDDepositValue, setfrxUSDDepositValue] = useState<bigint>()

  //

  const [USGUSDCDepositValue, setUSGUSDCDepositValue] = useState<bigint | undefined>()
  const [USGfrxUSDDepositValue, setUSGfrxUSDDepositValue] = useState<bigint | undefined>()

  //

  const [USDCDepositSliderPercent, setUSDCDepositSliderPercent] = useState<number>(0)
  const [frxUSDDepositSliderPercent, setfrxUSDDepositSliderPercent] = useState<number>(0)

  //

  const [USDCPrice, setUSDCPrice] = useState<number>(1)
  const [frxUSDPrice, setfrxUSDPrice] = useState<number>(1)

  //

  const [USDCBalance, setUSDCBalance] = useState<bigint>(0n)
  const [frxUSDBalance, setfrxUSDBalance] = useState<bigint>(0n)

  //

  const [USGUSDCInnerValue, setUSGUSDCInnerValue] = useState<number>(
    USGUSDCDepositValue !== undefined ? Number(formatUnits(USGUSDCDepositValue || BigInt(0), 18)) : 0
  )

  const [USGfrxUSDInnerValue, setUSGfrxUSDInnerValue] = useState<number>(
    USGfrxUSDDepositValue !== undefined ? Number(formatUnits(USGfrxUSDDepositValue || BigInt(0), 18)) : 0
  )

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

    if (data) setUSDCBalance(data[0]?.balance)
  }

  const getUSGfrxUSDBalanceAllowance = async (walletClient: WalletClient) => {
    const data = await getBalancesAndAllowances(walletClient!, USDC_ADDRESS, USGTokens[1]["USG-frxUSD"])

    if (data) setfrxUSDBalance(data[0]?.balance)
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
    setUSDCDepositValue(value)

    // TODO : Call chainview to retrieve QUOTE
    setUSGUSDCDepositValue(value)
  }

  useEffect(() => {
    if (USGUSDCDepositValue !== undefined) {
      const updatedValue = Number(Number(formatUnits(USGUSDCDepositValue || 0n, 6)).toFixed(3))
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
    USDCBalance,
    frxUSDBalance,
    USDCDepositValue,
    handleDepositChange,
    setUSDCDepositValue,
    USGUSDCInnerValue,
    USGfrxUSDInnerValue,
    frxUSDDepositValue,
    setfrxUSDDepositValue,
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
