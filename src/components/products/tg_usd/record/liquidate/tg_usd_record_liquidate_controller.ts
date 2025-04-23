import { Abi, Address, WalletClient } from "viem"
import { MarketDetailData } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { executeContractCall } from "@/services/service_rpc"

export function getLiquidateFormState(marketData?: MarketDetailData, withdrawWeiValue?: bigint, isWellConnected?: boolean) {
  const reasons: string[] = []

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}

export async function doMarketLiquidate(
  walletClient: WalletClient,
  market: Address,
  address: Address,
  repayWeiValue: bigint,
  tgUSDReceivedValue: bigint,
  routerCall: string
) {
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "selfLiquidate",
    address: market,
    args: [address, repayWeiValue, address, tgUSDReceivedValue, routerCall], // uint256 tgUSDToRepay, address liquidator, bytes calldata routerCall
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}
