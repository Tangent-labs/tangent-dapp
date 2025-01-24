import { Abi, WalletClient } from "viem"
import { MarketDetailData, TgUsdtMarketWitrhdrawParams } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { executeContractCall } from "@/services/service_rpc"

export function getWithdrawFormState(marketData?: MarketDetailData, withdrawWeiValue?: bigint, isWellConnected?: boolean) {
  const reasons: string[] = []
  // check the wallet
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}

export async function doMarketWithdraw(walletClient: WalletClient, args: TgUsdtMarketWitrhdrawParams) {
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "withdraw",
    address: args.marketAddress,
    args: [args.withdrawWeiValue],
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}
