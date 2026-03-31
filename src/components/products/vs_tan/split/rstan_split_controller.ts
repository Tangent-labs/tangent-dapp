import { executeContractCall, getCurrentBlock, waitForTransaction } from "@/services/service_rpc"
import VsTan from "../../../../abi/USG/VsTAN.json"
import { Abi, WalletClient } from "viem"
import { LockPosition } from "../../usg/usg_type"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { NO_CONNECTED_WALLET } from "../../usg/record/usg_record_controller"

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

export async function getSplitFormState(splitPositionInfo: LockPosition, isWellConnected: boolean) {
  const reasons: string[] = []

  const currentBlock = await getCurrentBlock()

  if (!isWellConnected) {
    reasons.push(NO_CONNECTED_WALLET)
  } else {
    if (!!splitPositionInfo?.endLockTime && currentBlock.timestamp > Number(splitPositionInfo?.endLockTime)) {
      reasons.push("Lock expired.")
    }
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}
