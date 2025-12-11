import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import VsTan from "../../../../abi/USG/VsTAN.json"
import { Abi, WalletClient } from "viem"
import { LockPosition } from "../../usg/usg_type"
import { VSTAN_CONTRACT } from "../rs_tan_repository"

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

export function getMergeFormState(lockPositionOne: LockPosition, lockPositionTwo: LockPosition) {
  const reasons: string[] = []

  if (lockPositionOne?.tokenId === lockPositionTwo?.tokenId) {
    reasons.push("You cant merge a position with itself.")
  }

  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}
