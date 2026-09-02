"use client"

import { getBorrowCommonFormState } from "../usg_record_controller"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { BalanceAllowanceData, FormError, FormState, MarketDetailData, USGMarketDepositParams, ZapMarketData } from "../../usg_type"
import { dappErrors } from "@/components/design_system/notifications/form-errors"
import { NATIVE_ETH_ADDRESS } from "@/data/erc20s"

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
  const isEnoughBalance = depositValue <= (balanceAllowanceData?.balance || 0n)

  if (!isWellConnected) {
    return {
      canProcess: false,
      errors: [dappErrors["no-wallet"]],
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
      errors.push(dappErrors["balance"])
    }
    if (isTransactionBlockedBySlippage) {
      errors.push(dappErrors["slippage"])
    }
    if (isTransactionBlockedByPriceImpact) {
      errors.push(dappErrors["price-impact"])
    }
    if (isZapping && !isLoading && !zapValue) {
      errors.push(dappErrors["no-zap-value"])
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
      errors.push(dappErrors["max-ltv"])
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

  if (zapMarket?.tokenIn === NATIVE_ETH_ADDRESS) {
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

  if (zapMarket?.tokenIn === NATIVE_ETH_ADDRESS) {
    estimateGasData.value = zapMarket?.amountIn
  }

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}
