import { Abi, WalletClient } from "viem"
import { MarketDetailData, TgUsdtMarketWitrhdrawParams } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { AssetDataPriced } from "@/types"
import { getComputedFutureLoanData } from "../tg_usd_record_controller"

export function getWithdrawFormState(marketData?: MarketDetailData, withdrawWeiValue?: bigint, collateralInfo?: AssetDataPriced, isWellConnected?: boolean) {
  const reasons: string[] = []

  if (!marketData) return { canProcess: false, cantProcessReasons: ["No market data"], haveToApprove: false }
  // check the wallet
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (withdrawWeiValue === 0n || !withdrawWeiValue) {
      reasons.push("Amount must be greater than zero.")
    }

    if (reasons.length === 0) {
      const futurLoanData = getComputedFutureLoanData(marketData, collateralInfo, { withdrawWeiValue })
      if (Number(futurLoanData.health) < 1) reasons.push("Loan health is too low.")
    }
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
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
