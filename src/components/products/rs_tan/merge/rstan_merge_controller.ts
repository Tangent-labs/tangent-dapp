import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import RsTan from "../../../../abi/tgusd/RsTan.json"
import { TGUSD_CONTRACT } from "../../tg_usd/tg_usd_repository"
import { Abi, WalletClient } from "viem"
import { LockPosition } from "../../tg_usd/tg_usd_type"

export const doMerge = async (walletClient: WalletClient, tokenIdA: bigint, tokenIdB: bigint) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: "merge",
    args: [tokenIdA, tokenIdB],
    address: TGUSD_CONTRACT.RSTAN,
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
