import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import VsTan from "../../../../abi/USG/VsTAN.json"
import { Abi, WalletClient } from "viem"
import { FormError, FormState, LockPosition } from "../../usg/usg_type"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { dappErrors } from "@/components/design_system/notifications/dap-errors"
import { isExpired } from "../rstan_layout_controller"
import { formatBigInt } from "@/lib/number_formatter"

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
  amountToRemove: bigint,
  minLock: bigint | undefined,
  chainTimestamp: bigint | undefined,
  isWellConnected: boolean
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

  // split() enforces the minimum on BOTH resulting positions, so a position below twice the
  // minimum cannot be split at any ratio
  if (!!minLock) {
    const remaining = splitPositionInfo.amount - amountToRemove

    if (splitPositionInfo.amount < minLock * 2n) {
      errors.push({
        ...dappErrors["min-lock"],
        subtitle: `This position holds ${formatBigInt(splitPositionInfo.amount, 18, 2)} TAN. Splitting requires at least ${formatBigInt(minLock * 2n, 18, 2)}.`,
      })
    } else if (amountToRemove < minLock || remaining < minLock) {
      errors.push({ ...dappErrors["min-lock"], subtitle: `Each of the two positions must keep at least ${formatBigInt(minLock, 18, 2)} TAN.` })
    }
  }

  return { canProcess: errors.length === 0, errors, haveToApprove: false }
}
