import { ListHeaderData } from "@/types"

export const tgUsdEarnListHeaders: ListHeaderData[] = [
  { label: "Asset", key: "asset" },
  {
    label: "Protocol",
    key: "protocol",
  },
  {
    label: "APR",
    key: "apr",
    indicator:
      "Annualized cost of borrowing, expressed as a percentage, which includes the interest rate and any additional fees or costs associated with the loan",
  },
  { label: "Points", key: "points" },
]
