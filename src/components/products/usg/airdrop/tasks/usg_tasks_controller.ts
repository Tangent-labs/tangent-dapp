import { ExistingAsset, ListHeaderData } from "@/types"
import { UserTask } from "../../usg_type"
import { Abi, Address, Hex } from "viem"
import { executeChainViewUnique } from "@/services/service_rpc"
import TaskListUI from "../../../../../abi/USG/TaskListUI.json"
import { USG_CONTRACT } from "../../usg_repository"

export const mapAirdropData = (tasks: UserTask[]) => {
  if (!tasks || tasks.length === 0) return []

  return [...tasks].sort((a: UserTask, b: UserTask) => {
    if (a.status && !b.status) return -1
    if (!a.status && b.status) return 1

    if (a.status && !b.status) {
      return b.pointRate - a.pointRate
    }
    return 0
  })
}

export const lpListHeaders: ListHeaderData[] = [
  { label: "Action", key: "action" },
  { label: "Protocol", key: "protocol" },
  { label: "Pts/Day/USD", key: "pointRate" },
  { label: "Owned", key: "balanceUsd" },
  { label: "Points", key: "points" },
  { label: "Status", key: "status" },
]

export const voteListHeaders: ListHeaderData[] = [
  { label: "Action", key: "action" },
  { label: "Protocol", key: "protocol" },
  { label: "Pts/Epoch/Ve", key: "pointRate" },
  { label: "Points", key: "points" },
  { label: "Current vote", key: "lastVote" },
]

export async function getUserBalancesAndDebtForLpTasks(address: Address, markets: Address[], tokens: Address[]) {
  return await executeChainViewUnique<bigint[]>(TaskListUI.abi as Abi, TaskListUI.bytecode as Hex, [address, markets, tokens, USG_CONTRACT.MARKET_VIEWER])
}

export const formatToken = (token: string): ExistingAsset => {
  if (token.includes("LP USDe") || token.includes("PT USDe") || token.includes("YT USDe")) {
    return "USDe" as ExistingAsset
  }

  if (token.includes("LP sUSDe") || token.includes("PT sUSDe") || token.includes("YT sUSDe")) {
    return "sUSDe" as ExistingAsset
  }

  return token.replaceAll("_", "-") as ExistingAsset
}
