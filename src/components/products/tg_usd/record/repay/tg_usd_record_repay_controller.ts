import { Abi, WalletClient, zeroAddress } from "viem"
import { MarketDetailData, TgUsdtMarketRepayParams } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { executeContractCall } from "@/services/service_rpc"

export function getFormState(marketData?: MarketDetailData, repayWeiValue?: bigint, isWellConnected?: boolean) {
  const reasons: string[] = []
  // check the wallet
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    //TODO
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}

export async function doMarketRepay(walletClient: WalletClient, args: TgUsdtMarketRepayParams) {
  const [account] = await walletClient.requestAddresses()
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "repay",
    address: args.marketAddress,
    args: [account, args.repayWeiValue, zeroAddress],
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}
