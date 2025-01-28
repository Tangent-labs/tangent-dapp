import { Abi, WalletClient } from "viem"
import { MarketDetailData, TgUsdtMarketBorrowParams } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { getBorrowCommonFormState } from "../tg_usd_record_controller"

export function getBorrowFormState(marketData?: MarketDetailData, borrowWeiValue?: bigint, isWellConnected?: boolean) {
  const reasons: string[] = []
  // check the wallet
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    const borrowReasons = getBorrowCommonFormState(marketData, 0n, borrowWeiValue)
    reasons.push(...borrowReasons)
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}

export async function doMarketBorrow(walletClient: WalletClient, args: TgUsdtMarketBorrowParams) {
  const [account] = await walletClient.requestAddresses()
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "borrow",
    address: args.marketAddress,
    args: [account, args.borrowWeiValue],
    gas: undefined as undefined | bigint,
  }
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
