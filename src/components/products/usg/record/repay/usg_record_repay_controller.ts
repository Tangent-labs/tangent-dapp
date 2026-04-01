"use client"
import { formatBigInt } from "@/lib/number_formatter"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { BalanceAllowanceData, FormError, FormState, MarketDetailData, USGMarketRepayParams, ZapMarketData } from "../../usg_type"

export function getRepayFormState(
  isTransactionBlockedByPriceImpact: boolean,
  isTransactionBlockedBySlippage: boolean,
  marketData?: MarketDetailData,
  repayWeiValue?: bigint,
  isWellConnected?: boolean,
  balanceAllowanceData?: BalanceAllowanceData,
  repayAsset?: string,
  isLoading?: boolean,
  transactionExceedsMaxLtv?: boolean
): FormState {
  const isZapMode = !!repayAsset && !!balanceAllowanceData && repayAsset !== "USG"
  const isApproved = repayAsset === "USG" || (isZapMode && (repayWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n))

  const errors: FormError[] = []

  if (!marketData) return { canProcess: false, errors: [], haveToApprove: false }

  if (!repayWeiValue || repayWeiValue === 0n) return { canProcess: false, errors: [], haveToApprove: false }

  if (!isWellConnected) {
    errors.push({
      key: "no-wallet",
      title: "No Connected Wallet",
      subtitle: "You need to connect your wallet to proceed.",
      content: "Please connect your wallet to repay.",
      type: "form-alert",
    })
  } else {
    if (transactionExceedsMaxLtv) {
      errors.push({
        key: "max-ltv",
        title: "Max LTV Exceeded",
        subtitle: "Your remaining debt amount exceeds the maximum loan-to-value ratio.",
        content: "Please reduce your remaining debt amount to stay within the allowed LTV.",
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

    const existingDebt = marketData.debtInfos?.userDebt || 0n
    const minimumLoan = marketData.constants?.minimumLoan || 0n

    if (repayWeiValue > existingDebt) {
      errors.push({
        key: "repay-exceeds-debt",
        title: "Repayment Exceeds Debt",
        subtitle: "Your repayment amount is greater than your outstanding debt.",
        content: "Please reduce your repayment amount.",
        type: "form-alert",
      })
    } else if (existingDebt - repayWeiValue > 0n && existingDebt - repayWeiValue < minimumLoan) {
      errors.push({
        key: "min-debt",
        title: "Remaining Debt Too Low",
        subtitle: `Remaining debt must be at least ${formatBigInt(minimumLoan, 18, 2)} USG.`,
        content: "Either repay the full debt or leave at least the minimum loan amount.",
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
