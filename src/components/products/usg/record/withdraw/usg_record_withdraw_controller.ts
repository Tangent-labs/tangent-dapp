"use client"

import { Abi, WalletClient } from "viem"
import { FormError, FormState, MarketDetailData, USGMarketWitrhdrawParams } from "../../usg_type"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"

export function getWithdrawFormState(
  marketData: MarketDetailData,
  withdrawWeiValue: bigint,
  maxWithdrawable: bigint,
  isWellConnected?: boolean,
  withdrawLoading?: boolean
): FormState {
  const errors: FormError[] = []

  if (!marketData) return { canProcess: false, errors: [], haveToApprove: false }

  if (!withdrawWeiValue || withdrawWeiValue === 0n) return { canProcess: false, errors: [], haveToApprove: false }

  if (!isWellConnected) {
    errors.push({
      key: "no-wallet",
      title: "No Connected Wallet",
      subtitle: "You need to connect your wallet to proceed.",
      content: "Please connect your wallet to withdraw.",
      type: "form-alert",
    })
  } else {
    if (withdrawWeiValue > maxWithdrawable) {
      errors.push({
        key: "max-withdrawable",
        title: "Amount Exceeds Maximum",
        subtitle: "Your withdrawal amount is greater than the maximum withdrawable.",
        content: "Please reduce your withdrawal amount.",
        type: "form-alert",
      })
    }
  }

  return { canProcess: errors.length === 0 && !withdrawLoading, errors, haveToApprove: false }
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
