"use client"

import { FormError, FormState, MarketDetailData } from "../../usg_type"
import { formatBigInt } from "@/lib/number_formatter"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"

export function getLiquidateFormState(
  marketData: MarketDetailData,
  withdrawWeiValue: bigint,
  repayWeiValue: bigint,
  isWellConnected: boolean,
  isLoading: boolean,
  isTransactionBlockedByPriceImpact: boolean,
  isTransactionBlockedBySlippage: boolean,
  isTransactionBlockedByWalletRepay: boolean
): FormState {
  const errors: FormError[] = []

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
  } else {
    if (withdrawWeiValue > marketData?.collateralInfos?.positionCollateralAmount) {
      errors.push({
        key: "max-withdrawable",
        title: "Withdraw Value Too High",
        subtitle: "Your withdrawal exceeds the available collateral.",
        content: "Please reduce your withdrawal amount.",
        type: "form-alert",
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

    if (isTransactionBlockedBySlippage) {
      errors.push({
        key: "slippage",
        title: "Slippage Too High",
        subtitle: "Your slippage tolerance is blocking this transaction.",
        content: "Please lower your slippage to proceed.",
        type: null,
      })
    }

    if (isTransactionBlockedByWalletRepay) {
      errors.push({
        key: "wallet-repay",
        title: "Repayment Uses Wallet USG",
        subtitle: "This repayment will use USG from your wallet.",
        content: "Make sure you have enough USG in your wallet to cover the repayment.",
        type: null,
      })
    }
  }

  const existingDebt = marketData.debtInfos?.userDebt || 0n
  const minimumLoan = marketData.constants?.minimumLoan || 0n

  if (!repayWeiValue && !withdrawWeiValue) {
    return { canProcess: false, errors: [], haveToApprove: false }
  } else if (repayWeiValue && repayWeiValue > existingDebt) {
    errors.push({
      key: "repay-exceeds-debt",
      title: "Repayment Exceeds Debt",
      subtitle: "Your repayment amount is greater than your outstanding debt.",
      content: "Please reduce your repayment amount.",
      type: "form-alert",
    })
  } else if (existingDebt - repayWeiValue! > 0n && existingDebt - repayWeiValue! < minimumLoan) {
    errors.push({
      key: "min-debt",
      title: "Remaining Debt Too Low",
      subtitle: `Remaining debt must be at least ${formatBigInt(minimumLoan, 18, 2)} USG.`,
      content: "Either repay the full debt or leave at least the minimum loan amount.",
      type: "form-alert",
    })
  }

  return { canProcess: errors.length === 0 && !isLoading, errors, haveToApprove: false }
}

export async function doMarketLiquidate(
  collatAmountToLiquidate: bigint,
  usgToRepay: bigint,
  maxUsgToBurn: bigint,
  minUsgOut: bigint,
  isReceiptOut: boolean,
  liquidationData: { routerAddress: string; data: string },
  walletClient: WalletClient,
  market: Address
) {
  const publicClient = getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "selfLiquidate",
    address: market,
    args: [
      { collatAmountToLiquidate, usgToRepay, maxUsgToBurn, minUsgOut, isReceiptOut },
      { router: liquidationData?.routerAddress, routerCall: liquidationData?.data },
    ],
    gas: undefined as undefined | bigint,
    account: walletClient.account,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)

  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}
