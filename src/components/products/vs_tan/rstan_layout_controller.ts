import { ListHeaderData } from "@/types"
import VsTAN from "../../../abi/USG/VsTAN.json"
import { LockData } from "../tg_usd/tg_usd_type"
import LockUI from "../../../abi/USG/LockUI.json"
import { VSTAN_CONTRACT } from "./rs_tan_repository"
import { Abi, Address, Hex, WalletClient } from "viem"
import { USG_CONTRACT } from "../tg_usd/tg_usd_repository"
import { executeChainViewUnique, executeContractCall, waitForTransaction } from "@/services/service_rpc"

export async function getVsTanData(user: Address) {
  return await executeChainViewUnique<LockData>(LockUI.abi as Abi, LockUI.bytecode as Hex, [
    user,
    VSTAN_CONTRACT.TAN,
    VSTAN_CONTRACT.VSTAN,
    VSTAN_CONTRACT.TAN_LP,
    USG_CONTRACT.USG,
    VSTAN_CONTRACT.ETH_ORACLE,
    USG_CONTRACT.USG_ORACLE,
    VSTAN_CONTRACT.DAO,
  ])
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
