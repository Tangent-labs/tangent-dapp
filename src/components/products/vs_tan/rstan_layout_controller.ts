import { Abi, Address, Hex, WalletClient } from "viem"
import LockUI from "../../../abi/tgusd/LockUI.json"
import VsTAN from "../../../abi/tgusd/VsTAN.json"
import { executeChainViewUnique, executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { ListHeaderData } from "@/types"
import { LockData } from "../tg_usd/tg_usd_type"
import { VSTAN_CONTRACT } from "./rs_tan_repository"

export async function getRsTanData(user: Address) {
  return await executeChainViewUnique<LockData>(LockUI.abi as Abi, LockUI.bytecode as Hex, [user, VSTAN_CONTRACT.VSTAN, VSTAN_CONTRACT.TAN])
}

export const lockListHeaders: ListHeaderData[] = [
  { label: "Token ID", key: "id" },
  { label: "vsTan", key: "vsTan" },
  { label: "Claimable", key: "claimable" },
  { label: "Unlock date", key: "unlock_date" },
  { label: "", key: "" },
]

export const doIncreaseLockTime = async (tokenId: bigint, walletClient: WalletClient) => {
  const txData = {
    abi: VsTAN.abi as Abi,
    functionName: "increaseLockTime",
    args: [tokenId],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export const doTogglePermaLock = async (tokenId: bigint, walletClient: WalletClient) => {
  const txData = {
    abi: VsTAN.abi as Abi,
    functionName: "togglePermaLock",
    args: [tokenId],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
