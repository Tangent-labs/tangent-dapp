"use client"

import { MarketDetailData } from "../../usg_type"
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
  isTransactionBlockedBySlippage: boolean
) {
  const reasons: string[] = []

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (isLoading) {
      reasons.push("Quote loading.")
    } else if (withdrawWeiValue > marketData?.collateralInfos?.positionCollateralAmount) {
      reasons.push("Withdraw value too high.")
    } else if (isTransactionBlockedByPriceImpact) {
      reasons.push("Price impact is too high.")
    } else if (isTransactionBlockedBySlippage) {
      reasons.push("Slippage is too high.")
    }
  }

  const existingDebt = marketData.debtInfos?.userDebt || 0n
  const minimumLoan = marketData.constants?.minimumLoan || 0n

  if (repayWeiValue && repayWeiValue > existingDebt) {
    reasons.push(`Repayment exceeds outstanding debt.`)
  } else if (existingDebt - repayWeiValue! > 0n && existingDebt - repayWeiValue! < minimumLoan) {
    reasons.push(`Remaining debt must be at least ${formatBigInt(minimumLoan, 18, 2)}`)
  }

  return { canProcess: reasons.length === 0 && !isLoading, cantProcessReasons: reasons, haveToApprove: false }
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
