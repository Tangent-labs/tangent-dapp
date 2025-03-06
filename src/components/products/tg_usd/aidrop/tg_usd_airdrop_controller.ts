import { ListHeaderData } from "@/types"
import { AirdropTask } from "../tg_usd_type"

export const mapAirdropData = (tasks: AirdropTask[]) => {
  return tasks
}

export const airdropListHeaders: ListHeaderData[] = [
  { label: "Assets", key: "assets" },
  { label: "Protocol", key: "protocol" },
  { label: "Action", key: "action" },
  { label: "Points per day", key: "ptsPerDay" },
  { label: "Status", key: "status" },
  { label: "Points", key: "totalPts" },
]
