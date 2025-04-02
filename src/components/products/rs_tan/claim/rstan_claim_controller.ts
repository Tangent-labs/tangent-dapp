import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import RsTan from "../../../../abi/tgusd/RsTan.json"
import { TGUSD_CONTRACT } from "../../tg_usd/tg_usd_repository"
import { Abi, WalletClient } from "viem"
import { LockPosition } from "../../tg_usd/tg_usd_type"

export const doClaim = async (positions: LockPosition[], walletClient: WalletClient) => {
  const method = positions?.length === 1 ? "claimSimple" : "claimMultiple"

  const params = positions?.length === 1 ? positions?.[0]?.tokenId : positions?.map((el: LockPosition) => el.tokenId)

  const txData = {
    abi: RsTan.abi as Abi,
    functionName: method,
    args: [params],
    address: TGUSD_CONTRACT.RSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
