import { ListHeaderData } from "@/types"
import { AirdropTask } from "../tg_usd_type"

export const mapAirdropData = (tasks: AirdropTask[]) => {
  if (!tasks || tasks.length === 0) return []

  return [...tasks].sort((a: AirdropTask, b: AirdropTask) => {
    if (a.status === "ongoing" && b.status !== "ongoing") return -1
    if (a.status !== "ongoing" && b.status === "ongoing") return 1

    if (a.status === "ongoing" && b.status === "ongoing") {
      return b.ptsPerDay - a.ptsPerDay
    }

    return 0
  })
}

export const airdropListHeaders: ListHeaderData[] = [
  { label: "Assets", key: "assets" },
  { label: "Protocol", key: "protocol" },
  { label: "Action", key: "action" },
  { label: "Points per day", key: "ptsPerDay" },
  { label: "Status", key: "status" },
  { label: "Points", key: "totalPoints" },
]
