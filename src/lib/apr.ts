export type RewardEntry = [token: string, apr: number]

export type ParsedAPRDetails = {
  baseAPY: number | undefined
  rewards: RewardEntry[]
}

export function parseAPRDetails(details: Record<string, number | undefined> | undefined): ParsedAPRDetails {
  const baseAPY = typeof details?.APY === "number" && details.APY > 0 ? details.APY : undefined
  const rewards = Object.entries(details ?? {})
    .filter((entry): entry is RewardEntry => entry[0] !== "APY" && typeof entry[1] === "number")
    .sort((a, b) => b[1] - a[1])
  return { baseAPY, rewards }
}
