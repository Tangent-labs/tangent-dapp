import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import VsTan from "../../../../abi/USG/VsTAN.json"
import { Abi, WalletClient } from "viem"
import { FormError, FormState, LockPosition } from "../../usg/usg_type"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { dappErrors } from "@/components/design_system/notifications/form-errors"
import { isExpired } from "../rstan_layout_controller"

export const doSplit = async (tokenId: bigint, walletClient: WalletClient, amountToRemove: bigint) => {
  const txData = {
    abi: VsTan.abi as Abi,
    functionName: "split",
    args: [tokenId, amountToRemove],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export function getSplitFormState(
  splitPositionInfo: LockPosition | undefined,
  chainTimestamp: bigint | undefined,
  isWellConnected: boolean,
  amountExceedsPosition: boolean
): FormState {
  const errors: FormError[] = []

  if (!isWellConnected) {
    return { canProcess: false, errors: [dappErrors["no-wallet"]], haveToApprove: false }
  }

  // Nothing picked yet : not an error to show the user, just nothing to process
  if (!splitPositionInfo || !splitPositionInfo.tokenId) {
    return { canProcess: false, errors: [], haveToApprove: false }
  }

  if (isExpired(splitPositionInfo, chainTimestamp)) {
    errors.push(dappErrors["lock-expired"])
  }

  if (amountExceedsPosition) {
    errors.push(dappErrors["split-exceeds-position"])
  }

  return { canProcess: errors.length === 0, errors, haveToApprove: false }
}
