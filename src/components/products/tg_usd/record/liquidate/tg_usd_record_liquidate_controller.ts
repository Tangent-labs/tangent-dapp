import { Abi, WalletClient, zeroAddress } from "viem"
import { MarketDetailData, TgUsdtMarketLiquidateParams } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { executeContractCall } from "@/services/service_rpc"

export function getLiquidateFormState(marketData?: MarketDetailData, withdrawWeiValue?: bigint, isWellConnected?: boolean) {
  const reasons: string[] = ["not implemented"]
  // check the wallet
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}

export async function doMarketLiquidate(walletClient: WalletClient, args: TgUsdtMarketLiquidateParams) {
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "selfLiquidate",
    address: args.marketAddress,
    args: [args.liquidateWeiValue, zeroAddress, null], // uint256 tgUSDToRepay, address liquidator, bytes calldata routerCall
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}
