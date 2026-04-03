"use client"

import { FormError, FormState, MarketDetailData } from "../../usg_type"
import { formatBigInt } from "@/lib/number_formatter"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { dappErrors } from "@/components/design_system/notifications/dap-errors"

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
      errors: [dappErrors["no-wallet"]],
      haveToApprove: false,
    }
  } else {
    if (withdrawWeiValue > marketData?.collateralInfos?.positionCollateralAmount) {
      errors.push(dappErrors["max-withdrawable"])
    }

    if (isTransactionBlockedByPriceImpact) {
      errors.push(dappErrors["price-impact"])
    }

    if (isTransactionBlockedBySlippage) {
      errors.push(dappErrors["slippage"])
    }

    if (isTransactionBlockedByWalletRepay) {
      errors.push(dappErrors["wallet-repay"])
    }
  }

  const existingDebt = marketData.debtInfos?.userDebt || 0n
  const minimumLoan = marketData.constants?.minimumLoan || 0n

  if (!repayWeiValue && !withdrawWeiValue) {
    return { canProcess: false, errors: [], haveToApprove: false }
  } else if (repayWeiValue && repayWeiValue > existingDebt) {
    errors.push(dappErrors["repay-exceeds-debt"])
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
