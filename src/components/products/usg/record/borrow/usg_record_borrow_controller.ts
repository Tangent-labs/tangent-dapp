"use client"

import { Abi, WalletClient } from "viem"
import { FormError, FormState, MarketDetailData, USGMarketBorrowParams } from "../../usg_type"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { getBorrowCommonFormState } from "../usg_record_controller"

export function getBorrowFormState(
  marketData?: MarketDetailData,
  borrowWeiValue?: bigint,
  isWellConnected?: boolean,
  maxBorrowableValue?: bigint,
  isLoading?: boolean
): FormState {
  const errors: FormError[] = []

  if (!isWellConnected) {
    return {
      canProcess: false,
      errors: [
        {
          key: "no-wallet",
          title: "No connected wallet",
          subtitle: "You need to connect your wallet to proceed.",
          content: "Please connect your wallet to repay.",
          type: null,
        },
      ],
      haveToApprove: false,
    }
  } else {
    if (!borrowWeiValue || borrowWeiValue === 0n) {
      return {
        canProcess: false,
        errors,
        haveToApprove: true,
      }
    }

    const borrowErrors = getBorrowCommonFormState(marketData, borrowWeiValue)
    errors.push(...borrowErrors)
  }

  if (borrowWeiValue! > maxBorrowableValue!) {
    errors.push({
      key: "max-ltv",
      title: "Loan Exceeds Max LTV",
      subtitle: "Your borrow amount exceeds the maximum loan-to-value ratio.",
      content: "Please reduce your borrow amount to stay within the allowed LTV.",
      type: "form-alert",
    })
  }

  return { canProcess: errors.length === 0 && !isLoading, errors, haveToApprove: false }
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
