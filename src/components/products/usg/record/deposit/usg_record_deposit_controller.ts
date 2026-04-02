"use client"

import { getBorrowCommonFormState } from "../usg_record_controller"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { BalanceAllowanceData, FormError, FormState, MarketDetailData, USGMarketDepositParams, ZapMarketData } from "../../usg_type"

export function getDepositFormState(
  isTransactionBlockedByPriceImpact: boolean,
  isTransactionBlockedBySlippage: boolean,
  marketData?: MarketDetailData,
  depositWeiValue?: bigint,
  borrowWeiValue?: bigint,
  zapValue?: bigint,
  isZapping?: boolean,
  isDepositAndBorrow?: boolean,
  isWellConnected?: boolean,
  balanceAllowanceData?: BalanceAllowanceData,
  maxBorrowableValue?: bigint,
  isLoading?: boolean
): FormState {
  const errors: FormError[] = []
  const depositValue = depositWeiValue || 0n
  const isApproved = depositValue <= (balanceAllowanceData?.allowances[0]?.allowance || 0n)
  const isEnoughBalance = depositValue < (balanceAllowanceData?.balance || 0n)

  if (!isWellConnected) {
    return {
      canProcess: false,
      errors: [
        {
          key: "no-wallet",
          title: "No connected wallet",
          subtitle: "You need to connect your wallet to proceed.",
          content: "Please connect your wallet to repay.",
          type: null,
        },
      ],
      haveToApprove: false,
    }
  }

  if (depositValue === 0n) {
    return {
      canProcess: false,
      errors,
      haveToApprove: !isApproved,
    }
  } else {
    if (!isEnoughBalance) {
      errors.push({
        key: "balance",
        title: "Insufficient Balance",
        subtitle: "You don't have enough tokens to complete this deposit.",
        content: "Please reduce your deposit amount or acquire more tokens.",
        type: "form-alert",
      })
    }
    if (isTransactionBlockedBySlippage) {
      errors.push({
        key: "slippage",
        title: "Slippage Too High",
        subtitle: "Your slippage tolerance is blocking this transaction.",
        content: "Please lower your slippage to proceed.",
        type: null,
      })
    }
    if (isTransactionBlockedByPriceImpact) {
      errors.push({
        key: "price-impact",
        title: "Price Impact Too High",
        subtitle: "Price Impact Too High",
        content: "Price Impact Too High",
        type: null,
      })
    }
    if (isZapping && !zapValue) {
      errors.push({
        key: "empty-form",
        title: "No Zap Value",
        subtitle: "The zap quote hasn't loaded yet.",
        content: "Please wait for the zap value to be calculated before proceeding.",
        type: "form-alert",
      })
    }

    if (isDepositAndBorrow) {
      if (!borrowWeiValue || borrowWeiValue === 0n) {
        return {
          canProcess: false,
          errors,
          haveToApprove: !isApproved,
        }
      }

      const borrowErrors = getBorrowCommonFormState(marketData, borrowWeiValue)
      errors.push(...borrowErrors)
    }

    if (borrowWeiValue! > maxBorrowableValue!) {
      errors.push({
        key: "max-ltv",
        title: "Loan Exceeds Max LTV",
        subtitle: "Your borrow amount exceeds the maximum loan-to-value ratio.",
        content: "Please reduce your borrow amount to stay within the allowed LTV.",
        type: "form-alert",
      })
    }
  }

  return {
    canProcess: isApproved && errors.length === 0 && !isLoading,
    errors,
    haveToApprove: !isApproved,
  }
}

export async function doMarketDepositAndBorrow(walletClient: WalletClient, args: USGMarketDepositParams) {
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "depositAndBorrow",
    address: args.marketAddress,
    args: [args.depositWeiValue, args.borrowWeiValue, args?.isReceiptIn],
    gas: undefined,
  }
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export async function doMarketDeposit(walletClient: WalletClient, args: USGMarketDepositParams) {
  const [account] = await walletClient.requestAddresses()
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "deposit",
    address: args.marketAddress,
    args: [account, args.depositWeiValue, args?.isReceiptIn],
  }
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export const doZapDepositAndBorrow = async (
  marketAddress: Address,
  walletClient: WalletClient,
  router: string,
  routerCall: string,
  zapMarket: ZapMarketData,
  borrowWeiValue?: bigint
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "zapDepositAndBorrow",
    args: [
      borrowWeiValue,
      {
        tokenIn: zapMarket?.tokenIn,
        amountIn: zapMarket?.amountIn,
        minAmountOut: zapMarket?.minAmountOut,
        zap: { router, routerCall },
      },
    ] as unknown[],
    address: marketAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  if (zapMarket?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    estimateGasData.value = zapMarket?.amountIn
  }

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const doZapDeposit = async (marketAddress: Address, walletClient: WalletClient, router: string, routerCall: string, zapMarket: ZapMarketData) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "zapDeposit",
    args: [
      account,
      {
        tokenIn: zapMarket?.tokenIn,
        amountIn: zapMarket?.amountIn,
        minAmountOut: zapMarket?.minAmountOut,
        zap: { router, routerCall },
      },
    ] as unknown[],
    address: marketAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  if (zapMarket?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    estimateGasData.value = zapMarket?.amountIn
  }

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}
