import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import RsTan from "../../../../abi/tgusd/RsTan.json"
import { Abi, WalletClient } from "viem"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { RSTAN_CONTRACT } from "../rs_tan_repository"

export const doClaim = async (positions: LockPosition[], walletClient: WalletClient, claimAsSgUSD: boolean) => {
  const method = positions?.length === 1 ? "claimSimple" : "claimMultiple"

  const params = positions?.length === 1 ? positions?.[0]?.tokenId : positions?.map((el: LockPosition) => el.tokenId)

  const txData = {
    abi: RsTan.abi as Abi,
    functionName: method,
    args: [params, claimAsSgUSD],
    address: RSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
