import { executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import RsTan from "../../../../abi/tgusd/RsTan.json"
import { Abi, WalletClient } from "viem"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { RSTAN_CONTRACT } from "../rs_tan_repository"

export const doSplit = async (tokenId: bigint, walletClient: WalletClient, amountToRemove: bigint) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: "split",
    args: [tokenId, amountToRemove],
    address: RSTAN_CONTRACT.RSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export async function getSplitFormState(splitPositionInfo: LockPosition, isWellConnected: boolean) {
  const reasons: string[] = []

  const publicClient = await getPublicClient()
  const currentBlockNumber = await publicClient.getBlockNumber()
  const block = await publicClient.getBlock({ blockNumber: currentBlockNumber })

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (!!splitPositionInfo?.endLockTime && block.timestamp > Number(splitPositionInfo?.endLockTime)) {
      reasons.push("Lock expired.")
    }
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: false }
}
