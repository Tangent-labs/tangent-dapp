import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import RsTan from "../../../../abi/tgusd/RsTanService.json"
import { Abi, WalletClient } from "viem"
import { RSTAN_CONTRACT } from "../rs_tan_repository"

export const doUnlock = async (tokenId: bigint, walletClient: WalletClient, method: string) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: method,
    args: [tokenId],
    address: RSTAN_CONTRACT.RSTAN_SERVICE,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
