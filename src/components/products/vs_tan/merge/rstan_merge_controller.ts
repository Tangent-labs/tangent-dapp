import { Abi, WalletClient } from "viem"
import VsTan from "../../../../abi/USG/VsTAN.json"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { FormError, FormState, LockPosition } from "../../usg/usg_type"
import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { dappErrors } from "@/components/design_system/notifications/dap-errors"

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

export function getMergeFormState(lockPositionOne: LockPosition, lockPositionTwo: LockPosition): FormState {
  const errors: FormError[] = []

  if (lockPositionOne?.tokenId === lockPositionTwo?.tokenId) {
    errors.push(dappErrors["same-position"])
  }

  return { canProcess: errors.length === 0, errors, haveToApprove: false }
}
