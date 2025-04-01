import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import RsTan from "../../../../abi/tgusd/RsTan.json"
import { TGUSD_CONTRACT } from "../../tg_usd/tg_usd_repository"
import { Abi, WalletClient } from "viem"

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
