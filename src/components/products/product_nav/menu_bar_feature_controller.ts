const ROUTE_TO_FEATURE: Record<string, string> = {
  swap: "Swap",
  earn: "Earn",
  stake: "Savings",
  dashboard: "Dashboard",
  referral: "Referral",
  tasks: "Tasks",
  boosts: "Boosts",
  "tan/lock": "Tan",
  "tan/split": "Tan",
  "tan/unlock": "Tan",
  "tan/claim": "Tan",
  "tan/merge": "Tan",
  harvest: "Harvest",
  claim: "Claim",
}

export const mapRouteToFeature = (route: string): string => {
  return ROUTE_TO_FEATURE[route] ?? "Markets"
}

export const isOnMarket = (path: string) => {
  return (
    path === "/" ||
    path.includes("deposit") ||
    path.includes("withdraw") ||
    path.includes("leverage") ||
    path.includes("liquidate") ||
    path.includes("repay") ||
    path.includes("borrow")
  )
}
