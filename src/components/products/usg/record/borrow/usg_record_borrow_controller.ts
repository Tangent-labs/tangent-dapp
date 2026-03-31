"use client"

import { Abi, WalletClient } from "viem"
import { MarketDetailData, USGMarketBorrowParams } from "../../usg_type"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { getBorrowCommonFormState, NO_CONNECTED_WALLET } from "../usg_record_controller"

export function getBorrowFormState(
  marketData?: MarketDetailData,
  borrowWeiValue?: bigint,
  isWellConnected?: boolean,
  maxBorrowableValue?: bigint,
  isLoading?: boolean
) {
  const reasons: string[] = []

  if (!isWellConnected) {
    reasons.push(NO_CONNECTED_WALLET)
  } else {
    const borrowReasons = getBorrowCommonFormState(marketData, borrowWeiValue)
    reasons.push(...borrowReasons)
  }

  if (borrowWeiValue! > maxBorrowableValue!) {
    reasons.push("Loan exceeds max LTV")
  }

  return { canProcess: reasons.length === 0 && !isLoading, cantProcessReasons: reasons, haveToApprove: false }
}

export async function doMarketBorrow(walletClient: WalletClient, args: USGMarketBorrowParams) {
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
