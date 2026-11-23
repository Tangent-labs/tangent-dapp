"use client"

import { Abi, WalletClient } from "viem"
import { FormError, FormState, MarketDetailData, USGMarketWitrhdrawParams } from "../../usg_type"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { dappErrors } from "@/components/design_system/notifications/form-errors"

export function getWithdrawFormState(
  marketData: MarketDetailData,
  withdrawWeiValue: bigint,
  maxWithdrawable: bigint,
  isWellConnected?: boolean,
  withdrawLoading?: boolean
): FormState {
  const errors: FormError[] = []

  if (!isWellConnected) {
    return {
      canProcess: false,
      errors: [dappErrors["no-wallet"]],
      haveToApprove: false,
    }
  }

  if (!marketData) return { canProcess: false, errors: [], haveToApprove: false }

  if (!withdrawWeiValue || withdrawWeiValue === 0n) return { canProcess: false, errors: [], haveToApprove: false }
  else {
    if (withdrawWeiValue > maxWithdrawable) {
      errors.push(dappErrors["max-withdrawable"])
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
