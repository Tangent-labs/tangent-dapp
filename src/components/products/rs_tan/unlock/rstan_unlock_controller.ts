import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import RsTan from "../../../../abi/tgusd/RsTan.json"
import { TGUSD_CONTRACT } from "../../tg_usd/tg_usd_repository"
import { Abi, WalletClient } from "viem"

export const doUnlock = async (tokenId: bigint, walletClient: WalletClient) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: "unlock",
    args: [tokenId],
    address: TGUSD_CONTRACT.RSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
