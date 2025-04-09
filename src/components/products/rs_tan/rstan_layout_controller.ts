import { Abi, Address, Hex, WalletClient } from "viem"
import LockUI from "../../../abi/tgusd/LockUI.json"
import RsTan from "../../../abi/tgusd/RsTanService.json"
import { executeChainViewUnique, executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { ListHeaderData } from "@/types"
import { LockData } from "../tg_usd/tg_usd_type"
import { RSTAN_CONTRACT } from "./rs_tan_repository"

export async function getRsTanData(user: Address) {
  return await executeChainViewUnique<LockData>(LockUI.abi as Abi, LockUI.bytecode as Hex, [
    user,
    RSTAN_CONTRACT.RSTAN_SERVICE,
    RSTAN_CONTRACT.RSTAN_ERC_721,
    RSTAN_CONTRACT.TAN,
  ])
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
    address: RSTAN_CONTRACT.RSTAN_SERVICE,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export const doTogglePermaLock = async (tokenId: bigint, walletClient: WalletClient) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: "togglePermaLock",
    args: [tokenId],
    address: RSTAN_CONTRACT.RSTAN_SERVICE,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
