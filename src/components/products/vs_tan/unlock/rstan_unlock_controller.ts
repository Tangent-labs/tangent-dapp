import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import RsTan from "../../../../abi/tgusd/RsTan.json"
import { Abi, WalletClient } from "viem"
import { VSTAN_CONTRACT } from "../rs_tan_repository"

export const doUnlock = async (tokenId: bigint, walletClient: WalletClient, method: string, claimAsSUSG: boolean) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: method,
    args: [tokenId, claimAsSUSG],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
