import { ListHeaderData } from "@/types"
import { EarnProtocolInput } from "../tg_usd_type"
import { Address } from "viem"

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

export const mapTasks = (tasks: EarnProtocolInput[], poolsData?: Array<{ address: Address; gaugeCrvApy: Array<number>; gaugeFutureCrvApy: Array<number> }>) => {
  return tasks.map((t) => {
    const currentPool = poolsData?.find((el) => el.address === t.address) || null

    const currentAPR = currentPool?.gaugeCrvApy.reduce((sum, n) => sum + n, 0) || 0
    const projectedAPR = currentPool?.gaugeFutureCrvApy.reduce((sum, n) => sum + n, 0) || 0

    return {
      name: t.name,
      asset: t.asset,
      link: t.link,
      protocolName: t.protocolName,
      actionLabel: t.actionLabel,
      bonusPts: t.bonusPts,
      address: t.address,
      currentAPR,
      projectedAPR,
    }
  })
}
