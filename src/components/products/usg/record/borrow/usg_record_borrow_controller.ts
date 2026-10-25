"use client"

import { Abi, WalletClient } from "viem"
import { FormError, FormState, MarketDetailData, USGMarketBorrowParams } from "../../usg_type"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { getBorrowCommonFormState } from "../usg_record_controller"
import { dappErrors } from "@/components/design_system/notifications/form-errors"

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
      errors: [dappErrors["no-wallet"]],

      haveToApprove: false,
    }
  } else {
    if (!borrowWeiValue || borrowWeiValue === 0n) {
      return {
        canProcess: false,
        errors,
        haveToApprove: false,
      }
    }

    const borrowErrors = getBorrowCommonFormState(marketData, borrowWeiValue)
    errors.push(...borrowErrors)
  }

  if (borrowWeiValue! > maxBorrowableValue!) {
    errors.push(dappErrors["max-ltv"])
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
