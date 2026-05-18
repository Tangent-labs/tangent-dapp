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

/**
 * When the reward stream hasn't started yet (rewardToken's current APR is 0),
 * the projected APR is displayed as main APR (current is hidden).
 */
export function computeDisplayAPR(
  apr: number | undefined,
  projectedApr: number | undefined,
  currentAPRDetails: Record<string, number | undefined> | undefined,
  rewardToken: string | undefined
): number | undefined {
  if (currentAPRDetails && rewardToken && projectedApr !== undefined && projectedApr !== -1) {
    const rewardApr = currentAPRDetails[rewardToken]
    if (rewardApr === undefined || rewardApr === null) return apr
    return Number(rewardApr) === 0 ? projectedApr : apr
  }

  return apr
}
