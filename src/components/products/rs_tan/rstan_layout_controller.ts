import { Abi, Address, Hex, WalletClient } from "viem"
import LockUI from "../../../abi/tgusd/LockUI.json"
import RsTan from "../../../abi/tgusd/RsTan.json"
import { executeChainViewUnique, executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { TGUSD_CONTRACT } from "../tg_usd/tg_usd_repository"
import { ListHeaderData } from "@/types"
import { LockData } from "../tg_usd/tg_usd_type"

export async function getRsTanData(user: Address) {
  return await executeChainViewUnique<LockData>(LockUI.abi as Abi, LockUI.bytecode as Hex, [user, TGUSD_CONTRACT.RSTAN, TGUSD_CONTRACT.TAN])
}

export const lockListHeaders: ListHeaderData[] = [
  { label: "Token ID", key: "id" },
  { label: "rsTan", key: "rsTan" },
  { label: "Claimable", key: "claimable" },
  { label: "Unlock date", key: "unlock_date" },
  { label: "", key: "" },
]

export const doIncreaseLockTime = async (tokenId: bigint, walletClient: WalletClient) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: "increaseLockTime",
    args: [tokenId],
    address: TGUSD_CONTRACT.RSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export const doTogglePermaLock = async (tokenId: bigint, walletClient: WalletClient) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: "togglePermaLock",
    args: [tokenId],
    address: TGUSD_CONTRACT.RSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
