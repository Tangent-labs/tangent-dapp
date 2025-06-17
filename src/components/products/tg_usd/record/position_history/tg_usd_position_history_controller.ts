import { ListHeaderData } from "@/types"
import { UserPosition } from "../../tg_usd_type"

export const userPositionListHeaders: ListHeaderData[] = [
  { label: "Action", key: "label" },
  { label: "Amount Collat", key: "collatAmount" },
  { label: "Amount USG", key: "usgAmount" },
  { label: "Time", key: "date" },
  { label: "Tx", key: "txHash" },
]

export const mapUserData = (pos: UserPosition[]) => {
  if (!pos || pos.length === 0) return []

  return [...pos].sort((a: UserPosition, b: UserPosition) => {
    if (a.date > b.date) return -1
    if (a.date < b.date) return 1

    return 0
  })
}

export const formatActionLabel = (event: string) => {
  switch (event.toLowerCase()) {
    case "market_borrow":
      return "Borrow"
    case "market_deposit":
      return "Deposit"
    case "market_zap_deposit":
      return "Zap Deposit"
    case "market_deposit_and_borrow":
      return "Deposit and Borrow"
    case "market_zap_deposit_and_borrow":
      return "Zap Deposit and Borrow"
    case "market_withdraw":
      return "Withdraw"
    case "market_repay":
      return "Repay"
    case "market_repay_and_withdraw":
      return "Repay and Withdraw"
    case "market_zap_repay":
      return "ZapRepay"
    case "market_zap_repay_and_withdraw":
      return "Zap Repay and Withdraw"
    case "market_leverage":
      return "Leverage"
    case "market_zap_leverage":
      return "Zap Leverage"
    case "market_liquidate":
      return "Liquidation"
    case "market_self_liquidate":
      return "Self Liquidation"
    default:
      return "UnknownEvent"
  }
}
