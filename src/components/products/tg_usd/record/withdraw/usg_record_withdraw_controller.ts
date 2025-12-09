import { Abi, WalletClient } from "viem"
import { MarketDetailData, USGMarketWitrhdrawParams } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"

export function getWithdrawFormState(marketData: MarketDetailData, withdrawWeiValue: bigint, maxWithdrawable: bigint, isWellConnected?: boolean) {
  const reasons: string[] = []

  if (!marketData) return { canProcess: false, cantProcessReasons: ["No market data"], haveToApprove: false }

  if (!isWellConnected) {
    reasons.push("No connected wallet")
  } else {
    if (withdrawWeiValue === 0n || !withdrawWeiValue) {
      reasons.push("Amount must be greater than zero")
    }
    if (maxWithdrawable < withdrawWeiValue) {
      reasons.push("Value is greater than max withdrawable")
    }
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}

export async function doMarketWithdraw(walletClient: WalletClient, args: USGMarketWitrhdrawParams) {
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "withdraw",
    address: args.marketAddress,
    args: [args.withdrawWeiValue, args?.isReceiptOut],
    gas: undefined as undefined | bigint,
  }
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
