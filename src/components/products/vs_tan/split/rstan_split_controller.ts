import { executeContractCall, getCurrentBlock, waitForTransaction } from "@/services/service_rpc"
import VsTan from "../../../../abi/USG/VsTAN.json"
import { Abi, WalletClient } from "viem"
import { FormError, FormState, LockPosition } from "../../usg/usg_type"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { dappErrors } from "@/components/design_system/notifications/dap-errors"

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
    errors.push(dappErrors["no-wallet"])
  } else {
    if (!!splitPositionInfo?.endLockTime && currentBlock.timestamp > Number(splitPositionInfo?.endLockTime)) {
      errors.push(dappErrors["lock-expired"])
    }
  }

  return { canProcess: errors.length === 0, errors, haveToApprove: false }
}
