import { executeContractCall, waitForTransaction } from "@/services/service_rpc"
import VsTAN from "../../../../abi/USG/VsTAN.json"
import { Abi, WalletClient } from "viem"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { VSTAN_CONTRACT } from "../rs_tan_repository"

export const doClaim = async (positions: LockPosition[], walletClient: WalletClient, claimAsSUSG: boolean) => {
  const method = positions?.length === 1 ? "claimSimple" : "claimMultiple"

  const params = positions?.length === 1 ? positions?.[0]?.tokenId : positions?.map((el: LockPosition) => el.tokenId)

  const txData = {
    abi: VsTAN.abi as Abi,
    functionName: method,
    args: [params, claimAsSUSG],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
