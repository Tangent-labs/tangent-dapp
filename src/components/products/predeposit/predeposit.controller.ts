"use client"

import { FormError, FormState } from "../usg/usg_type"
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
  balanceAllowance: { balance: bigint; allowance: bigint },
  totalCap: bigint,
  currentlyDeposited: bigint
): FormState => {
  const errors: FormError[] = []

  if (!depositValue || depositValue === 0n) {
    return { canProcess: false, errors: [], haveToApprove: false }
  }

  const isApproved = depositValue <= (balanceAllowance?.allowance || 0n)

  if (!!quotedValue && quotedValue < (99n * depositValue) / 100n) {
    errors.push({
      key: "price-impact",
      title: "High Price Impact",
      subtitle: "The quoted value deviates significantly from your deposit.",
      content: "Price impact too high. Wait for Peg Keepers to take action and try again later.",
      type: "form-alert",
    })
  }

  if (depositValue > balanceAllowance?.balance) {
    errors.push({
      key: "balance",
      title: "Insufficient Balance",
      subtitle: "You don't have enough tokens to complete this deposit.",
      content: "Please reduce your deposit amount or acquire more tokens.",
      type: "form-alert",
    })
  }

  if (currentlyDeposited + depositValue > totalCap) {
    errors.push({
      key: "cap-exceeded",
      title: "Deposit Cap Reached",
      subtitle: "This deposit would exceed the maximum allowed amount.",
      content: "The pool has reached its capacity. Please reduce your deposit amount.",
      type: "form-alert",
    })
  }

  if (isTxBlockedBySlippage) {
    errors.push({
      key: "slippage",
      title: "Slippage Too High",
      subtitle: "Your slippage tolerance is blocking this transaction.",
      content: "Please lower your slippage to proceed.",
      type: null,
    })
  }

  return {
    canProcess: errors.length === 0 && !isLoading,
    errors,
    haveToApprove: !isApproved,
  }
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
