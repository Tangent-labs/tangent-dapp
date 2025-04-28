import { Abi, WalletClient } from "viem"
import { MarketDetailData, TgUsdtMarketRepayParams } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { formatBigInt } from "@/lib/number_formatter"

export function getRepayFormState(marketData?: MarketDetailData, repayWeiValue?: bigint, isWellConnected?: boolean) {
  const reasons: string[] = []
  if (!marketData) return { canProcess: false, cantProcessReasons: ["No market data"], haveToApprove: false }

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (repayWeiValue === 0n || !repayWeiValue) {
      reasons.push("Amount must be greater than zero.")
    }

    if (reasons.length === 0) {
      const existingDebt = marketData.debtInfos?.userDebt || 0n
      const minimumLoan = marketData.constants?.minimumLoan || 0n
      if (repayWeiValue && repayWeiValue > existingDebt) {
        reasons.push(`Repayment exceeds outstanding debt.`)
      } else if (existingDebt - repayWeiValue! > 0n && existingDebt - repayWeiValue! < minimumLoan) {
        reasons.push(`Remaining debt must be at least ${formatBigInt(minimumLoan, 18, 2)}`)
      }
    }
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}

export async function doMarketRepay(walletClient: WalletClient, args: TgUsdtMarketRepayParams) {
  const [account] = await walletClient.requestAddresses()

  const params = !!args.withdrawWeiValue ? [args.withdrawWeiValue, args.repayWeiValue] : [account, args.repayWeiValue]
  const method = !!args.withdrawWeiValue ? "repayAndWithdraw" : "repay"

  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: method,
    address: args.marketAddress,
    args: params,
    gas: undefined as undefined | bigint,
  }
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
