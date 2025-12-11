import { ListHeaderData } from "@/types"
import { UserTask } from "../../usg_type"
import { Abi, Address, Hex } from "viem"
import { executeChainViewUnique } from "@/services/service_rpc"
import TaskListUI from "../../../../../abi/USG/TaskListUI.json"

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
  { label: "Assets", key: "asset" },
  { label: "Protocol", key: "protocol" },
  { label: "Action", key: "action" },
  { label: "Pts/Day/USD", key: "pointRate" },
  { label: "Owned", key: "balanceUsd" },
  { label: "Points", key: "points" },
  { label: "Status", key: "status" },
]

export const voteListHeaders: ListHeaderData[] = [
  { label: "Organisation", key: "organisation" },
  { label: "Protocol", key: "protocol" },
  { label: "Vote", key: "vote" },
  { label: "Pts/VotingPower", key: "pointRate" },
  { label: "Points", key: "points" },
]

export async function getUserBalancesAndDebtForLpTasks(address: Address, markets: Address[], tokens: Address[]) {
  return await executeChainViewUnique<bigint[]>(TaskListUI.abi as Abi, TaskListUI.bytecode as Hex, [address, markets, tokens])
}
