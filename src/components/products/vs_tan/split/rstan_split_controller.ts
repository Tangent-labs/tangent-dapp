import { executeContractCall, getCurrentBlock, waitForTransaction } from "@/services/service_rpc"
import VsTan from "../../../../abi/USG/VsTAN.json"
import { Abi, WalletClient } from "viem"
import { FormError, FormState, LockPosition } from "../../usg/usg_type"
import { VSTAN_CONTRACT } from "../rs_tan_repository"

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

export async function getSplitFormState(splitPositionInfo: LockPosition, isWellConnected: boolean): Promise<FormState> {
  const errors: FormError[] = []

  const currentBlock = await getCurrentBlock()

  if (!isWellConnected) {
    errors.push({
      key: "no-wallet",
      title: "No Connected Wallet",
      subtitle: "You need to connect your wallet to proceed.",
      content: "Please connect your wallet to split your position.",
      type: "form-alert",
    })
  } else {
    if (!!splitPositionInfo?.endLockTime && currentBlock.timestamp > Number(splitPositionInfo?.endLockTime)) {
      errors.push({
        key: "lock-expired",
        title: "Lock Expired",
        subtitle: "Your lock period has ended.",
        content: "This position can no longer be split as the lock has expired.",
        type: "form-alert",
      })
    }
  }

  return { canProcess: errors.length === 0, errors, haveToApprove: false }
}
