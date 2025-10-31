const ROUTE_TO_FEATURE: Record<string, string> = {
  swap: "Swap",
  earn: "Earn",
  stake: "Savings",
  tasks: "Tasks",
  dashboard: "Dashboard",
  "tan/lock": "Tan",
  "tan/split": "Tan",
  "tan/unlock": "Tan",
  "tan/claim": "Tan",
  "tan/merge": "Tan",
  harvet: "Harvest",
}

export const mapRouteToFeature = (route: string): string => {
  return ROUTE_TO_FEATURE[route] ?? "Markets"
}
