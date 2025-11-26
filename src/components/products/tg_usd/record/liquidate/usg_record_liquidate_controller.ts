import { Abi, Address, WalletClient } from "viem"
import { MarketDetailData } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall } from "@/services/service_rpc"
import { formatBigInt } from "@/lib/number_formatter"

export function getLiquidateFormState(
  marketData: MarketDetailData,
  withdrawWeiValue: bigint,
  repayWeiValue: bigint,
  isWellConnected: boolean,
  isQuoteLoading: boolean
) {
  const reasons: string[] = []

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (isQuoteLoading) {
      reasons.push("Quote loading.")
    } else if (withdrawWeiValue > marketData?.collateralInfos?.positionCollateralAmount) {
      reasons.push("Withdraw value too high.")
    }
  }

  const existingDebt = marketData.debtInfos?.userDebt || 0n
  const minimumLoan = marketData.constants?.minimumLoan || 0n

  if (repayWeiValue && repayWeiValue > existingDebt) {
    reasons.push(`Repayment exceeds outstanding debt.`)
  } else if (existingDebt - repayWeiValue! > 0n && existingDebt - repayWeiValue! < minimumLoan) {
    reasons.push(`Remaining debt must be at least ${formatBigInt(minimumLoan, 18, 2)}`)
  }

  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}

export async function doMarketLiquidate(
  collatAmountToLiquidate: bigint,
  USGToRepay: bigint,
  minUSGOut: bigint,
  maxUSGToBurn: bigint,
  liquidationData: { routerAddress: string; data: string },
  walletClient: WalletClient,
  market: Address
) {
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "selfLiquidate",
    address: market,
    args: [collatAmountToLiquidate, USGToRepay, maxUSGToBurn, minUSGOut, { router: liquidationData?.routerAddress, routerCall: liquidationData?.data }],
    gas: undefined as undefined | bigint,
  }

  return await executeContractCall(walletClient, txData)
}
