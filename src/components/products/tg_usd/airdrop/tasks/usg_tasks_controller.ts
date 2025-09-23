import { ListHeaderData } from "@/types"
import { UserTask } from "../../tg_usd_type"

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
  { label: "Status", key: "status" },
  { label: "Points", key: "points" },
]

export const voteListHeaders: ListHeaderData[] = [
  { label: "Organisation", key: "organisation" },
  { label: "Protocol", key: "protocol" },
  { label: "Vote", key: "vote" },
  { label: "Pts/VotingPower", key: "pointRate" },
  { label: "Points", key: "points" },
]
