"use client"

import { PredepositRawState, PredepositStatus } from "./types/types"
import PredepositPoolsABI from "../../../abi/USG/PredepositPoolsABI.json"
import { getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"

export const TOTAL_TAN_ALLOCATION = 200_000n
export const TOTAL_DEPOSIT_CAP = 10_000_000n

export const getFormState = (
  isLoading: boolean,
  isTxBlockedBySlippage: boolean,
  depositValue: bigint | undefined,
  quotedValue: bigint | undefined,
  balanceAllowance: {
    balance: bigint
    allowance: bigint
  },
  totalCap: bigint,
  currentlyDeposited: bigint
) => {
  const reasons: string[] = []

  const isApproved = (depositValue || 0n) <= (balanceAllowance?.allowance || 0n)

  if (!depositValue || depositValue === 0n) {
    return { canProcess: false, cantProcessReasons: reasons, haveToApprove: false }
  }

  if (!!quotedValue && quotedValue < (99n * depositValue) / 100n) {
    reasons.push("Price impact too high. Wait for Peg Keepers to take action and try again later.")
  } else if (!!depositValue && depositValue > balanceAllowance?.balance) {
    reasons.push("Your balance is too low.")
  } else if (currentlyDeposited + depositValue > totalCap) {
    reasons.push("Deposit exceeds total cap.")
  } else if (isTxBlockedBySlippage) {
    reasons.push("Slippage too high.")
  }

  return { canProcess: reasons.length === 0 && !isLoading, cantProcessReasons: reasons, haveToApprove: !isApproved }
}

export const fetchQuote = async (depositValue: bigint, contract: Address) => {
  const publicClient = getPublicClient()

  const txData = {
    abi: PredepositPoolsABI.abi as Abi,
    functionName: "calc_token_amount",
    args: [[depositValue, 0n], true],
    address: contract,
  }

  const previewCustomeQuote = await publicClient.readContract(txData)

  return previewCustomeQuote as bigint
}

export const deposit = async (walletClient: WalletClient, amount: bigint, minOut: bigint, contract: Address) => {
  const publicClient = getPublicClient()
  const [account] = await walletClient.requestAddresses()

  const estimateGasData = {
    abi: PredepositPoolsABI.abi as Abi,
    functionName: "add_liquidity",
    args: [[amount, 0n], minOut],
    address: contract,
    account,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const mapPredepositStatus = (status: PredepositRawState): PredepositStatus => {
  const predepositStatus = {
    predepositState: status?.predepositState,
    userState: status?.userState,
    isSigned: status?.isSigned,

    USGUSDCData: {
      USGUSDCAccumulatedBalance: BigInt(status?.lpData[0]?.accumulatedBalance),
      USGUSDCAccumulatedTotal: BigInt(status?.lpData[0]?.accumulatedTotal),
      USGUSDCCap: BigInt(status?.lpData[0]?.cap),
      lpName: status?.lpData[0]?.lpName,
      name: status?.lpData[0]?.otherStable?.name,
      address: status?.lpData[0]?.otherStable?.address as Address,
      decimals: status?.lpData[0]?.otherStable?.decimals,
    },

    USGfrxUSDData: {
      USGfrxUSDAccumulatedBalance: BigInt(status?.lpData[1]?.accumulatedBalance),
      USGfrxUSDAccumulatedTotal: BigInt(status?.lpData[1]?.accumulatedTotal),
      USGfrxUSDCap: BigInt(status?.lpData[1]?.cap),
      lpName: status?.lpData[1]?.lpName,
      name: status?.lpData[1]?.otherStable?.name,
      address: status?.lpData[1]?.otherStable?.address as Address,
      decimals: status?.lpData[1]?.otherStable?.decimals,
    },
  }

  return predepositStatus
}

export const formatTimeNumber = (num: number) => num.toString().padStart(2, "0")
