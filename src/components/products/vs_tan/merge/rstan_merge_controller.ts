import { Abi, WalletClient } from "viem"
import VsTan from "../../../../abi/USG/VsTAN.json"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { FormError, FormState, LockPosition } from "../../usg/usg_type"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { dappErrors } from "@/components/design_system/notifications/dap-errors"
import { isExpired } from "../rstan_layout_controller"

export const doMerge = async (walletClient: WalletClient, tokenIdA: bigint, tokenIdB: bigint, claimAsSUSG: boolean) => {
  const txData = {
    abi: VsTan.abi as Abi,
    functionName: "merge",
    args: [tokenIdA, tokenIdB, claimAsSUSG],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export function getMergeFormState(
  lockPositionOne: LockPosition | undefined,
  lockPositionTwo: LockPosition | undefined,
  chainTimestamp: bigint | undefined,
  isWellConnected: boolean
): FormState {
  const errors: FormError[] = []

  if (!isWellConnected) {
    return { canProcess: false, errors: [dappErrors["no-wallet"]], haveToApprove: false }
  }

  // Both sides are needed before anything can be said
  if (!lockPositionOne?.tokenId || !lockPositionTwo?.tokenId) {
    return { canProcess: false, errors: [], haveToApprove: false }
  }

  if (lockPositionOne?.tokenId === lockPositionTwo?.tokenId) {
    errors.push(dappErrors["same-position"])
  }

  // merge() reverts if either side has already unlocked
  if (isExpired(lockPositionOne, chainTimestamp) || isExpired(lockPositionTwo, chainTimestamp)) {
    errors.push(dappErrors["lock-expired"])
  }

  return { canProcess: errors.length === 0, errors, haveToApprove: false }
}
