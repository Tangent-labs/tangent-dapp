"use client"
import { formatBigInt } from "@/lib/number_formatter"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { BalanceAllowanceData, FormError, FormState, MarketDetailData, USGMarketRepayParams, ZapMarketData } from "../../usg_type"
import { dappErrors } from "@/components/design_system/notifications/dap-errors"

export function getRepayFormState(
  isTransactionBlockedByPriceImpact: boolean,
  isTransactionBlockedBySlippage: boolean,
  marketData?: MarketDetailData,
  repayWeiValue?: bigint,
  isWellConnected?: boolean,
  balanceAllowanceData?: BalanceAllowanceData,
  repayAsset?: string,
  isLoading?: boolean,
  transactionExceedsMaxLtv?: boolean,
  expectedUSGOut?: bigint
): FormState {
  const isZapMode = !!repayAsset && !!balanceAllowanceData && repayAsset !== "USG"
  const isApproved = repayAsset === "USG" || (isZapMode && (repayWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n))

  const errors: FormError[] = []

  if (!isWellConnected) {
    return {
      canProcess: false,
      errors: [dappErrors["no-wallet"]],
      haveToApprove: false,
    }
  }

  if (!repayWeiValue || repayWeiValue === 0n) return { canProcess: false, errors: [], haveToApprove: false }
  else {
    if (transactionExceedsMaxLtv) {
      errors.push(dappErrors["max-ltv"])
    }

    if (isTransactionBlockedBySlippage) {
      errors.push(dappErrors["slippage"])
    }
    if (isTransactionBlockedByPriceImpact) {
      errors.push(dappErrors["price-impact"])
    }

    if (isZapMode && repayWeiValue && !isLoading && !expectedUSGOut) {
      errors.push(dappErrors["no-zap-value"])
    }

    if (marketData && repayWeiValue) {
      const existingDebt = marketData.debtInfos?.userDebt || 0n
      const minimumLoan = marketData.constants?.minimumLoan || 0n

      const formHasMinDebtError =
        (existingDebt - repayWeiValue > 0n && existingDebt - repayWeiValue < minimumLoan) ||
        (isZapMode && existingDebt - (expectedUSGOut || 0n) > 0n && existingDebt - (expectedUSGOut || 0n) < minimumLoan)

      if (repayWeiValue > existingDebt) {
        errors.push(dappErrors["repay-exceeds-debt"])
      } else if (formHasMinDebtError) {
        errors.push({
          key: "min-debt",
          title: "Remaining Debt Too Low",
          subtitle: `Remaining debt must be at least ${formatBigInt(minimumLoan, 18, 2)} USG.`,
          content: "Either repay the full debt or leave at least the minimum loan amount.",
          type: "form-alert",
        })
      }
    }
  }

  return {
    canProcess: isApproved && errors.length === 0 && !isLoading,
    errors,
    haveToApprove: !isApproved,
  }
}

export async function doRepay(walletClient: WalletClient, args: USGMarketRepayParams) {
  const [account] = await walletClient.requestAddresses()

  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "repay",
    address: args.marketAddress,
    args: [account, args.repayWeiValue],
    gas: undefined as undefined | bigint,
    walletClient: walletClient,
  }
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export async function doRepayAndWithdraw(walletClient: WalletClient, args: USGMarketRepayParams) {
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "repayAndWithdraw",
    address: args.marketAddress,
    args: [args.withdrawWeiValue, args.repayWeiValue, args.isReceiptOut],
    gas: undefined as undefined | bigint,
    walletClient: walletClient,
  }
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export const doZapRepayAndWithdraw = async (
  marketAddress: Address,
  walletClient: WalletClient,
  withdrawWeiValue: bigint,
  isReceiptOut: boolean,
  repayData: { routerAddress: string; data: string },
  zapMarket: ZapMarketData
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "zapRepayAndWithdraw",
    args: [
      withdrawWeiValue,
      isReceiptOut,
      {
        tokenIn: zapMarket?.tokenIn,
        amountIn: zapMarket?.amountIn,
        minAmountOut: zapMarket?.minAmountOut,
        zap: { router: repayData?.routerAddress, routerCall: repayData?.data },
      },
    ] as unknown[],
    address: marketAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const doZapRepay = async (
  marketAddress: Address,
  walletClient: WalletClient,
  repayData: { routerAddress: string; data: string },
  zapMarket: ZapMarketData
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "zapRepay",
    args: [
      account,
      {
        tokenIn: zapMarket?.tokenIn,
        amountIn: zapMarket?.amountIn,
        minAmountOut: zapMarket?.minAmountOut,
        zap: { router: repayData?.routerAddress, routerCall: repayData?.data },
      },
    ] as unknown[],
    address: marketAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}
