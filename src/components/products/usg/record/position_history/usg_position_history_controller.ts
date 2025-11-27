import { ListHeaderData } from "@/types"
import { UserPosition } from "../../usg_type"

export const userPositionListHeaders: ListHeaderData[] = [
  { label: "Action", key: "label" },
  { label: "Amount Collat", key: "collatAmount" },
  { label: "Amount USG", key: "usgAmount" },
  { label: "Time", key: "date" },
  { label: "Tx", key: "txHash" },
]

export const sortUserData = (pos: UserPosition[]) => {
  if (!pos || pos.length === 0) return []

  return [...pos].sort((a: UserPosition, b: UserPosition) => {
    if (a.date > b.date) return -1
    if (a.date < b.date) return 1

    return 0
  })
}

export const formatActionLabel = (event: string) => {
  switch (event.toLowerCase()) {
    case "borrow":
      return "Borrow"
    case "deposit":
      return "Deposit"
    case "zap_deposit":
      return "Zap Deposit"
    case "deposit_and_borrow":
      return "Deposit and Borrow"
    case "zap_deposit_and_borrow":
      return "Zap Deposit and Borrow"
    case "withdraw":
      return "Withdraw"
    case "repay":
      return "Repay"
    case "repay_and_withdraw":
      return "Repay and Withdraw"
    case "zap_repay":
      return "ZapRepay"
    case "zap_repay_and_withdraw":
      return "Zap Repay and Withdraw"
    case "leverage":
      return "Leverage"
    case "zap_leverage":
      return "Zap Leverage"
    case "liquidate":
      return "Liquidation"
    case "self_liquidate":
      return "Self Liquidation"
    default:
      return "UnknownEvent"
  }
}
