import { ListHeaderData } from "@/types"
import { Abi, Hex, WalletClient } from "viem"
import VsTAN from "../../../abi/USG/VsTAN.json"
import { LockData } from "../usg/usg_type"
import LockUI from "../../../abi/USG/LockUI.json"
import { PERMA_LOCK_END_TIME, VSTAN_CONTRACT } from "./rs_tan_repository"
import { USG_CONTRACT } from "../usg/usg_repository"
import { executeChainViewUnique, executeContractCall, waitForTransaction } from "@/services/service_rpc"

// endLockTime is typed string but arrives as a decoded uint48 bigint at runtime — always compare via BigInt
export const isPermaLocked = (position: { endLockTime?: string | bigint } | undefined): boolean =>
  position?.endLockTime != null && BigInt(position.endLockTime) === BigInt(PERMA_LOCK_END_TIME)

// chainTimestamp comes from the last read block : a local fork can run days behind the wall clock,
// and the contract compares against block.timestamp
export const isExpired = (position: { endLockTime?: string | bigint } | undefined, chainTimestamp: bigint | undefined): boolean => {
  // Falsy rather than a null check on purpose : the lock form represents a not-yet-created position
  // with endLockTime "", and BigInt("") is 0n, which would read as expired
  if (!chainTimestamp || !position?.endLockTime || isPermaLocked(position)) return false

  return chainTimestamp > BigInt(position.endLockTime)
}

export async function getVsTanData(user: string) {
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
